<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <div class="list-group list-group-flush">
      <router-link
        :to="`/Profil/${userId}`"
        class="list-group-item list-group-item-action bg-light"
        >Profil</router-link
      >
      <router-link
        to="/Pesanan"
        class="list-group-item list-group-item-action bg-light"
        >Pesanan</router-link
      >
      <router-link
        to="/Dagangan"
        class="list-group-item list-group-item-action bg-light"
        >Dagangan Saya</router-link
      >
      <router-link
        to="/Penjualan"
        class="list-group-item list-group-item-action bg-light"
        >Penjualan</router-link
      >
      <a
        v-on:click="logout"
        href="#"
        class="list-group-item list-group-item-action bg-light"
        >Logout</a
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "UserSidebar",
  computed: {
    userId() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user ? user.id : null;
    },
  },
  methods: {
    logout() {
      this.$emit("logout");
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
</style>
