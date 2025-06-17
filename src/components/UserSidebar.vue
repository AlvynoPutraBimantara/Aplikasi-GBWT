<template>
  <aside class="sidebar bg-light border-right hidden" id="sidebar-wrapper" aria-label="User navigation">
    <div class="sidebar-heading">Aplikasi GBWT</div>

    <!-- Profile Section -->
    <div class="profile-section">
      <div v-if="isLoading" class="profile-loading">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-else class="profile-image-container">
        <img
          v-if="fullImageUrl"
          :src="fullImageUrl"
          alt="Profile image"
          class="profile-image"
          @error="handleImageError"
          @load="handleImageLoad"
          loading="lazy"
        />
        <div v-if="showPlaceholder" class="image-placeholder">
          <font-awesome-icon :icon="['fas', 'user-circle']" size="3x" />
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul class="list-group list-group-flush">
        <li v-for="item in navItems" :key="item.route" class="list-group-item">
          <router-link
            :to="item.route === '/Profil' ? `${item.route}/${userId}` : item.route"
            class="list-group-item-action bg-light"
            :aria-current="isActive(item.route) ? 'page' : null"
          >
            <font-awesome-icon v-if="item.icon" :icon="item.icon" class="me-2" />
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import axios from "axios";

export default {
  name: "UserSidebar",
  data() {
    return {
      userData: {
        imageUrl: null,
      },
      isLoading: false,
      imageLoaded: false,
      imageErrored: false,
      baseUrl: process.env.VUE_APP_API_BASE_URL || "http://192.168.100.8:3001",
      navItems: [
        { route: "/Profil", label: "Profil", icon: ["fas", "user"] },
        { route: "/Orders", label: "Pesanan saya", icon: ["fas", "receipt"] },
        { route: "/Dagangan", label: "Dagangan Saya", icon: ["fas", "store"] },
        { route: "/Penjualan", label: "Penjualan saya", icon: ["fas", "circle-dollar-to-slot"] },
        { route: "/RiwayatTransaksi", label: "Riwayat Transaksi", icon: ["fas", "history"] },
        { route: "/Informasi", label: "Informasi", icon: ["fas", "circle-info"] }
      ]
    };
  },
  computed: {
    userId() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user?.id ?? null;
    },
    userImage() {
      return this.userData.imageUrl;
    },
    fullImageUrl() {
      if (!this.userImage) return "";
      if (this.userImage.startsWith("http")) return this.userImage;
      return `${this.baseUrl}${this.userImage}`;
    },
    showPlaceholder() {
      return !this.fullImageUrl || this.imageErrored;
    }
  },
  methods: {
    isActive(route) {
      const expected = route === "/Profil" ? `${route}/${this.userId}` : route;
      return this.$route.path.startsWith(expected);
    },
    handleImageLoad() {
      this.imageLoaded = true;
      this.imageErrored = false;
    },
    handleImageError(event) {
      console.error("Image load error:", event);
      this.imageErrored = true;
      this.imageLoaded = false;
    },
    async fetchUser() {
      if (!this.userId) return;

      this.isLoading = true;
      this.imageLoaded = false;
      this.imageErrored = false;
      
      try {
        const response = await axios.get(
          `${this.baseUrl}/user/${this.userId}`,
          {
            timeout: 5000,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (response.data) {
          this.userData = response.data;
          const userInfo = JSON.parse(localStorage.getItem("user-info")) || {};
          userInfo.imageUrl = response.data.imageUrl;
          localStorage.setItem("user-info", JSON.stringify(userInfo));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        const user = JSON.parse(localStorage.getItem("user-info")) || {};
        if (user.imageUrl) {
          this.userData.imageUrl = user.imageUrl;
        }
      } finally {
        this.isLoading = false;
      }
    },
    toggleSidebar() {
      this.$el.classList.toggle('hidden');
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem("user-info")) || {};
    if (user.imageUrl) {
      this.userData.imageUrl = user.imageUrl;
    }
    await this.fetchUser();
  }
};
</script>

<style scoped>
#sidebar-wrapper {
  min-height: 100vh;
  transition: margin 0.25s ease-out;
  margin-left: -300px;
  width: 300px;
}

#sidebar-wrapper.hidden {
  margin-left: -300px;
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: 0;
}

.profile-section {
  padding: 1rem;
  text-align: center;
}

.profile-image-container {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  position: relative;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.profile-image:hover {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border: 3px solid #fff;
  color: #6c757d;
}

.profile-loading {
  height: 106px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-group-item {
  padding: 0;
}

.list-group-item-action {
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  color: #495057;
  text-decoration: none;
}

.list-group-item-action:hover,
.list-group-item-action:focus,
.list-group-item-action[aria-current="page"] {
  background-color: var(--bs-primary);
  color: white;
}

.sidebar-heading {
  padding: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.sidebar-nav {
  margin-top: 1rem;
}
</style>