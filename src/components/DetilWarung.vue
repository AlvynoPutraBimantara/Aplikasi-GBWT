<template>
  <div class="warung-container">
    <div class="warung-header">
      <h1>{{ warung.NamaWarung }}</h1>
      <img
        :src="fullImageUrl"
        alt="Warung Image"
        class="warung-image"
      />
      <p class="warung-info">Telp: {{ warung.Telp }}</p>
      <p class="warung-info">Alamat: {{ warung.Alamat }}</p>
      <div class="button-container">
        <button @click="goToWhatsApp" class="whatsapp-button">
          Kontak via WhatsApp <font-awesome-icon icon="fa-brands fa-whatsapp" />
        </button>
      </div>
    </div>
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
      warung: {},
      products: [],
      searchQuery: "",
      selectedSortOption: "",
      productPurchaseCounts: {},
      baseUrl: process.env.VUE_APP_API_BASE_URL || "http://192.168.100.8:3001",
      productServiceUrl: process.env.VUE_APP_PRODUCT_SERVICE_URL || "http://192.168.100.8:3002"
    };
  },
  computed: {
    fullImageUrl() {
      if (!this.warung.imageUrl) return null;
      // If it's already a full URL (for backward compatibility)
      if (this.warung.imageUrl.startsWith('http')) {
        return this.warung.imageUrl;
      }
      // Construct full URL from relative path
      return `${this.baseUrl}${this.warung.imageUrl}`;
    },
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
    }
  },
  methods: {
    async loadWarung() {
      const userId = this.$route.params.id;
      try {
        const response = await axios.get(`${this.baseUrl}/user/${userId}`);
        const warungData = response.data;
        this.warung = warungData;
        this.loadProducts(warungData.NamaWarung);
      } catch (error) {
        console.error("Error loading warung details:", error);
        if (error.message.includes('Network Error')) {
          alert('Cannot connect to server. Please check: \n1. Your network connection\n2. Server is running\n3. Correct server address');
        }
      }
    },
    async loadProducts(warungName) {
      try {
        const response = await axios.get(`${this.productServiceUrl}/products`);
        this.products = response.data.filter(
          (product) => product.Pedagang === warungName
        );
      } catch (error) {
        console.error("Error loading products:", error);
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
      if (!product.imageUrl) return "default-image.jpg";
      // If it's already a full URL (for backward compatibility)
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      // Construct full URL from relative path
      return `${this.productServiceUrl}${product.imageUrl}`;
    },
    goToProductPage(productId) {
      this.$router.push({ name: "DetilProduk", params: { id: productId } });
    },
    sortProducts() {
      // Sorting is handled by computed property
    },
    goToWhatsApp() {
      const whatsappUrl = `https://wa.me/${this.warung.Telp}`;
      window.open(whatsappUrl, "_blank");
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
  },
  async mounted() {
    await this.loadWarung();
    await this.fetchPurchaseCounts();
  },
};
</script>

<style scoped>
.warung-container {
  padding: 1rem;
}

.warung-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.warung-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  margin: 0 auto 1rem;
  border-radius: 8px;
}

.warung-info {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.button-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.whatsapp-button {
  display: inline-flex;
  align-items: center;
  background-color: #25d366;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.whatsapp-button:hover {
  background-color: #1ebe57;
}

.top-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-container {
  margin: 0;
}

.search-container input {
  padding: 0.75rem;
  font-size: 1rem;
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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
  .warung-image {
    width: 20%;
    margin-bottom: 20px;
  }

  .top-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 20px;
  }

  .search-container {
    flex: 1;
    text-align: left;
  }

  .search-container input {
    max-width: 300px;
  }

  .select-container {
    max-width: 300px;
  }

  .products-container {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

/* Large desktop styles */
@media (min-width: 1200px) {
  .products-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>