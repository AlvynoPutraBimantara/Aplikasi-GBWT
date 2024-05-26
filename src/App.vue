<template>
  <div id="wrapper" class="d-flex">
    <!-- Sidebar -->
    <Sidebar v-if="isAdmin" @logout="logout" />
    <UserSidebar v-if="isUser" @logout="logout" />
    <!-- /#sidebar-wrapper -->

    <!-- Page Content -->
    <div id="page-content-wrapper">
      <div class="container-fluid">
        <!-- Router view for dynamic content -->
        <router-view></router-view>
      </div>
    </div>
    <!-- /#page-content-wrapper -->
  </div>
  <!-- /#wrapper -->
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "popper.js/dist/umd/popper.min.js";
import "jquery/dist/jquery.min.js";
import "./App.css";
import Sidebar from "./components/Sidebar.vue";
import UserSidebar from "./components/UserSidebar.vue";

export default {
  name: "App",
  components: {
    Sidebar,
    UserSidebar,
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("user-info");
    },
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user && user.role === "admin";
    },
    isUser() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user && user.role !== "admin";
    },
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
