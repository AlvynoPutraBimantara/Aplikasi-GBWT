// UserHeader.vue
<template>
  <div class="nav">
    <button class="btn btn-primary" id="menu-toggle">Menu</button>
    <router-link to="/Dashboard">Dashboard</router-link>
    <router-link to="/Warung">Warung</router-link>
    <router-link to="/Produk">Produk</router-link>
    <router-link to="/Kategori">Kategori</router-link>
    <router-link to="/Orders">STRUK</router-link>
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
.nav button:hover {
  background: #ddd;
  color: #333;
}
</style>
