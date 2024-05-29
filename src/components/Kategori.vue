<template>
  <div>
    <UserHeader />
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Cari Kategori..." />
    </div>
    <div class="categories-container">
      <div
        class="card"
        v-for="(category, index) in filteredCategories"
        :key="index"
        @click="goToCategoryPage(category.id)"
      >
        <div class="card-body">
          <h5 class="card-title">{{ category.Kategori }}</h5>
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
      categories: [],
      searchQuery: "",
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
  },
  computed: {
    filteredCategories() {
      return this.categories.filter((category) =>
        category.Kategori.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  mounted() {
    this.loadCategories();
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

.categories-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 10px;
  cursor: pointer;
  width: 200px;
  transition: box-shadow 0.3s ease;
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
</style>
