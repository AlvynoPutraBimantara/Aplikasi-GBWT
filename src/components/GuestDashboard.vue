<template>
  <div>
    <GuestHeader />
  </div>
  <div>
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

  <h4 style="font-size: 50px">Produk Populer</h4>

  <div class="products-container">
    <div
      class="card"
      v-for="(product, index) in popularProducts"
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
</template>

<script>
import GuestHeader from "./GuestHeader.vue";
import { mapState } from "vuex";

export default {
  components: {
    GuestHeader,
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
  computed: {
    ...mapState({
      popularProducts: (state) => state.popularProducts,
    }),
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
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
  },

  mounted() {
    this.$store.dispatch("fetchPopularProducts");
  },
};
</script>

<style scoped>
.products-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}
.h4 {
  font-size: 64px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
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
