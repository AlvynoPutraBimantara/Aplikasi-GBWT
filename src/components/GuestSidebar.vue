<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <div class="list-group list-group-flush">
      <router-link
        to="/GuestDashboard"
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
      <button
        @click="goToLogin"
        class="list-group-item list-group-item-action sidebar-width bg-light"
      >
        Login
      </button>

      <router-link to="/Informasi" class="list-group-item bg-light infouser"
        ><font-awesome-icon :icon="['fas', 'circle-info']" />
      </router-link>
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
#sidebar-wrapper {
  width: 250px;
}
.sidebar-width {
  width: 240px;
}
.list-group-item-action {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.list-group-item-action:hover {
  background-color: darkblue;
  color: white;
}

.infouser {
  padding-top: 200px;
}
</style>
