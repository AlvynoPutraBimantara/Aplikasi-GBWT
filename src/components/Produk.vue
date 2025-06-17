<template>
  <div class="produk-container">
    <div class="top-container">
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari Produk..." 
          class="search-input"
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
        class="product-card"
        v-for="(product, index) in sortedAndFilteredProducts"
        :key="index"
        @click="goToProductPage(product.id)"
      >
        <div class="card-image-container">
          <img
            :src="getProductImageUrl(product)"
            alt="Product Image"
            class="product-image"
            @error="handleImageError"
          />
          <div v-if="product.Harga_diskon" class="discount-badge">
            DISKON
          </div>
        </div>
        <div class="card-content">
          <h5 class="product-title">{{ product.Nama }}</h5>
          <div class="price-container">
            <p class="product-price" :class="{ 'strikethrough': product.Harga_diskon }">
              {{ formatPrice(product.Harga) }}
            </p>
            <p v-if="product.Harga_diskon" class="product-discount-price">
              {{ formatPrice(product.Harga_diskon) }}
            </p>
          </div>
          <p class="product-stock" :class="{ 'in-stock': product.Stok > 0, 'out-of-stock': product.Stok <= 0 }">
            {{ product.Stok > 0 ? "Tersedia" : "Kosong" }}
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
      productPurchaseCounts: {},
      baseUrl: process.env.VUE_APP_PRODUCT_SERVICE_URL || "http://192.168.100.8:3002",
      defaultImage: "https://via.placeholder.com/300x200?text=No+Image",
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
    async fetchProducts() {
      try {
        const response = await axios.get(`${this.baseUrl}/products`, {
          timeout: 5000,
        });

        this.products = response.data.map((product) => ({
          ...product,
          imageUrl: product.imageUrl || this.defaultImage,
        }));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        this.showNetworkError(error);
      }
    },

    async fetchPurchaseCounts() {
      try {
        const response = await axios.get("http://192.168.100.8:3005/transactions-history-items");
        const items = response.data;
        this.productPurchaseCounts = items.reduce((acc, item) => {
          acc[item.itemid] = (acc[item.itemid] || 0) + 1;
          return acc;
        }, {});
      } catch (error) {
        console.error("Failed to fetch purchase counts:", error);
      }
    },

    getProductImageUrl(product) {
      if (product.imageUrl) return product.imageUrl;
      if (product.images && product.images.length > 0) {
        return `${this.baseUrl}/images/${product.id}`;
      }
      return this.defaultImage;
    },

    handleImageError(event) {
      event.target.src = this.defaultImage;
    },

    showNetworkError(error) {
      let message = "Terjadi kesalahan jaringan";
      if (error.response) {
        message = `Server error: ${error.response.status}`;
      } else if (error.request) {
        message = "Tidak dapat terhubung ke server. Periksa:\n1. Jaringan Anda\n2. Server sedang berjalan";
      } else {
        message = `Error: ${error.message}`;
      }
      alert(message);
    },

    formatPrice(price) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(price);
    },

    goToProductPage(productId) {
      this.$router.push(`/DetilProduk/${productId}`);
    },
  },
  mounted() {
    this.fetchProducts();
    this.fetchPurchaseCounts();
  },
};
</script>

<style scoped>
.produk-container {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.top-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-container {
  margin: 20px 0;
  text-align: left;
}

.search-input {
  padding: 12px;
  font-size: 16px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.select-container {
  padding: 0.75rem;
  font-size: 1rem;
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
}

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  position: relative;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #ff4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.card-content {
  padding: 12px;
}

.product-title {
   font-size: 14px;
    font-weight: bolder;
  margin: 0 0 1px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-clamp: 2;
  min-height: 40px;
}

.price-container {
  margin: 2px 0;
}

.product-price {
  font-size: 14px;
  color: #757575;
  margin: 0;
}

.product-discount-price {
  font-size: 16px;
  color: #ff4444;
  font-weight: bold;
  margin: 2px 0 0 0;
}

.strikethrough {
  text-decoration: line-through;
}

.product-stock {
  font-size: 12px;
  margin: 0;
}

.in-stock {
  color: #00c853;
}

.out-of-stock {
  color: #ff4444;
}

/* Desktop styles */
@media (min-width: 768px) {
  .top-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .search-container {
    flex: 1;
    margin: 0;
    margin-right: 1rem;
  }

  .search-input {
    max-width: 300px;
  }

  .select-container {
    max-width: 250px;
  }

  .products-container {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
  }

  .product-title {
     font-size: 14px;
    font-weight: bolder;
  }

  .product-price {
    font-size: 15px;
  }

  .product-discount-price {
    font-size: 18px;
  }
}

/* Large desktop styles */
@media (min-width: 1200px) {
  .products-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .search-container {
    margin: 20px 0;
  }

  .search-input {
    max-width: 100%;
    padding: 12px;
  }
}
</style>