<template>
  <div>
    <div class="category-details">
      <h1>{{ categoryName }}</h1>
      <div class="top-container">
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari Produk..."
          />
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
            <p class="card-text" :class="{ 'strikethrough': product.Harga_diskon }">
              Harga: {{ formatPrice(product.Harga) }}
            </p>
            <p v-if="product.Harga_diskon" class="card-text discount-price">
              Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
            </p>
            <p class="card-text">
              {{ product.Stok > 0 ? "(Tersedia)" : "(Kosong)" }}
            </p>
          </div>
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
      categoryName: "",
      products: [],
      searchQuery: "",
      selectedSortOption: "",
      productPurchaseCounts: {}, // Store purchase counts for each product
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
      } else if (this.selectedSortOption === "mostPurchased") {
        // Sort by purchase count (descending)
        sortedProducts.sort((a, b) => {
          const countA = this.productPurchaseCounts[a.id] || 0;
          const countB = this.productPurchaseCounts[b.id] || 0;
          return countB - countA;
        });
      }
      return sortedProducts;
    },
  },
  methods: {
    async loadCategory() {
      const categoryId = this.$route.params.id;
      try {
        const response = await axios.get("http://localhost:3006/categories");
        const category = response.data.find((cat) => cat.id === categoryId);
        this.categoryName = category ? category.category : "";
        this.loadProducts(category ? category.category : "");
      } catch (error) {
        console.error("Error loading category details:", error);
      }
    },
    async loadProducts(categoryName) {
      try {
        const response = await axios.get("http://localhost:3002/products");
        this.products = response.data
          .filter((product) => product.Kategori === categoryName)
          .map((product) => ({
            ...product,
            imageUrl: product.imageUrl
              ? `http://localhost:3002${product.imageUrl}`
              : "default-image.jpg",
          }));
      } catch (error) {
        console.error("Error loading products:", error);
      }
    },
    async fetchPurchaseCounts() {
      try {
        // Fetch transaction history items
        const response = await axios.get("http://localhost:3005/transactions-history-items");
        const items = response.data;

        // Count how many times each product appears in the transaction history
        this.productPurchaseCounts = items.reduce((acc, item) => {
          acc[item.itemid] = (acc[item.itemid] || 0) + 1;
          return acc;
        }, {});
      } catch (error) {
        console.error("Failed to fetch purchase counts:", error);
      }
    },
    goToProductPage(productId) {
      this.$router.push({ name: "DetilProduk", params: { id: productId } });
    },
    sortProducts() {
      // Sorting is handled by computed property
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
  },
  async mounted() {
    await this.loadCategory();
    await this.fetchPurchaseCounts();
  },
};
</script>

<style scoped>
.category-details {
  padding: 20px;
}

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

.card {
  border: 1px solid #ccc;
  padding: 0;
  margin: 10px;
  width: 200px;
  display: inline-block;
  cursor: pointer;
}

.card:hover {
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

.card img {
  width: 100%;
  height: auto;
}
</style>