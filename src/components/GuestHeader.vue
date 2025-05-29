<template>
  <nav class="nav">
    <button class="bg-light btn-primary" @click="toggleMenu" id="menu-toggle">
      Menu
    </button>
    <router-link
      v-for="route in filteredRoutes"
      :key="route.path"
      :to="route.path"
      :class="{ active: isActive(route.path) }"
    >
      <div class="icon-container">
        <!-- Cart Icon and Badge -->
        <template v-if="route.name === 'Cart'">
          <font-awesome-icon :icon="['fas', 'shopping-cart']" />
          <span v-if="cartItemCount > 0" class="badge badge-red">
            {{ cartItemCount }}
          </span>
        </template>
        <!-- Receipt Icon and Badge -->
        <template v-else-if="route.name === 'STRUK'">
          <font-awesome-icon :icon="['fas', 'receipt']" />
          <span v-if="orderCount > 0" class="badge badge-red">
            {{ orderCount }}
          </span>
        </template>
        <!-- Default Route Name -->
        <span v-else>{{ route.name }}</span>
      </div>
    </router-link>
    <a @click.prevent="logout" class="logout-btn" href="#">Logout</a>
  </nav>
</template>

<script>
import axios from "axios";

export default {
  name: "GuestHeader",
  data() {
    return {
      routes: [
        { name: "Dashboard", path: "/GuestDashboard" },
        { name: "Warung", path: "/Warung" },
        { name: "Produk", path: "/Produk" },
        { name: "Kategori", path: "/Kategori" },
        { name: "STRUK", path: "/Orders" },
        { name: "Cart", path: "/Cart" },
      ],
      cartItemCount: 0,
      orderCount: 0,
      isLoggingOut: false,
    };
  },
  computed: {
    filteredRoutes() {
      return this.routes.filter((route) => !route.adminOnly);
    },
     guestId() {
    const userInfo = JSON.parse(localStorage.getItem("user-info") || '{}');
    return userInfo.id || localStorage.getItem("guestId");
  },
  },
  methods: {
    toggleMenu() {
      document.getElementById("wrapper").classList.toggle("toggled");
    },

// Enhanced logout method
async logout() {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    
    const guestId = localStorage.getItem("guestId");
    if (!guestId) return this.forceLogout();

    try {
      // Use Beacon API for reliable cleanup
      const beaconSent = navigator.sendBeacon(
        `http://localhost:3001/guest/${guestId}/cleanup`
      );
      
      if (!beaconSent) {
        // Fallback to fetch with keepalive
        await fetch(`http://localhost:3001/guest/${guestId}/cleanup`, {
          method: 'POST',
          keepalive: true
        });
      }
    } catch (error) {
      console.error("Cleanup request failed:", error);
    } finally {
      this.forceLogout();
    }
  },

  handlePageExit() {
    const guestId = localStorage.getItem("guestId");
    if (!guestId) return;
    
    navigator.sendBeacon(
      `http://localhost:3001/guest/${guestId}/cleanup`
    );
  },
  
  forceLogout() {
  // Clear all authentication-related data
  localStorage.removeItem("token");
  localStorage.removeItem("guestId");
  localStorage.removeItem("isGuest");
  localStorage.removeItem("user-info"); // Add this line
  
  // Clear any Vuex store state if used
  if (this.$store) {
    this.$store.commit('RESET_AUTH_STATE');
  }
  
  // Force redirect with full reload
  window.location.href = "/";
}
,

    isActive(route) {
      return this.$route.path === route;
    },

    async fetchCartItems() {
      if (!this.guestId) return;

      try {
        const response = await axios.get("http://localhost:3004/cart", {
          params: { user: this.guestId },
          timeout: 3000,
        });
        const cartItems = response.data;
        this.cartItemCount = cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    },

    async fetchOrders() {
      if (!this.guestId) return;

      try {
        const response = await axios.get("http://localhost:3003/orders", {
          timeout: 3000,
        });
        const orders = response.data;
        const guestOrders = orders.filter(
          (order) => order.user === this.guestId
        );
        this.orderCount = guestOrders.length;
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },


  },

  mounted() {
    if (this.guestId) {
      window.addEventListener("beforeunload", this.handlePageExit);
      this.fetchCartItems();
      this.fetchOrders();
    }
  },

  beforeUnmount() {
    window.removeEventListener("beforeunload", this.handlePageExit);
  },
};
</script>


<style scoped>
.nav {
  background-color: darkblue;
  display: flex;
  align-items: center;
  padding: 1vh 10px;
  gap: 1vh;
  box-sizing: border-box;
  width: 100%;
}

.nav a,
.nav button {
  color: aliceblue;
  padding: 10px 15px;
  text-align: center;
  font-size: 15px;
  border-radius: 5px;
  text-decoration: none;
}

.nav a:hover,
.nav button:hover,
.nav a.active {
  background: #ddd;
  color: #333;
}

.logout-btn {
  background-color: red;
  color: white;
  padding: 10px 20px;
  text-align: center;
  font-size: 15px;
  border-radius: 5px;
  text-decoration: none;
  margin-left: auto;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.logout-btn:hover {
  background-color: darkred;
  color: white;
}

.icon-container {
  position: relative;
  display: inline-block;
}

.badge {
  position: absolute;
  top: -8px;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
}

.badge-red {
  background-color: red;
  right: -8px;
}
</style>
