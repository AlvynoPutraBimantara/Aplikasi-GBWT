<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <div class="list-group list-group-flush">
      <router-link
        to="/DataUser"
        class="list-group-item list-group-item-action bg-light"
        >Data User</router-link
      >
      <router-link
        to="/DataProduk"
        class="list-group-item list-group-item-action bg-light"
        >Data Produk</router-link
      >
      <router-link
        to="/DataKategori"
        class="list-group-item list-group-item-action bg-light"
        >Data Kategori</router-link
      >
      <router-link
        to="/TambahWarung"
        class="list-group-item list-group-item-action bg-light"
        >Tambah Warung</router-link
      >
      <router-link
        to="/TambahProduk"
        class="list-group-item list-group-item-action bg-light"
        >Tambah Produk</router-link
      >
      <router-link
        to="/TambahKategori"
        class="list-group-item list-group-item-action bg-light"
        >Tambah Kategori</router-link
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
  name: "Sidebar",
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
