<template>
  <div>
    <!-- Section for main products -->
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

    <!-- Section for popular products -->
    <section class="section-popular" v-if="popularProducts.length > 0">
      <h4 class="section-title">Produk Populer</h4>
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
    </section>

    <!-- Section for previous purchases -->
    <section class="section-previous">
      <h6 class="section-title">Produk yang anda beli sebelumnya</h6>
      <div class="products-container">
        <div
          class="card"
          v-for="(product, index) in previousProducts"
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
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      products: [
        { id: 1, name: "WARUNG" },
        { id: 2, name: "PRODUK" },
        { id: 3, name: "KATEGORI" },
      ],
      previousProducts: [],
      popularProducts: [],
    };
  },
  methods: {
    goToProductPage(productId) {
      this.$router.push(`/DetilProduk/${productId}`);
    },
    async fetchProducts(productIds) {
      try {
        const productPromises = productIds.map((id) =>
          axios.get(`http://localhost:3002/products/${id}`)
        );
        const products = await Promise.all(productPromises);
        return products.map((response) => ({
          ...response.data,
          imageUrl: response.data.imageUrl
            ? `http://localhost:3002/images/${response.data.id}` // Construct URL for serving images
            : "default-image.jpg", // Placeholder image if none provided
        }));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
      }
    },
    async fetchPreviousProducts() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      if (user && user.Nama) {
        try {
          const response = await axios.get(
            "http://localhost:3000/RiwayatTransaksi"
          );
          const transactions = response.data.filter(
            (transaction) => transaction.user === user.Nama
          );
          const productIds = [
            ...new Set(
              transactions.flatMap((transaction) =>
                transaction.items.map((item) => item.id)
              )
            ),
          ];
          this.previousProducts = await this.fetchProducts(productIds);
        } catch (error) {
          console.error("Error fetching previous products:", error);
        }
      }
    },
    async fetchPopularProducts() {
      try {
        // Fetch all transaction history items
        const response = await axios.get("http://localhost:3005/transactions-history-items");
        const items = response.data;

        // Count how many times each product appears in the transaction history
        const productCountMap = items.reduce((acc, item) => {
          acc[item.itemid] = (acc[item.itemid] || 0) + 1;
          return acc;
        }, {});

        // Filter products that appear more than 3 times
        const popularProductIds = Object.keys(productCountMap).filter(
          (productId) => productCountMap[productId] > 3
        );

        // Fetch product details for popular products
        this.popularProducts = await this.fetchProducts(popularProductIds);
      } catch (error) {
        console.error("Error fetching popular products:", error);
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
    this.fetchPopularProducts();
    this.fetchPreviousProducts();
  },
};
</script>

<style scoped>
/* Add styles from Produk.vue for consistency */
.products-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}

.section-title {
  font-size: 24px;
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