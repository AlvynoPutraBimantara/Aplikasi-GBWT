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
      cartItemCount: 0, // Store the number of items in the cart
      orderCount: 0, // Store the number of orders (receipts)
    };
  },
  computed: {
    filteredRoutes() {
      // Filter routes specifically for guests
      return this.routes.filter((route) => !route.adminOnly);
    },
    guestId() {
      return localStorage.getItem("guestId"); // Retrieve guest ID from localStorage
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
    // Fetch cart items for the guest user
    async fetchCartItems() {
      if (!this.guestId) return; // Exit if no guest ID is found

      try {
        const response = await axios.get("http://localhost:3004/cart", {
          params: { user: this.guestId },
        });
        const cartItems = response.data;

        // Calculate the total number of items in the cart
        this.cartItemCount = cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    },
    // Fetch orders (receipts) for the guest user
    async fetchOrders() {
      if (!this.guestId) return; // Exit if no guest ID is found

      try {
        const response = await axios.get("http://localhost:3003/orders");
        const orders = response.data;

        // Filter orders for the guest user
        const guestOrders = orders.filter(
          (order) => order.user === this.guestId
        );

        // Calculate the total number of orders
        this.orderCount = guestOrders.length;
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
  },
  mounted() {
    if (this.guestId) {
      this.fetchCartItems(); // Fetch cart items when the component is mounted
      this.fetchOrders(); // Fetch orders when the component is mounted
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

/* Styles for the badge */
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
</style>