<template>
  <div class="warung-container">
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Cari Warung..." 
        class="search-input"
      />
    </div>
    <div class="warung-grid">
      <div
        class="warung-card"
        v-for="(user, index) in filteredUsers"
        :key="index"
        @click="goToWarungPage(user.id)"
      >
        <div class="card-image-container">
          <img
            :src="getFullImageUrl(user.imageUrl)"
            alt="Warung Image"
            class="warung-image"
          />
        </div>
        <div class="card-content">
          <h5 class="warung-title">{{ user.NamaWarung }}</h5>
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
      users: [],
      searchQuery: "",
      baseUrl: process.env.VUE_APP_API_BASE_URL || "http://192.168.100.8:3001",
    };
  },
  computed: {
    filteredUsers() {
      return this.users
        .filter((user) => user.role !== "admin")
        .filter(
          (user) =>
            user.NamaWarung &&
            user.NamaWarung.toLowerCase().includes(
              this.searchQuery.toLowerCase()
            )
        );
    },
  },
  methods: {
    goToWarungPage(userId) {
      this.$router.push({ name: "DetilWarung", params: { id: userId } });
    },
    async loadUsers() {
      try {
        const response = await axios.get(`${this.baseUrl}/users`);
        this.users = response.data;
      } catch (error) {
        console.error("Error loading users:", error);
        alert("Failed to load warung data. Please check your connection.");
      }
    },
    getFullImageUrl(imageUrl) {
      if (!imageUrl) return ""; 
      if (imageUrl.startsWith("http")) {
        return imageUrl;
      }
      return `${this.baseUrl}${imageUrl}`;
    },
  },
  mounted() {
    this.loadUsers();
  },
};
</script>

<style scoped>
.warung-container {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

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

.warung-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  padding: 10px;
}

.warung-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.warung-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  position: relative;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
}

.warung-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 12px;
  text-align: center;
}

.warung-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -moz-box;
  -moz-line-clamp: 2;
  -moz-box-orient: vertical;
  display: box;
  line-clamp: 2;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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

  .warung-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    padding: 20px;
  }

 .warung-title {
    font-size: 14px;
    font-weight: bolder;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -moz-box;
    -moz-line-clamp: 2;
    -moz-box-orient: vertical;
    display: box;
    line-clamp: 2;
    box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Large desktop styles */
@media (min-width: 1200px) {
  .warung-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

/* Mobile-specific adjustments */
@media (max-width: 480px) {
  .warung-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.8rem;
  }
  
  .warung-title {
    font-size: 14px;
  font-weight: 500;
  }
}
</style>