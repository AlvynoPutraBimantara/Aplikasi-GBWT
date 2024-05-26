<template>
  <div>
    <UserHeader />
    <div
      class="category"
      v-for="(category, index) in categories"
      :key="index"
      @click="goToCategoryPage(category.id)"
    >
      <font-awesome-icon
        :icon="getCategoryIcon(category.Kategori)"
        class="category-icon"
      />
      <h3>{{ category.Kategori }}</h3>
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
      categories: [],
    };
  },
  methods: {
    async loadCategories() {
      try {
        const response = await axios.get("http://localhost:3000/DataKategori");
        this.categories = response.data;
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    },
    goToCategoryPage(categoryId) {
      this.$router.push({ name: "DetilKategori", params: { id: categoryId } });
    },
    getCategoryIcon(category) {
      switch (category) {
        case "makanan":
          return ["fas", "utensils"];
        case "minuman":
          return ["fas", "glass-martini-alt"];
        case "pakaian":
          return ["fas", "tshirt"];
        case "sembako":
          return ["fas", "carrot"];
        default:
          return ["fas", "question-circle"]; // Default icon
      }
    },
  },
  mounted() {
    this.loadCategories();
  },
};
</script>

<style scoped>
.category {
  border: 1px solid #ccc;
  padding: 20px;
  margin: 10px;
  width: 200px;
  display: inline-block;
  cursor: pointer;
  text-align: center;
}
.category-icon {
  font-size: 2em;
  margin-bottom: 10px;
}
</style>
