<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <div class="list-group list-group-flush">
      <router-link
        to="/Dashboard"
        class="list-group-item list-group-item-action bg-light"
        >Dashboard</router-link
      >
      <router-link
        to="/Produk"
        class="list-group-item list-group-item-action bg-light"
        >Produk</router-link
      >
      <router-link
        to="/Kategori"
        class="list-group-item list-group-item-action bg-light"
        >Kategori</router-link
      >
      <router-link
        to="/Warung"
        class="list-group-item list-group-item-action bg-light"
        >Warung</router-link
      >
      <router-link
        to="/Orders"
        class="list-group-item list-group-item-action bg-light"
        ><font-awesome-icon :icon="['fas', 'receipt']"
      /></router-link>
      <router-link
        to="/Cart"
        class="list-group-item list-group-item-action bg-light"
        ><font-awesome-icon :icon="['fas', 'shopping-cart']"
      /></router-link>
      <button @click="goToLogin">Login</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "GuestSidebar",
  methods: {
    goToLogin() {
      this.$router.push({ name: "Login" }).then(() => {
        window.location.reload();
      });
    },
  },
};
</script>

<style scoped>
.list-group-item-action {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.list-group-item-action:hover {
  background-color: darkblue;
  color: white;
}

.sidebar-heading {
  padding: 2rem 2rem;
  font-size: 24px;
  font-weight: bold;
}
</style>
