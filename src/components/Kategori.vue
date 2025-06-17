<template>
  <div>
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Cari Kategori..." 
        class="search-input"
      />
    </div>
    <div class="categories-container">
      <div
        class="card"
        v-for="(category, index) in filteredCategories"
        :key="index"
        @click="goToCategoryPage(category.id)"
      >
        <div class="card-body">
          <img
            :src="getFullImageUrl(category.imageUrl)"
            alt="Category Image"
            class="category-image"
            @error="handleImageError"
            crossorigin="anonymous"
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
  data() {
    return {
      categories: [],
      searchQuery: "",
      baseUrl: process.env.VUE_APP_CATEGORY_SERVICE_URL || "http://192.168.100.8:3006"
    };
  },
  methods: {
    async loadCategories() {
      try {
        const response = await axios.get(`${this.baseUrl}/categories`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        this.categories = response.data;
      } catch (error) {
        console.error("Error loading categories:", error);
        try {
          const fallbackResponse = await axios.get(`${process.env.VUE_APP_CATEGORY_SERVICE_URL}/categories`);
          this.categories = fallbackResponse.data;
        } catch (fallbackError) {
          console.error("Fallback URL also failed:", fallbackError);
          this.categories = [];
        }
      }
    },
    goToCategoryPage(categoryId) {
      this.$router.push({ name: "DetilKategori", params: { id: categoryId } });
    },
    getFullImageUrl(imageUrl) {
      if (!imageUrl) return '';
      
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      const imageId = imageUrl.includes('/') 
        ? imageUrl.split('/').pop() 
        : imageUrl;
      
      return `${this.baseUrl}/images/${imageId}`;
    },
    handleImageError(event) {
      const img = event.target;
      img.style.display = 'none';
      console.error("Image load error:", img.src);
    }
  },
  computed: {
    filteredCategories() {
      if (!this.categories) return [];
      return this.categories.filter((category) =>
        category && category.category && 
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
  margin: 10px 0;
  text-align: left;
}

.search-input {
  padding: 10px;
  font-size: 16px;
  width: 100%;
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
  max-height: 200px;
  object-fit: contain;
}

.card-title {
  padding-top: 10px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

/* Desktop styles */
@media (min-width: 768px) {
  .search-container {
    margin: 20px 0;
  }
  
  .search-input {
    max-width: 300px;
    padding: 12px;
  }
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .categories-container {
    justify-content: space-between;
    padding: 10px;
    gap: 8px;
  }

  .card {
    width: calc(50% - 20px);
    margin: 5px;
    min-width: 0;
  }

  .card-body {
    padding: 10px;
  }

  .category-image {
    max-height: 100px;
  }

  .card-title {
    font-size: 14px;
    padding-top: 8px;
  }
}
</style>