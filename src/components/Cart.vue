<template>
  <div>
    <h2>Shopping Cart</h2>
    <div v-if="filteredCart.length">
      <table>
        <thead>
          <tr>
            <th>Warung</th>
            <th>Produk</th>
            <th>Harga</th>
            <th>Jumlah</th>
            <th>Subtotal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredCart" :key="item.id">
            <td>{{ item.pedagang }}</td>
            <td>{{ item.name }}</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td>
              <input
                type="number"
                v-model.number="item.quantity"
                @blur="updateQuantity(item)"
                @input="validateQuantity(item)"
                :min="1"
                :max="item.stock"
              />
            </td>
            <td>{{ formatPrice(item.price * item.quantity) }}</td>
            <td>
              <button @click="removeFromCart(item.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Display Warning Message -->
      <p v-if="warningMessage" class="warning">{{ warningMessage }}</p>

      <div>
        <label for="catatan">Catatan:</label>
        <textarea id="catatan" v-model="catatan"></textarea>
      </div>

      <!-- Guest-specific inputs (only shown for non-logged in users) -->
      <div v-if="!user">
        <div>
          <label for="pemesan">Nama Pemesan:</label>
          <input 
            type="text" 
            id="pemesan" 
            v-model="pemesan" 
            required
            placeholder="Masukkan nama Anda"
          >
        </div>
        <div>
          <label for="alamat">Alamat Pengiriman:</label>
          <textarea 
            id="alamat" 
            v-model="alamat" 
            required
            placeholder="Masukkan alamat lengkap pengiriman"
          ></textarea>
        </div>
      </div>

      <p>Total: {{ formatPrice(cartTotalPrice) }}</p>
      <button @click="checkout">Checkout</button>
    </div>
    <div v-else>
      <p>Keranjang Kosong</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      cart: [],
      catatan: "",
      pemesan: "", // For guest name
      alamat: "",  // For guest address
      user: null,
      guestId: null,
      warningMessage: "",
    };
  },
  computed: {
    filteredCart() {
      return this.cart;
    },
    cartTotalPrice() {
      return this.cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },
  methods: {
    async fetchUser() {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        if (userInfo) {
          const userId = userInfo.id;
          const response = await axios.get(`http://localhost:3001/user/${userId}`);
          this.user = response.data;
        } else {
          this.guestId = localStorage.getItem("guestId") || `guest-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("guestId", this.guestId);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    },
    async fetchCart() {
      try {
        const identifier = this.user ? this.user.Nama : this.guestId;
        const response = await axios.get(`http://localhost:3004/cart?user=${identifier}`);
        const cartItems = response.data;

        const promises = cartItems.map(async (item) => {
          try {
            const productResponse = await axios.get(
              `http://localhost:3002/products/${item.itemid}`
            );
            const productData = productResponse.data;

            return {
              ...item,
              name: item.name,
              stock: productData.Stok,
              pedagang: item.pedagang,
            };
          } catch (error) {
            console.error(`Error fetching product data for itemid ${item.itemid}:`, error);
            return { 
              ...item,
              stock: 0,
              name: item.name,
              price: item.price,
              pedagang: item.pedagang
            };
          }
        });

        this.cart = await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    },
    validateQuantity(item) {
      if (item.quantity < 1 || isNaN(item.quantity)) {
        item.quantity = 1;
      } else if (item.quantity > item.stock) {
        item.quantity = item.stock;
        this.showWarning("Maksimal jumlah produk dalam stok tercapai!");
      }
    },
    async updateQuantity(item) {
      if (item.quantity < 1) {
        item.quantity = 1;
      } else if (item.quantity > item.stock) {
        item.quantity = item.stock;
      }

      try {
        await axios.put(`http://localhost:3004/cart/${item.id}`, { quantity: item.quantity });
        console.log("Cart item quantity updated successfully.");
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
      }
    },
    async removeFromCart(itemId) {
      try {
        await axios.delete(`http://localhost:3004/cart/${itemId}`);
        
        const identifier = this.user ? this.user.Nama : this.guestId;
        const response = await axios.get(`http://localhost:3004/cart?user=${identifier}`);
        
        if (response.data.length === 0) {
          await axios.delete(`http://localhost:3004/cart?user=${identifier}`);
        }
        
        this.cart = this.cart.filter((item) => item.id !== itemId);
      } catch (error) {
        console.error("Error removing item from cart:", error);
      }
    },
    async checkout() {
      if (!this.user && !this.guestId) {
        alert("Anda harus login atau melanjutkan sebagai tamu.");
        return;
      }

      // Validate guest inputs if not logged in
      if (!this.user) {
        if (!this.pemesan.trim()) {
          alert("Harap isi nama pemesan untuk tamu.");
          return;
        }
        if (!this.alamat.trim()) {
          alert("Harap isi alamat pengiriman untuk tamu.");
          return;
        }
      }

      const generateRandomId = () => Math.random().toString(36).substr(2, 8).toUpperCase();
      const orders = [];
      const orderIds = {};

      const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

      this.cart.forEach((item) => {
        if (!orderIds[item.pedagang]) {
          orderIds[item.pedagang] = generateRandomId();
        }

        orders.push({
          id: orderIds[item.pedagang],
          orderid: orderIds[item.pedagang],
          itemid: item.itemid,
          name: item.name,
          pedagang: item.pedagang,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          user: this.user ? this.user.Nama : this.guestId,
          Alamat: this.user ? this.user.Alamat : this.alamat,
          pemesan: this.user ? this.user.Nama : this.pemesan,
          catatan: this.catatan,
          timestamp,
        });
      });

      try {
        await axios.post("http://localhost:3003/orders", { orders });
        await axios.delete(`http://localhost:3004/cart?user=${this.user ? this.user.Nama : this.guestId}`);
        this.cart = [];
        alert("Checkout successful!");
        this.$router.push({ name: "Orders" });
      } catch (error) {
        console.error("Error during checkout:", error);
        alert("Checkout failed. Please try again.");
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    showWarning(message) {
      this.warningMessage = message;
      setTimeout(() => {
        this.warningMessage = "";
      }, 3000);
    },
  },
  async mounted() {
    await this.fetchUser();
    await this.fetchCart();
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 4px;
}

th {
  background-color: #f2f2f2;
  text-align: left;
}

td input {
  width: 50px;
}

.warning {
  color: red;
  font-weight: bold;
  margin-top: 5px;
}

div {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input[type="text"],
textarea {
  width: 50%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea {
  min-height: 100px;
  resize: vertical;
}
</style>