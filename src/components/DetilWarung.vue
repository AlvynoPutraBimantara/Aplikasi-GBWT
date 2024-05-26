<template>
  <div>
    <UserHeader />
    <div class="warung-details">
      <h1>{{ warung.NamaWarung }}</h1>
      <p>Telp: {{ warung.Telp }}</p>
      <p>Alamat: {{ warung.Alamat }}</p>
    </div>
    <div class="products-container">
      <div
        class="card"
        v-for="(product, index) in products"
        :key="index"
        @click="goToProductPage(product.id)"
        style="width: 15rem; cursor: pointer; margin: 10px"
      >
        <div class="card-body">
          <h5 class="card-title">{{ product.Nama }}</h5>
          <p class="card-text">{{ product.Harga }}</p>
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
      warung: {},
      products: [],
    };
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
  },
  mounted() {
    this.loadWarung();
  },
};
</script>

<style scoped>
.warung-details {
  padding: 20px;
}
.products-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}
.card {
  margin: 10px;
  cursor: pointer;
}
</style>
