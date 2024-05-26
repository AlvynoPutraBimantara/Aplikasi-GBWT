<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <div class="list-group list-group-flush">
      <router-link
        to="/Warung"
        class="list-group-item list-group-item-action bg-light"
        >Warung</router-link
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
        to="/UserTambahProduk"
        class="list-group-item list-group-item-action bg-light"
        >Tambah Produk</router-link
      >
      <router-link
        :to="`/Profil/${userId}`"
        class="list-group-item list-group-item-action bg-light"
        >Profil</router-link
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
/* Add any specific styles for the sidebar here */
</style>
