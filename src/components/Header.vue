<template>
  <nav class="nav">
    <button class="btn btn-primary" @click="toggleMenu" id="menu-toggle">
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
    <a @click.prevent="logout" href="#">Logout</a>
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
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  width: 100vw; /* Set width to full viewport width */
}

.nav a,
.nav button {
  color: aliceblue;
  padding: 20px;
  text-align: center;
  font-size: 19px;
  text-decoration: none;
  margin-right: 5px;
}

.nav a:hover,
.nav button:hover,
.nav a.active {
  background: #ddd;
  color: #333;
}
</style>
