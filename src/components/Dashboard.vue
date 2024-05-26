<template>
  <div>
    <UserHeader />
    <div
      class="product"
      v-for="(product, index) in products"
      :key="index"
      @click="goToProductPage(product.id)"
      :style="{
        backgroundImage: `url(${require(`@/assets/images/${product.name.toLowerCase()}.jpg`)})`,
      }"
    >
      <h3>{{ product.name }}</h3>
    </div>
  </div>
</template>

<script>
import UserHeader from "./UserHeader.vue";

export default {
  components: {
    UserHeader,
  },
  data() {
    return {
      products: [
        {
          id: 1,
          name: "WARUNG",
        },
        {
          id: 2,
          name: "PRODUK",
        },
        {
          id: 3,
          name: "KATEGORI",
        },
      ],
    };
  },
  methods: {
    goToProductPage(productId) {
      if (productId === 1) {
        this.$router.push({ path: "/Warung" });
      } else if (productId === 2) {
        this.$router.push({ path: "/Produk" });
      } else if (productId === 3) {
        this.$router.push({ path: "/Kategori" });
      } else {
        console.log(`Navigating to product page with ID: ${productId}`);
      }
    },
  },
};
</script>

<style scoped>
.product {
  border: 3px solid black;
  padding: 20px;
  margin: 40px;
  width: 300px;
  height: 300px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
  background-size: cover;
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5); /* Add shadow effect */
}

.product h3 {
  font-size: 50px;
  font-weight: bold;
  margin: 0;
  color: white; /* Change text color to white for better visibility */
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.5); /* Add text shadow for better readability */
}
</style>
