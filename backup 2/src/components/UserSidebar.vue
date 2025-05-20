<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <!-- Profile Image Display -->
    <div class="profile-image-container" v-if="userImage">
      <img :src="userImage" alt="Profile Image" class="profile-image" @error="handleImageError" />
    </div>
    <div class="list-group list-group-flush">
      <router-link
        :to="`/Profil/${userId}`"
        class="list-group-item list-group-item-action bg-light"
        >Profil</router-link
      >
      <router-link
        to="/Orders"
        class="list-group-item list-group-item-action bg-light"
        >Pesanan saya</router-link
      >
      <router-link
        to="/Dagangan"
        class="list-group-item list-group-item-action bg-light"
        >Dagangan Saya</router-link
      >
      <router-link
        to="/Penjualan"
        class="list-group-item list-group-item-action bg-light"
        >Penjualan saya</router-link
      >
      <router-link
        to="/RiwayatTransaksi"
        class="list-group-item list-group-item-action bg-light"
        >RiwayatTransaksi</router-link
      >

      <router-link to="/Informasi" class="list-group-item infouser bg-light"
        ><font-awesome-icon :icon="['fas', 'circle-info']" />
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserSidebar",
  data() {
    return {
      userData: {
        imageUrl: null
      }
    };
  },
  computed: {
    userId() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user ? user.id : null;
    },
    userImage() {
      return this.userData.imageUrl;
    }
  },
  methods: {
    async fetchUser() {
      try {
        if (!this.userId) return;
        
        const result = await axios.get(
          `http://localhost:3001/user/${this.userId}`
        );
        this.userData = result.data;
        
        // Update localStorage with fresh data
        const userInfo = JSON.parse(localStorage.getItem("user-info")) || {};
        userInfo.imageUrl = result.data.imageUrl;
        localStorage.setItem("user-info", JSON.stringify(userInfo));
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    },
    handleImageError(event) {
      // Fallback image or hide the image container
      event.target.style.display = 'none';
    },
    logout() {
      this.$emit("logout");
    },
  },
  async mounted() {
    // First check localStorage
    const user = JSON.parse(localStorage.getItem("user-info"));
    if (user && user.imageUrl) {
      this.userData.imageUrl = user.imageUrl;
    }
    
    // Then fetch fresh data from API
    await this.fetchUser();
  },
};
</script>

<style scoped>
.list-group-item-action {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.list-group-item-action:hover {
  background-color: darkblue;
  color: white;
}
#sidebar-wrapper {
  min-height: 100vh;
  margin-left: -300px;
  transition: margin 0.25s ease-out;
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: 0;
}

/* Profile Image Styles */
.profile-image-container {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  min-height: 100px;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Override the padding from App.css */
#sidebar-wrapper .sidebar-heading {
  padding: 1rem 1rem !important;
  margin-bottom: 0 !important;
}

/* Fallback when image fails to load */
.profile-image-container:empty::after {
  content: "No Image";
  color: #666;
  font-size: 0.8rem;
}
</style>