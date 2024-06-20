<template>
  <div>
    <UserHeader />
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
          <p class="card-text">Harga: {{ product.Harga }}</p>
          <p class="card-text">Kategori: {{ product.Kategori }}</p>
          <p class="card-text">Keterangan: {{ product.Keterangan }}</p>
          <p class="card-text">Stok: {{ product.Stok }}</p>
        </div>
      </div>
    </div>
    <div class="button-container">
      <router-link to="/TambahDagangan" class="btn-add"
        >Tambah Produk</router-link
      >
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
    async loadProducts() {
      let user = JSON.parse(localStorage.getItem("user-info"));
      if (user && user.NamaWarung) {
        try {
          const response = await axios.get("http://localhost:3000/DataProduk");
          this.products = response.data.filter(
            (product) => product.Pedagang === user.NamaWarung
          );
        } catch (error) {
          console.error("Error loading products:", error);
        }
      } else {
        this.$router.push({ name: "Login" });
      }
    },
    goToProductPage(productId) {
      this.$router.push({ name: "UserUpdateProduk", params: { id: productId } });
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
