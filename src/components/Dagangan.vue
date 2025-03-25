<template>
  <div>
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Cari Produk..." />
    </div>
    <div class="products-container">
      <div
        class="product-card"
        v-for="(product, index) in filteredProducts"
        :key="index"
        @click="goToProductPage(product.id)"
        style="width: 15rem; cursor: pointer; margin: 10px"
      >
        <div class="card-body">
          <img
            :src="product.imageUrl"
            alt="Product Image"
            style="width: 100%; height: auto"
          />
          <h5 class="card-title">{{ product.Nama }}</h5>
          <!-- Display Harga with strikethrough and gray color if Harga_diskon exists -->
          <p class="card-text" :class="{ 'strikethrough': product.Harga_diskon }">
            Harga: {{ formatPrice(product.Harga) }}
          </p>
          <!-- Display Harga_diskon in red if it exists -->
          <p v-if="product.Harga_diskon" class="card-text discount-price">
            Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
          </p>
          <p class="card-text">Kategori: {{ product.Kategori }}</p>
          <p class="card-text">Keterangan: {{ product.Keterangan }}</p>
          <p class="card-text">Stok: {{ product.Stok }}</p>
        </div>
      </div>
    </div>
    <div class="button-container">
      <router-link to="/TambahDagangan" class="btn-add">Tambah Produk</router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      products: [],
      searchQuery: "",
      user: null, // Store logged-in user data
    };
  },
  methods: {
    // Fetch the logged-in user's profile
    async fetchUser() {
      try {
        const userId = JSON.parse(localStorage.getItem("user-info")).id; // Get user ID from localStorage
        const response = await axios.get(`http://localhost:3001/user/${userId}`);
        this.user = response.data; // Store user data
      } catch (error) {
        console.error("Error fetching user profile:", error);
        this.$router.push({ name: "Login" }); // Redirect to login on error
      }
    },
    // Load products and filter based on user's "NamaWarung"
    async loadProducts() {
      if (this.user && this.user.NamaWarung) {
        try {
          const response = await axios.get("http://localhost:3002/products");
          this.products = response.data
            .filter((product) => product.Pedagang === this.user.NamaWarung)
            .map((product) => ({
              ...product,
              imageUrl: product.imageUrl
                ? `http://localhost:3002${product.imageUrl}`
                : "default-image.jpg", // Placeholder image if none provided
            }));
        } catch (error) {
          console.error("Error loading products:", error);
        }
      }
    },
    // Navigate to product update page
    goToProductPage(productId) {
      this.$router.push({
        name: "UserUpdateProduk",
        params: { id: productId },
      });
    },
    // Format currency
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
  },
  computed: {
    // Filter products based on search query
    filteredProducts() {
      return this.products.filter((product) =>
        product.Nama.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  async mounted() {
    await this.fetchUser(); // Fetch logged-in user's profile
    await this.loadProducts(); // Load and filter products
  },
};
</script>

<style scoped>
.search-container {
  margin: 20px;
  text-align: left;
}

.search-container input {
  padding: 10px;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.products-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}

.product-card {
  border: 1px solid #ccc;
  padding: 0;
  margin: 10px;
  width: 200px;
  display: inline-block;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: 1px 1px 1px black;
}

.card-body {
  padding: 10px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.card-text {
  margin: 5px 0;
}

.strikethrough {
  text-decoration: line-through;
  color: gray;
}

.discount-price {
  color: red;
  font-weight: bold;
}

.product-card img {
  width: 100%;
  height: auto;
}

.button-container {
  text-align: center;
  margin-top: 20px;
}

.btn-add {
  padding: 10px 20px;
  font-size: 16px;
  text-decoration: none;
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
}

.btn-add:hover {
  background-color: #0056b3;
}
</style>