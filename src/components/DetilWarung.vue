<template>
  <div>
    <UserHeader />
    <div class="warung-details">
      <h1>{{ warung.NamaWarung }}</h1>
      <img
        :src="warung.imageUrl"
        alt="Warung Image"
        style="width: 30%; height: auto; margin-bottom: 20px"
      />
      <p>Telp: {{ warung.Telp }}</p>
      <p>Alamat: {{ warung.Alamat }}</p>
      <div class="button-container">
        <button @click="goToWhatsApp" class="whatsapp-button">
          Kontak via WhatsApp <font-awesome-icon icon="fa-brands fa-whatsapp" />
        </button>
      </div>
    </div>
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
import UserHeader from "./UserHeader.vue";
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  components: {
    UserHeader,
  },
  data() {
    return {
      warung: {},
      products: [],
      searchQuery: "",
      selectedSortOption: "",
    };
  },
  computed: {
    ...mapGetters(["purchaseCounts"]),
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
        sortedProducts.sort(
          (a, b) =>
            (this.purchaseCounts[b.id] || 0) - (this.purchaseCounts[a.id] || 0)
        );
      }
      return sortedProducts;
    },
  },
  methods: {
    async loadWarung() {
      const userId = this.$route.params.id;
      try {
        const response = await axios.get(
          `http://localhost:3000/User/${userId}`
        );
        this.warung = response.data;
        this.loadProducts(response.data.NamaWarung);
      } catch (error) {
        console.error("Error loading warung details:", error);
      }
    },
    async loadProducts(warungName) {
      try {
        const response = await axios.get("http://localhost:3000/DataProduk");
        this.products = response.data.filter(
          (product) => product.Pedagang === warungName
        );
      } catch (error) {
        console.error("Error loading products:", error);
      }
    },
    goToProductPage(productId) {
      this.$router.push({ name: "DetilProduk", params: { id: productId } });
    },
    sortProducts() {
      // Sorting is handled by computed property, so no need to do anything here
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
    this.$store.dispatch("fetchPurchaseCounts");
  },
};
</script>

<style scoped>
.warung-details {
  padding: 20px;
  text-align: center; /* Center contents */
}

.button-container {
  display: flex;
  justify-content: center; /* Center button horizontally */
}

.whatsapp-button {
  display: inline-flex;
  align-items: center;
  background-color: #25d366; /* WhatsApp green */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.whatsapp-button font-awesome-icon {
  margin-left: 10px; /* Space between text and icon */
  font-size: 24px; /* Larger icon size */
}

.whatsapp-button:hover {
  background-color: #1ebe57; /* Darker green on hover */
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

.card img {
  width: 100%;
  height: auto;
}
</style>
