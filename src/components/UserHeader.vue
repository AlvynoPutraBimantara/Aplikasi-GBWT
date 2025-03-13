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
      <font-awesome-icon
        v-if="route.name === 'Cart'"
        :icon="['fas', 'shopping-cart']"
      />
      <font-awesome-icon
        v-else-if="route.name === 'STRUK'"
        :icon="['fas', 'receipt']"
      />
      <span v-else>{{ route.name }}</span>
    </router-link>
    <a @click.prevent="logout" class="logout-btn" href="#">Logout</a>
  </nav>
</template>

<script>
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
      ],
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
</style>
