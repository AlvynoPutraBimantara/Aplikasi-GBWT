<template>
  <div>
    <UserHeader />
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Cari Produk..." />
    </div>
    <div class="products-container">
      <div
        class="card"
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
          <p class="card-text">{{ product.Harga }}</p>
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

export default {
  components: {
    UserHeader,
  },
  data() {
    return {
      products: [],
      searchQuery: "",
    };
  },
  methods: {
    goToProductPage(productId) {
      this.$router.push({ name: "DetilProduk", params: { id: productId } });
    },
    async loadProducts() {
      try {
        const response = await axios.get("http://localhost:3000/DataProduk");
        this.products = response.data;
      } catch (error) {
        console.error("Error loading products:", error);
      }
    },
  },
  computed: {
    filteredProducts() {
      return this.products.filter((product) =>
        product.Nama.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  mounted() {
    this.loadProducts();
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
