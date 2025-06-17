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
      <router-link to="/TambahDagangan" class="btn-add">Tambah Produk</router-link>
    </div>

    <div class="products-container">
      <div
        class="product-card"
        v-for="(product, index) in filteredProducts"
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
      user: null,
      baseUrl: process.env.VUE_APP_PRODUCT_SERVICE_URL || "http://192.168.100.8:3002",
      userServiceUrl: process.env.VUE_APP_USER_SERVICE_URL
        ? process.env.VUE_APP_USER_SERVICE_URL.replace('/user-service', '')
        : "http://192.168.100.8:3001",
      defaultImage: "https://via.placeholder.com/300x200?text=No+Image"
    };
  },
  methods: {
    async fetchUser() {
      try {
        const userInfo = localStorage.getItem("user-info");
        if (!userInfo) throw new Error("User not logged in");

        const userId = JSON.parse(userInfo).id;
        const response = await axios.get(
          `${this.userServiceUrl}/user/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            timeout: 5000
          }
        );
        this.user = response.data;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        this.showNetworkError(error);
        this.$router.push({ name: "Login" });
      }
    },

    async loadProducts() {
      if (!this.user?.NamaWarung) return;
      try {
        const response = await axios.get(
          `${this.baseUrl}/products`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            timeout: 5000
          }
        );
        this.products = response.data
          .filter(product => product.Pedagang === this.user.NamaWarung)
          .map(product => ({
            ...product,
            imageUrl: product.imageUrl 
              ? `${this.baseUrl}/images/${product.id}`
              : this.defaultImage
          }));
      } catch (error) {
        console.error("Error loading products:", error);
        this.showNetworkError(error);
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

    goToProductPage(productId) {
      this.$router.push({
        name: "UserUpdateProduk",
        params: { id: productId },
      });
    },

    formatPrice(value) {
      if (!value) return "Rp0";
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
      }).format(value);
    }
  },
  computed: {
    filteredProducts() {
      const query = this.searchQuery.toLowerCase();
      return this.products.filter(product =>
        product.Nama.toLowerCase().includes(query) ||
        product.Kategori.toLowerCase().includes(query)
      );
    }
  },
  async mounted() {
    await this.fetchUser();
    await this.loadProducts();
    this.refreshInterval = setInterval(this.loadProducts, 30000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
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

.btn-add {
  padding: 12px 20px;
  font-size: 16px;
  text-decoration: none;
  background-color: #007bff;
  color: #fff;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  text-align: center;
  display: inline-block;
}

.btn-add:hover {
  background-color: #0056b3;
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