<template>
  <div>
    <div class="container">
      <div class="product-details">
        <img :src="product.imageUrl" alt="Product Image" class="product-image" />
        <div class="detail-item">
          <h1>{{ product.Nama }}</h1>
        </div>
        <div class="detail-item">
          <p :class="{ 'strikethrough': product.Harga_diskon }">
            Harga: {{ formatPrice(product.Harga) }}
          </p>
          <p v-if="product.Harga_diskon" class="discount-price">
            Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
          </p>
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
          <div class="form-row">
            <label for="quantity">Jumlah:</label>
            <div class="quantity-controls">
              <button 
                @click="decrementQuantity" 
                :disabled="quantity <= 1 || !product.Stok" 
                class="decrement-btn"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                v-model.number="quantity"
                min="1"
                :max="product.Stok"
                @input="validateQuantity"
                class="quantity-input"
                :disabled="!product.Stok"
              />
              <button 
                @click="incrementQuantity" 
                :disabled="quantity >= product.Stok || !product.Stok" 
                class="increment-btn"
              >
                +
              </button>
            </div>
            <button 
              @click="addToCart" 
              :disabled="(isOwnProduct && user) || !product.Stok" 
              class="add-to-cart-btn"
            >
              Tambah ke Keranjang
            </button>
          </div>
          <p v-if="isOwnProduct && user" class="warning-message">
            Anda tidak dapat memesan produk anda sendiri.
          </p>
          <p v-if="!product.Stok" class="warning-message">
            Stok habis.
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
      product: {},
      quantity: 1,
      user: JSON.parse(localStorage.getItem("user-info")),
      guestId: localStorage.getItem("guestId") || null,
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
    this.product = {
      ...response.data,
      imageUrl: response.data.imageUrl 
        ? response.data.imageUrl 
        : `http://localhost:3002/images/${response.data.id}`
    };
    this.product.Harga = parseFloat(this.product.Harga);
    if (this.product.Harga_diskon) {
      this.product.Harga_diskon = parseFloat(this.product.Harga_diskon);
    }
  } catch (error) {
    console.error("Error loading product details:", error);
  }
},
  methods: {
    incrementQuantity() {
      if (this.quantity < this.product.Stok) {
        this.quantity++;
      }
    },
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    validateQuantity() {
      if (this.quantity < 1) {
        this.quantity = 1;
      } else if (this.quantity > this.product.Stok) {
        this.quantity = this.product.Stok;
      }
    },
    generateRandomId() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    },
 async addToCart() {
  try {
    // Add validation for product existence
    if (!this.product || !this.product.id) {
      alert("Product information is missing");
      return;
    }

    // Validate quantity and stock
    if (
      this.quantity <= 0 ||
      !this.product.Stok ||
      this.quantity > this.product.Stok ||
      (this.isOwnProduct && this.user)
    ) {
      alert("Invalid quantity selected or insufficient stock.");
      return;
    }

    // Handle guest users
    if (!this.user && !this.guestId) {
      this.guestId = `guest_${this.generateRandomId()}`;
      localStorage.setItem("guestId", this.guestId);
    }

    // Use user ID for logged-in users, guest ID for guests
    const user = this.user ? this.user.id : this.guestId;
    const payload = {
      user: user,
      itemid: this.product.id,
      name: this.product.Nama,
      price: this.product.Harga_diskon ? parseFloat(this.product.Harga_diskon) : parseFloat(this.product.Harga),
      quantity: this.quantity,
      pedagang: this.product.Pedagang,
    };

    // First check if product already exists in cart
    const cartResponse = await axios.get(`http://localhost:3004/cart?user=${encodeURIComponent(user)}`);
    const existingItem = cartResponse.data.find(item => item.itemid === this.product.id);

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = existingItem.quantity + this.quantity;
      if (newQuantity > this.product.Stok) {
        alert(`Cannot add more than ${this.product.Stok} items total`);
        return;
      }
      
      const updateResponse = await axios.put(`http://localhost:3004/cart/${existingItem.id}`, {
        quantity: newQuantity
      });
      
      if (updateResponse.status === 200) {
        this.product.Stok -= this.quantity;
        alert("Item quantity updated in cart!");
        this.$router.push("/cart");
      }
    } else {
      // Add new item to cart
      const addResponse = await axios.post("http://localhost:3004/cart", payload);
      
      if (addResponse.status === 201) {
        this.product.Stok -= this.quantity;
        alert("Pesanan berhasil dimasukkan dalam keranjang!");
        this.$router.push("/cart");
      }
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Failed to add product to cart. Please try again.");
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

.strikethrough {
  text-decoration: line-through;
  color: gray;
}

.discount-price {
  color: red;
  font-weight: bold;
}

.quantity-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.form-row label {
  min-width: 80px;
  text-align: right;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
}

.decrement-btn {
  width: 32px;
  height: 32px;
  border: 1px solid black;
  background-color: red;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decrement-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.decrement-btn:not(:disabled):hover {
  background-color: #c82333;
  border-color: #c82333;
}

.increment-btn {
  width: 32px;
  height: 32px;
  border: 1px solid black;
  background-color: green;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.increment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.increment-btn:not(:disabled):hover {
  background-color: #218838;
  border-color: #218838;
}

.quantity-input {
  width: 50px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.add-to-cart-btn {
  padding: 10px 18px;
  background-color: green;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-left: auto; /* Changed from fixed margin to auto */
}

.add-to-cart-btn:hover {
  background-color: #218838;
}

.add-to-cart-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.warning-message {
  color: #dc3545;
  font-size: 14px;
  margin-left: 95px;
  margin-top: -5px;
}
</style>