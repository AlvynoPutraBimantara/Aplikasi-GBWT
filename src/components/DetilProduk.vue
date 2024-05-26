<template>
  <div>
    <UserHeader />
    <div class="container">
      <div class="product-details">
        <div class="detail-item">
          <h1>{{ product.Nama }}</h1>
        </div>
        <div class="detail-item">
          <p>Harga: {{ product.Harga }}</p>
        </div>
        <div class="detail-item">
          <p>Kategori: {{ product.Kategori }}</p>
        </div>
        <div class="detail-item">
          <p>Keterangan: {{ product.Keterangan }}</p>
        </div>
        <div class="detail-item">
          <p>Pedagang: {{ product.Pedagang }}</p>
        </div>
        <div class="detail-item">
          <p>Stok: {{ product.Stok }}</p>
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
      product: {},
    };
  },
  async mounted() {
    const productId = this.$route.params.id;
    try {
      const response = await axios.get(
        `http://localhost:3000/DataProduk/${productId}`
      );
      this.product = response.data;
    } catch (error) {
      console.error("Error loading product details:", error);
    }
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.product-details {
  padding: 20px;
}

.detail-item {
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 10px;
}

.detail-item h1 {
  font-size: 48px;
  margin: 0;
}

.detail-item p {
  text-align: left;
  margin: 0;
}
</style>
