<template>
  <div>
    <UserHeader />
    <div class="container">
      <div class="product-details">
        <div class="detail-item">
          <h1>{{ product.Nama }}</h1>
        </div>
        <div class="detail-item">
          <p>Harga: {{ product.Harga }}</p>
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
          <button @click="addToCart" :disabled="isOwnProduct">
            Tambah ke Keranjang
          </button>
          <p v-if="isOwnProduct">You cannot order your own product.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserHeader from "./UserHeader.vue";
import axios from "axios";

export default {
  components: {
    UserHeader,
  },
  data() {
    return {
      product: {},
      quantity: 1,
      user: JSON.parse(localStorage.getItem("user-info")),
    };
  },
  computed: {
    isOwnProduct() {
      return this.product.Pedagang === this.user.NamaWarung;
    },
  },
  async mounted() {
    const productId = this.$route.params.id;
    try {
      const response = await axios.get(
        `http://localhost:3000/DataProduk/${productId}`
      );
      this.product = response.data;
    } catch (error) {
      console.error("Error loading product details:", error);
    }
  },
  methods: {
    async addToCart() {
      if (
        this.quantity > 0 &&
        this.quantity <= this.product.Stok &&
        !this.isOwnProduct
      ) {
        try {
          await this.$store.dispatch("addToCart", {
            id: this.product.id,
            name: this.product.Nama,
            price: parseFloat(this.product.Harga),
            quantity: this.quantity,
          });
          alert("Product successfully added to cart!");
        } catch (error) {
          console.error("Error adding to cart:", error);
          alert("Failed to add product to cart. Please try again.");
        }
      } else {
        alert("Invalid quantity selected");
      }
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

quantity-form input {
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
  margin-left: auto;
}

.quantity-form button:hover {
  background-color: #218838;
}
</style>
