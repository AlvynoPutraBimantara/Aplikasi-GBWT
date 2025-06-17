<template>
  <!-- Desktop Navigation -->
  <nav class="nav desktop-nav">
    <button class="bg-light btn-primary" @click="toggleMenu" id="menu-toggle">
      <font-awesome-icon :icon="['fas', menuToggled ? 'caret-left' : 'caret-right']" />
    </button>
    <router-link
      v-for="route in routes"
      :key="route.path"
      :to="getRoutePath(route)"
      :class="{ active: isActive(route.path) }"
    >
      <div class="icon-container">
        <template v-if="route.name === 'Cart'">
          <font-awesome-icon :icon="['fas', 'shopping-cart']" />
          <span v-if="cartItemCount > 0" class="badge">
            {{ cartItemCount }}
          </span>
        </template>
        <template v-else-if="route.name === 'STRUK'">
          <font-awesome-icon :icon="['fas', 'receipt']" />
          <span v-if="orderCount > 0" class="badge">
            {{ orderCount }}
          </span>
        </template>
        <template v-else-if="route.name === 'Penjualan'">
          <font-awesome-icon :icon="['fas', 'circle-dollar-to-slot']" />
          <span v-if="transactionCount > 0" class="badge badge-red">
            {{ transactionCount }}
          </span>
          <span v-if="kasbonCount > 0" class="badge badge-yellow">
            {{ kasbonCount }}
          </span>
        </template>
        <span v-else>{{ route.name }}</span>
      </div>
    </router-link>
  </nav>

  <!-- Mobile Navigation -->
  <div class="mobile-nav">
    <!-- Top Header -->
    <nav class="nav mobile-top-nav">
      <router-link
        v-for="route in topRoutes"
        :key="route.path"
        :to="getRoutePath(route)"
        :class="{ active: isActive(route.path) }"
      >
        <div class="icon-container">
          <span>{{ route.name }}</span>
        </div>
      </router-link>
    </nav>

    <!-- Bottom Footer -->
    <nav class="nav mobile-bottom-nav">
      <router-link
        v-for="route in bottomRoutes"
        :key="route.path"
        :to="getRoutePath(route)"
        :class="{ active: isActive(route.path) }"
      >
        <div class="icon-container">
          <template v-if="route.name === 'Cart'">
            <font-awesome-icon :icon="['fas', 'shopping-cart']" />
            <span v-if="cartItemCount > 0" class="badge">
              {{ cartItemCount }}
            </span>
          </template>
          <template v-else-if="route.name === 'STRUK'">
            <font-awesome-icon :icon="['fas', 'receipt']" />
            <span v-if="orderCount > 0" class="badge">
              {{ orderCount }}
            </span>
          </template>
          <template v-else-if="route.name === 'Penjualan'">
            <font-awesome-icon :icon="['fas', 'circle-dollar-to-slot']" />
            <span v-if="transactionCount > 0" class="badge badge-red">
              {{ transactionCount }}
            </span>
            <span v-if="kasbonCount > 0" class="badge badge-yellow">
              {{ kasbonCount }}
            </span>
          </template>
          <template v-else-if="route.name === 'Dashboard'">
            <font-awesome-icon :icon="['fas', 'house']" />
          </template>
          <template v-else-if="route.name === 'Profil'">
            <font-awesome-icon :icon="['fas', 'user']" />
          </template>
          <span v-else>{{ route.name }}</span>
        </div>
      </router-link>
    </nav>
  </div>
</template>

<script>
import axios from "axios";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faCaretLeft, faCaretRight);

export default {
  name: "UserHeader",
  data() {
    return {
      allRoutes: [
        { name: "Dashboard", path: "/Dashboard" },
        { name: "Warung", path: "/Warung" },
        { name: "Produk", path: "/Produk" },
        { name: "Kategori", path: "/Kategori" },
        { name: "STRUK", path: "/Orders" },
        { name: "Cart", path: "/Cart" },
        { name: "Penjualan", path: "/Penjualan" },
      ],
      cartItemCount: 0,
      orderCount: 0,
      transactionCount: 0,
      kasbonCount: 0,
      menuToggled: false
    };
  },
  computed: {
    user() {
      const userInfo = localStorage.getItem("user-info");
      return userInfo ? JSON.parse(userInfo) : null;
    },
    userId() {
      return this.user?.id ?? null;
    },
    isGuest() {
      return localStorage.getItem("guest") === "true";
    },
    routes() {
      return this.allRoutes;
    },
    topRoutes() {
      return [
        { name: "Warung", path: "/Warung" },
        { name: "Produk", path: "/Produk" },
        { name: "Kategori", path: "/Kategori" },
      ];
    },
    bottomRoutes() {
      return [
        { name: "STRUK", path: "/Orders" },
        { name: "Cart", path: "/Cart" },
        { name: "Dashboard", path: "/Dashboard" },
        { name: "Penjualan", path: "/Penjualan" },
        { name: "Profil", path: "/Profil" },
      ];
    }
  },
  methods: {
    toggleMenu() {
      document.getElementById("wrapper").classList.toggle("toggled");
      this.menuToggled = !this.menuToggled;
    },
    isActive(route) {
      if (route === "/Profil") {
        return this.$route.path.startsWith(`${route}/${this.userId}`);
      }
      return this.$route.path === route;
    },
    getRoutePath(route) {
      if (route.name === "Dashboard") {
        return this.isGuest || !this.user ? "/GuestDashboard" : "/Dashboard";
      }
      if (route.name === "Profil" && this.userId) {
        return `${route.path}/${this.userId}`;
      }
      return route.path;
    },
    async fetchCartItems(userId) {
      if (!userId) return;

      try {
        const response = await axios.get(`${process.env.VUE_APP_CART_SERVICE_URL}/cart`, {
          params: { user: userId },
        });
        const cartItems = response.data;
        this.cartItemCount = cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
      } catch (error) {
        console.error("Error fetching cart items:", error);
        this.cartItemCount = 0;
      }
    },
    async fetchOrders(userId) {
      if (!userId) return;

      try {
        const response = await axios.get(`${process.env.VUE_APP_ORDERS_SERVICE_URL}/orders`, {
          params: { user: userId }
        });
        this.orderCount = response.data.length;
      } catch (error) {
        console.error("Error fetching orders:", error);
        this.orderCount = 0;
      }
    },
    async fetchTransactions(userId) {
      if (!userId) return;

      try {
        const user = this.user || { NamaWarung: "Guest" };
        const [
          // eslint-disable-next-line no-unused-vars
          transactionsResponse,
          transactionItemsResponse,
          historyResponse,
          historyItemsResponse
        ] = await Promise.all([
          axios.get(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions`),
          axios.get(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-items`),
          axios.get(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history`),
          axios.get(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history-items`)
        ]);

        const transactionItemsForPedagang = transactionItemsResponse.data.filter(
          item => item.pedagang === user.NamaWarung
        );
        
        const uniqueTransactionIds = [...new Set(
          transactionItemsForPedagang.map(item => item.transactions_id)
        )];
        this.transactionCount = uniqueTransactionIds.length;

        const kasbonTransactions = historyResponse.data.filter(
          transaction => transaction.description === "Kasbon"
        );
        
        const kasbonItemsForPedagang = historyItemsResponse.data.filter(
          item => item.pedagang === user.NamaWarung && 
                kasbonTransactions.some(t => t.id === item.transaction_id)
        );
        
        const uniqueKasbonIds = [...new Set(
          kasbonItemsForPedagang.map(item => item.transaction_id)
        )];
        this.kasbonCount = uniqueKasbonIds.length;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        this.transactionCount = 0;
        this.kasbonCount = 0;
      }
    },
    setupEventListeners() {
      window.addEventListener('storage', (event) => {
        if (event.key === 'cart-updated') {
          const userId = this.user ? this.user.id : localStorage.getItem("guestId");
          this.fetchCartItems(userId);
        }
        if (event.key === 'orders-updated') {
          const userId = this.user ? this.user.id : localStorage.getItem("guestId");
          this.fetchOrders(userId);
        }
      });
    }
  },
  mounted() {
    if (this.user || this.isGuest) {
      const userId = this.user ? this.user.id : localStorage.getItem("guestId");
      this.fetchCartItems(userId);
      this.fetchOrders(userId);
      this.fetchTransactions(userId);
      this.setupEventListeners();
    }
    
    this.menuToggled = document.getElementById("wrapper").classList.contains("toggled");
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

.icon-container {
  position: relative;
  display: inline-block;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: red;
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

.badge-yellow {
  background-color: #ffcc00;
  right: 8px;
  color: black;
}

/* Mobile Navigation Styles */
.mobile-nav {
  display: none;
}

.mobile-top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-nav {
    display: block;
  }
  
  .mobile-top-nav,
  .mobile-bottom-nav {
    justify-content: space-around;
  }
  
  .mobile-top-nav a,
  .mobile-bottom-nav a {
    flex: 1;
    padding: 10px 5px;
    font-size: 14px;
  }
  
  #menu-toggle {
    display: none;
  }
}

@media (min-width: 769px) {
  .mobile-nav {
    display: none;
  }
  
  .desktop-nav {
    display: flex;
  }
}
</style>