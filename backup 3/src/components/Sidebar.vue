<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <div class="list-group list-group-flush">
      <router-link
        v-if="!isToggled"
        to="/DataUser"
        class="list-group-item list-group-item-action bg-light"
        >Data User</router-link
      >
      <router-link
        v-if="!isToggled"
        to="/DataProduk"
        class="list-group-item list-group-item-action bg-light"
        >Data Produk</router-link
      >
      <router-link
        v-if="!isToggled"
        to="/DataKategori"
        class="list-group-item list-group-item-action bg-light"
        >Data Kategori</router-link
      >
      <router-link
        v-if="isToggled"
        to="/TambahWarung"
        class="list-group-item list-group-item-action bg-light"
        >Tambah Warung</router-link
      >
      <router-link
        v-if="isToggled"
        to="/TambahDagangan"
        class="list-group-item list-group-item-action bg-light"
        >Tambah Produk</router-link
      >
      <router-link
        v-if="isToggled"
        to="/TambahKategori"
        class="list-group-item list-group-item-action bg-light"
        >Tambah Kategori</router-link
      >
      <button @click="toggleItems" class="toggle-btn">{{ buttonText }}</button>
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
  data() {
    return {
      isToggled: false,
    };
  },
  computed: {
    buttonText() {
      return this.isToggled ? "View Data Items" : "Add Items";
    },
  },
  methods: {
    toggleItems() {
      this.isToggled = !this.isToggled;
    },
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
  background-color: #1d3557; /* Adjusted hover color */
  color: #f1faee;
}

.toggle-btn {
  width: 100%;
  background-color: #457b9d; /* Unique button color for gbwt */
  color: white;
  border: none;
  text-align: center;
  cursor: pointer;
}

.toggle-btn:hover {
  background-color: #1d3557;
}
#sidebar-wrapper {
  min-height: 100vh;
  margin-left: -300px; /* Hidden by default */
  transition: margin 0.25s ease-out;
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: 0;
}
</style>
