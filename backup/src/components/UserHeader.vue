<template>
  <nav class="nav">
    <button class="bg-light btn-primary" @click="toggleMenu" id="menu-toggle">
      Menu
    </button>
    <router-link
      v-for="route in routes"
      :key="route.path"
      :to="getRoutePath(route)"
      :class="{ active: isActive(route.path) }"
    >
      <div class="icon-container">
        <!-- Cart Icon and Badge -->
        <template v-if="route.name === 'Cart'">
          <font-awesome-icon :icon="['fas', 'shopping-cart']" />
          <span v-if="cartItemCount > 0" class="badge">
            {{ cartItemCount }}
          </span>
        </template>
        <!-- Receipt Icon and Badge -->
        <template v-else-if="route.name === 'STRUK'">
          <font-awesome-icon :icon="['fas', 'receipt']" />
          <span v-if="orderCount > 0" class="badge">
            {{ orderCount }}
          </span>
        </template>
        <!-- Dollar Icon for Penjualan -->
        <template v-else-if="route.name === 'Penjualan'">
          <font-awesome-icon :icon="['fas', 'circle-dollar-to-slot']" />
          <span v-if="transactionCount > 0" class="badge badge-red">
            {{ transactionCount }}
          </span>
          <span v-if="kasbonCount > 0" class="badge badge-yellow">
            {{ kasbonCount }}
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
  name: "UserHeader",
  data() {
    return {
      routes: [
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
    };
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem("user-info"));
    },
    isGuest() {
      return localStorage.getItem("guest") === "true";
    },
  },
  methods: {
    toggleMenu() {
      document.getElementById("wrapper").classList.toggle("toggled");
    },
    logout() {
      localStorage.clear();
      this.$router.push({ name: "LandingPage" }).then(() => {
        window.location.reload();
      });
    },
    isActive(route) {
      return this.$route.path === route;
    },
    getRoutePath(route) {
      if (route.name === "Dashboard") {
        return this.isGuest || !this.user ? "/GuestDashboard" : "/Dashboard";
      }
      return route.path;
    },
    async fetchCartItems() {
      if (!this.user) return;

      try {
        const response = await axios.get("http://localhost:3004/cart", {
          params: { user: this.user.Nama },
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
      if (!this.user) return;

      try {
        const response = await axios.get("http://localhost:3003/orders");
        const orders = response.data;
        const userOrders = orders.filter(
          (order) => order.user === this.user.Nama
        );
        this.orderCount = userOrders.length;
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    async fetchTransactions() {
  if (!this.user) return;

  try {
    // Fetch all data in parallel
    const [
      // eslint-disable-next-line no-unused-vars
      transactionsResponse,
      transactionItemsResponse,
      historyResponse,
      historyItemsResponse
    ] = await Promise.all([
      axios.get("http://localhost:3005/transactions"),
      axios.get("http://localhost:3005/transactions-items"), // Changed from transactions-history-items
      axios.get("http://localhost:3005/transactions-history"),
      axios.get("http://localhost:3005/transactions-history-items")
    ]);

    // Count regular transactions where user is the pedagang
    const transactionItemsForPedagang = transactionItemsResponse.data.filter(
      item => item.pedagang === this.user.NamaWarung
    );
    
    // Get unique transaction IDs where user is pedagang
    const uniqueTransactionIds = [...new Set(
      transactionItemsForPedagang.map(item => item.transactions_id)
    )];
    this.transactionCount = uniqueTransactionIds.length;

    // Count Kasbon transactions where user is the pedagang
    const kasbonTransactions = historyResponse.data.filter(
      transaction => transaction.description === "Kasbon"
    );
    
    const kasbonItemsForPedagang = historyItemsResponse.data.filter(
      item => item.pedagang === this.user.NamaWarung && 
             kasbonTransactions.some(t => t.id === item.transaction_id)
    );
    
    // Get unique Kasbon transaction IDs where user is pedagang
    const uniqueKasbonIds = [...new Set(
      kasbonItemsForPedagang.map(item => item.transaction_id)
    )];
    this.kasbonCount = uniqueKasbonIds.length;

  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
},
  

  },
  mounted() {
    if (this.user) {
      this.fetchCartItems();
      this.fetchOrders();
      this.fetchTransactions();
    }
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
  right: -8px;
  background-color: red; /* Add this line to match the old version */
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
</style>