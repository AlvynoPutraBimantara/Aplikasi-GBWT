<template>
  <div>
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Cari Kategori..." />
    </div>
    <div class="categories-container">
      <div
        class="card"
        v-for="(category, index) in filteredCategories"
        :key="index"
        @click="goToCategoryPage(category.id)"
        style="width: 15rem; cursor: pointer; margin: 10px"
      >
        <div class="card-body">
          <img
            :src="category.imageUrl"
            alt="Category Image"
            class="category-image"
          />
          <h5 class="card-title">{{ category.category }}</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import axios from "axios";

export default {
  components: {

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
        const response = await axios.get("http://localhost:3006/categories");
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
        category.category.toLowerCase().includes(this.searchQuery.toLowerCase())
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
  width: 15rem;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 1px 1px 1px black;
}

.card-body {
  padding: 20px;
}

.category-image {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.card-title {
  padding-top: 10px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}
</style>
