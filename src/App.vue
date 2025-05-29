<template>
  <div id="wrapper" class="d-flex">
    <!-- Sidebar -->
    <Sidebar v-if="isAdmin" @logout="logout" />
    <UserSidebar v-else-if="isRegularUser" @logout="logout" />
    <GuestSidebar v-else-if="isGuest" @logout="logout" />

    <!-- Page Content -->
    <div id="page-content-wrapper" class="flex-column">
      <!-- Header -->
      <Header v-if="isAdmin" @toggle-sidebar="toggleSidebar" />
      <UserHeader v-else-if="isRegularUser" />
      <GuestHeader v-else-if="isGuest" />

      <div class="container-fluid">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "popper.js/dist/umd/popper.min.js";
import "jquery/dist/jquery.min.js";
import "./App.css";

import Sidebar from "./components/Sidebar.vue";
import UserSidebar from "./components/UserSidebar.vue";
import GuestSidebar from "./components/GuestSidebar.vue";
import Header from "./components/Header.vue";
import GuestHeader from "./components/GuestHeader.vue";
import UserHeader from "./components/UserHeader.vue";

export default {
  name: "App",
  components: {
    Sidebar,
    UserSidebar,
    GuestSidebar,
    Header,
    GuestHeader,
    UserHeader,
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("token");
    },
    userInfo() {
      try {
        return JSON.parse(localStorage.getItem("user-info")) || {};
      } catch {
        return {};
      }
    },
    isAdmin() {
      return this.userInfo.role === "admin";
    },
    isRegularUser() {
      return this.userInfo.role === "user";
    },
    isGuest() {
      return (
        this.userInfo.role === "guest" ||
        localStorage.getItem("isGuest") === "true"
      );
    },
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push({ name: "LandingPage" }).then(() => {
        window.location.reload();
      });
    },
    toggleSidebar() {
      document.getElementById("wrapper").classList.toggle("toggled");
    },
  },
  mounted() {
    if (!this.isLoggedIn && !this.isGuest) {
      this.$router.push({ name: "LandingPage" });
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  padding: 0;
  margin: 0;
}

.register input,
.login input,
.tambah input {
  width: 300px;
  height: 40px;
  display: block;
  margin-bottom: 30px;
  margin-right: auto;
  margin-left: auto;
  border: 1px solid skyblue;
}

.register button,
.login button,
.tambah button {
  width: 300px;
  height: 40px;
  border: 1px solid black;
  background: darkblue;
  color: white;
  cursor: pointer;
  margin-right: auto;
  margin-left: auto;
  display: block;
}
</style>
