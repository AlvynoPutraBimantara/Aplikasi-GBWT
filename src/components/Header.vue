<template>
  <nav class="nav">
    <button class="bg-light btn-primary" @click="toggleMenu" id="menu-toggle">
      Menu
    </button>
    <router-link
      v-if="isAdmin"
      to="/DataUser"
      :class="{ active: isActive('/DataUser') }"
    >
      Data User
    </router-link>
    <router-link
      v-if="isAdmin"
      to="/DataProduk"
      :class="{ active: isActive('/DataProduk') }"
    >
      Data Produk
    </router-link>
    <router-link
      v-if="isAdmin"
      to="/DataKategori"
      :class="{ active: isActive('/DataKategori') }"
    >
      Data Kategori
    </router-link>
    <a @click.prevent="logout" class="logout-btn" href="#">Logout</a>
  </nav>
</template>

<script>
export default {
  name: "Header",
  computed: {
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user && user.role === "admin";
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
