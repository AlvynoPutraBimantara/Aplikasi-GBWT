<template>
  <div>
    <UserHeader />
    <div class="category-details">
      <h1>{{ categoryName }}</h1>
      <div class="products-container">
        <div
          class="card"
          v-for="(product, index) in products"
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
  </div>
</template>

<script>
import UserHeader from "./UserHeader.vue"; // Assuming UserHeader.vue is in the same directory
import axios from "axios";

export default {
  components: {
    UserHeader,
  },
  data() {
    return {
      categoryName: "",
      products: [],
    };
  },
  methods: {
    async loadCategory() {
      const categoryId = this.$route.params.id;
      try {
        const response = await axios.get("http://localhost:3000/DataKategori");
        const category = response.data.find((cat) => cat.id === categoryId);
        this.categoryName = category ? category.Kategori : "";
        this.loadProducts(category ? category.Kategori : "");
      } catch (error) {
        console.error("Error loading category details:", error);
      }
    },
    async loadProducts(categoryName) {
      try {
        const response = await axios.get("http://localhost:3000/DataProduk");
        this.products = response.data.filter(
          (product) => product.Kategori === categoryName
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
    this.loadCategory();
  },
};
</script>

<style scoped>
.category-details {
  padding: 20px;
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
