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
      {{ route.name }}
    </router-link>
    <a @click.prevent="logout" class="logout-btn" href="#">Logout</a>
  </nav>
</template>

<script>
export default {
  name: "GuestHeader",
  computed: {
    filteredRoutes() {
      // Filter routes specifically for guests
      return this.routes.filter(route => !route.adminOnly);
    },
  },
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
    };
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
  },
  mounted() {
  // Ensure sidebar is hidden by default on page reload
  document.getElementById("wrapper").classList.remove("toggled");
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
