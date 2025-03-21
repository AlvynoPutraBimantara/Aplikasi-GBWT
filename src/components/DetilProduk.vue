<template>
  <div>
    <div class="container">
      <div class="product-details">
        <img :src="product.imageUrl" alt="Product Image" class="product-image" />
        <div class="detail-item">
          <h1>{{ product.Nama }}</h1>
        </div>
        <div class="detail-item">
          <p>Harga: {{ formatPrice(product.Harga) }}</p>
        </div>
        <div class="detail-item">
          <p>Kategori: {{ product.Kategori }}</p>
        </div>
        <div class="detail-item">
          <p>Keterangan: {{ product.Keterangan }}</p>
        </div>
        <div class="detail-item">
          <p>Pedagang: {{ product.Pedagang }}</p>
        </div>
        <div class="detail-item">
          <p>Stok: {{ product.Stok }}</p>
        </div>
        <div class="detail-item quantity-form">
          <label for="quantity">Jumlah:</label>
          <input
            type="number"
            id="quantity"
            v-model.number="quantity"
            min="1"
            :max="product.Stok"
          />
          <button @click="addToCart" :disabled="isOwnProduct && user">
            Tambah ke Keranjang
          </button>
          <p v-if="isOwnProduct && user">
            Anda tidak dapat memesan produk anda sendiri.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      product: {}, // Stores the product details
      quantity: 1, // User-selected quantity
      user: JSON.parse(localStorage.getItem("user-info")), // Current logged-in user
      guestId: localStorage.getItem("guestId") || null, // Guest ID
    };
  },
  computed: {
    isOwnProduct() {
      return this.user && this.product.Pedagang === this.user.NamaWarung;
    },
  },
  async mounted() {
    const productId = this.$route.params.id;
    try {
      const response = await axios.get(
        `http://localhost:3002/products/${productId}`
      );
      this.product = response.data;
      this.product.Harga = parseFloat(this.product.Harga); // Ensure Harga is numeric
    } catch (error) {
      console.error("Error loading product details:", error);
    }
  },
  methods: {
    generateRandomId() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    },
    async addToCart() {
      if (
        this.quantity > 0 &&
        this.quantity <= this.product.Stok &&
        !(this.isOwnProduct && this.user)
      ) {
        try {
          // Generate or retrieve guest ID if the user is a guest
          if (!this.user) {
            if (!this.guestId) {
              this.guestId = `Guest_${this.generateRandomId()}`;
              localStorage.setItem("guestId", this.guestId);
            }
          }

          const user = this.user ? this.user.Nama : this.guestId;
          const payload = {
            user: user,
            itemid: this.product.id,
            name: this.product.Nama,
            price: parseFloat(this.product.Harga),
            quantity: this.quantity,
            pedagang: this.product.Pedagang,
          };

          // Add the item to the cart
          const cartResponse = await axios.post("http://localhost:3004/cart", payload);
          console.log("Cart response:", cartResponse.data);

          if (cartResponse.status === 201 || cartResponse.status === 200) {
            // Update the local product stock to reflect the change
            this.product.Stok -= this.quantity;
            alert("Pesanan berhasil dimasukkan dalam keranjang!");
            this.$router.push("/cart");
          } else {
            throw new Error("Unexpected response from the server.");
          }
        } catch (error) {
          console.error("Error adding to cart:", error);
          alert("Failed to add product to cart. Please try again.");
        }
      } else {
        alert("Invalid quantity selected.");
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
  },
};
</script>


<style scoped>
.container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.product-details {
  padding: 20px;
}

.product-image {
  width: 50%;
  height: auto;
  margin-bottom: 20px;
}

.detail-item {
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
}

.detail-item h1 {
  font-size: 48px;
  margin: 0;
}

.detail-item p {
  text-align: left;
  margin: 0;
}

.quantity-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-form label {
  margin-right: 10px;
}

.quantity-form input {
  width: 60px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-right: 10px;
}

.quantity-form button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.quantity-form button:hover {
  background-color: #218838;
}
</style>
