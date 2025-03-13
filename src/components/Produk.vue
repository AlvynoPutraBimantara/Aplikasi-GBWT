<template>
  <div>
    <div class="top-container">
      <div class="search-container">
        <input type="text" v-model="searchQuery" placeholder="Cari Produk..." />
      </div>
      <select
        class="select-container"
        v-model="selectedSortOption"
        @change="sortProducts"
      >
        <option value="">Urutkan Berdasarkan...</option>
        <option value="alphabetAsc">Alfabet: A ke Z</option>
        <option value="alphabetDesc">Alfabet: Z ke A</option>
        <option value="priceAsc">Harga: Termurah ke Termahal</option>
        <option value="priceDesc">Harga: Termahal ke Termurah</option>
        <option value="availability">Ketersediaan</option>
        <option value="mostPurchased">Paling Banyak Dibeli</option>
      </select>
    </div>

    <div class="products-container">
      <div
        class="card"
        v-for="(product, index) in sortedAndFilteredProducts"
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
          <p class="card-text">Harga: {{ formatPrice(product.Harga) }}</p>
          <p class="card-text">
            {{ product.Stok > 0 ? "(Tersedia)" : "(Kosong)" }}
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
      products: [],
      searchQuery: "",
      selectedSortOption: "",
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter((product) =>
        product.Nama.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    sortedAndFilteredProducts() {
      let sortedProducts = [...this.filteredProducts];
      if (this.selectedSortOption === "alphabetAsc") {
        sortedProducts.sort((a, b) => a.Nama.localeCompare(b.Nama));
      } else if (this.selectedSortOption === "alphabetDesc") {
        sortedProducts.sort((a, b) => b.Nama.localeCompare(a.Nama));
      } else if (this.selectedSortOption === "priceAsc") {
        sortedProducts.sort((a, b) => a.Harga - b.Harga);
      } else if (this.selectedSortOption === "priceDesc") {
        sortedProducts.sort((a, b) => b.Harga - a.Harga);
      } else if (this.selectedSortOption === "availability") {
        sortedProducts.sort((a, b) => b.Stok - a.Stok);
      }
      return sortedProducts;
    },
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get("http://localhost:3002/products");
        this.products = response.data.map((product) => ({
          ...product,
          imageUrl: product.imageUrl
            ? `http://localhost:3002${product.imageUrl}`
            : "default-image.jpg", // Placeholder image if none provided
        }));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    },
    formatPrice(price) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(price);
    },
    goToProductPage(productId) {
      this.$router.push(`/DetilProduk/${productId}`);
    },
  },
  mounted() {
    this.fetchProducts();
  },
};
</script>

<style scoped>
.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px;
}

.search-container {
  flex: 1;
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

.select-container {
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

.card:hover {
  box-shadow: 1px 1px 1px black;
}

.card-body {
  padding: 20px;
}

.card-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.card-text {
  margin: 5px 0;
}
</style>
