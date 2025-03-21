<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <div class="list-group list-group-flush">
      <router-link
        :to="{ path: '/GuestDashboard', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
        >Dashboard</router-link
      >
      <router-link
        :to="{ path: '/Produk', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
        >Produk</router-link
      >
      <router-link
        :to="{ path: '/Kategori', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
        >Kategori</router-link
      >
      <router-link
        :to="{ path: '/Warung', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
        >Warung</router-link
      >
      <router-link
        :to="{ path: '/Orders', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
        >Pesanan</router-link
      >
      <router-link
        :to="{ path: '/Cart', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light"
        >Keranjang</router-link
      >
      <router-link
        :to="{ path: '/Informasi', query: { guestId: $route.query.guestId, is_guest: $route.query.is_guest } }"
        class="list-group-item list-group-item-action bg-light infouser"
        ><font-awesome-icon :icon="['fas', 'circle-info']" /></router-link
      >
      <button
        @click="goToLogin"
        class="bg-light login-btn"
      >
        Login
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "GuestSidebar",
  methods: {
    goToLogin() {
      this.$router.push({ name: "Login" });
    },
  },
};
</script>

<style scoped>


#sidebar-wrapper {
  min-height: 100vh;
  margin-left: -300px; /* Hidden by default */
  transition: margin 0.25s ease-out;
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: 0;
}

.infouser {
  padding-top: 25vh;
}

.login-btn {
  width: 100%; /* Match sidebar width */
  text-align: center; /* Center-align text */
  border: none; /* Optional: Remove button border */
  cursor: pointer;
}
</style>
