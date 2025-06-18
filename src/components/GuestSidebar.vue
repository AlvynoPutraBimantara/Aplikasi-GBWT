<template>
  <aside class="sidebar bg-light border-right" id="sidebar-wrapper" aria-label="Guest navigation">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <div class="list-group list-group-flush">
      <router-link
        :to="{ path: '/GuestDashboard', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
      >
        <font-awesome-icon :icon="['fas', 'house']" class="me-2" />
        Dashboard
      </router-link>
      <router-link
        :to="{ path: '/Produk', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
      >
        <font-awesome-icon :icon="['fas', 'gift']" class="me-2" />
        Produk
      </router-link>
      <router-link
        :to="{ path: '/Kategori', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
      >
        <font-awesome-icon :icon="['fas', 'table-cells-large']" class="me-2" />
        Kategori
      </router-link>
      <router-link
        :to="{ path: '/Warung', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
      >
        <font-awesome-icon :icon="['fas', 'store']" class="me-2" />
        Warung
      </router-link>
      <router-link
        :to="{ path: '/Orders', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
      >
        <font-awesome-icon :icon="['fas', 'receipt']" class="me-2" />
        Pesanan
      </router-link>
      <router-link
        :to="{ path: '/Cart', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
      >
        <font-awesome-icon :icon="['fas', 'shopping-cart']" class="me-2" />
        Keranjang
      </router-link>
      <router-link
        :to="{ path: '/Informasi', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
      >
        <font-awesome-icon :icon="['fas', 'circle-info']" class="me-2" />
        Informasi
      </router-link>
      <button
        @click="logout"
        class="list-group-item list-group-item-action bg-light logout-btn"
      >
        Logout
      </button>
      <button
        @click="goToLogin"
        class="list-group-item list-group-item-action bg-light login-btn"
      >
        Login
      </button>
    </div>
  </aside>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import axios from "axios";

export default {
  name: "GuestSidebar",
  methods: {
    goToLogin() {
      this.$router.push({ name: "Login" });
    },
    async logout() {
      try {
        const guestId = this.$route.query.guestId || localStorage.getItem("guestId");
        if (guestId) {
          const apiBaseUrl = process.env.VUE_APP_USER_SERVICE_URL || 'http://localhost:3001/user-service';
          const cleanupUrl = `${apiBaseUrl}/guest/${guestId}/cleanup`;
          
          // Try both Beacon API and fetch with keepalive for maximum reliability
          const beaconSent = navigator.sendBeacon(cleanupUrl);
          if (!beaconSent) {
            await fetch(cleanupUrl, {
              method: 'POST',
              keepalive: true,
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }
        }
      } catch (error) {
        console.error("Cleanup request failed:", error);
      } finally {
        this.forceLogout();
      }
    },
    forceLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("guestId");
      localStorage.removeItem("isGuest");
      localStorage.removeItem("user-info");
      if (this.$store) {
        this.$store.commit('RESET_AUTH_STATE');
      }
      window.location.href = "/";
    }
  },
};
</script>

<style scoped>
/* Inherit styles from App.css */
#sidebar-wrapper {
  min-height: 100vh;
  margin-left: -300px;
  -webkit-transition: margin 0.25s ease-out;
  -moz-transition: margin 0.25s ease-out;
  -o-transition: margin 0.25s ease-out;
  transition: margin 0.25s ease-out;
  width: 300px; /* ADDED: Fixed width */
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: 0;
}

#sidebar-wrapper .sidebar-heading {
  padding: 2rem 2rem;
  font-size: 24px;
  font-weight: bold;
}

#sidebar-wrapper .list-group {
  width: 100%; /* CHANGED: Fill available width */
}

.list-group-item {
  padding: 0;
  border: none;
  width: 100%; /* ADDED: Ensure full width */
  box-sizing: border-box; /* ADDED: Include padding in width */
}

.list-group-item-action {
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  color: #2c3e50;
  text-decoration: none;
  border: none;
  font-size: large;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.list-group-item-action:hover,
.list-group-item-action:focus,
.list-group-item-action.router-link-active {
  background-color: darkblue;
  color: white;
}

/* Add these new rules */
.logout-btn,
.login-btn {
  width: 90%;
  text-align: left;
  padding: 0.75rem 1.25rem;
  border-radius: 0;
  border: none;
  background-color: transparent;
  cursor: pointer;
}

/* Remove default button styles */
button.list-group-item-action {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.logout-btn {
  color: #dc3545;
  margin-top: auto;
}

.logout-btn:hover {
  background-color: #dc3545 !important;
  color: white !important;
}

.login-btn {
  color: #0d6efd;
}

.login-btn:hover {
  background-color: #0d6efd !important;
  color: white !important;
}

/* Responsive styles */
@media (max-width: 768px) {
  #sidebar-wrapper {
    z-index: 1001;
  }
  
  .list-group-item-action {
    font-size: medium;
  }
}
</style>