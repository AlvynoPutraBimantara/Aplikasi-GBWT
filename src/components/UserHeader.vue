<template>
  <div class="nav">
    <button class="btn btn-primary" id="menu-toggle">
      <font-awesome-icon :icon="['fas', 'home']" />
    </button>
    <router-link
      v-for="route in routes"
      :key="route.path"
      :to="route.path"
      :class="{ active: isActive(route.path) }"
    >
      <font-awesome-icon
        v-if="route.name === 'Cart'"
        :icon="['fas', 'shopping-cart']"
      />
      <font-awesome-icon
        v-else-if="route.name === 'STRUK'"
        :icon="['fas', 'receipt']"
      />
      <span v-else>{{ route.name }}</span>
    </router-link>
    <a v-on:click="logout" href="#">Logout</a>
  </div>
</template>

<script>
import $ from "jquery";

export default {
  name: "UserHeader",
  data() {
    return {
      userId: null,
      routes: [
        { name: "Dashboard", path: "/Dashboard" },
        { name: "Warung", path: "/Warung" },
        { name: "Produk", path: "/Produk" },
        { name: "Kategori", path: "/Kategori" },
        { name: "STRUK", path: "/Orders" },
        { name: "Cart", path: "/Cart" },
      ],
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem("user-info"));
    if (user) {
      this.userId = user.id;
    }
    $("#menu-toggle").click(function (e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
    });
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push({ name: "Login" });
    },
    isActive(route) {
      return this.$route.path === route;
    },
  },
};
</script>

<style>
.nav {
  background-color: darkblue;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  width: 100vw;
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
