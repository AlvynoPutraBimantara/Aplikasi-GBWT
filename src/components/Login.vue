// Login.vue
<template>
  <h1
    style="
      font-size: xxx-large;
      margin-right: auto;
      margin-left: auto;
      display: block;
    "
  >
    Login
  </h1>
  <div class="login">
    <input type="text" v-model="Nama" placeholder="Masukan nama" />
    <input type="password" v-model="Password" placeholder="Masukan Password" />
    <button v-on:click="login">Login</button>
    <p>
      <router-link to="/sign-up">Sign Up</router-link>
    </p>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Login",
  data() {
    return {
      Nama: "",
      Password: "",
    };
  },
  methods: {
    async login() {
      let result = await axios.get(
        `http://localhost:3000/User?Nama=${this.Nama}&Password=${this.Password}`
      );
      if (result.status == 200 && result.data.length > 0) {
        const user = result.data[0];
        localStorage.setItem("user-info", JSON.stringify(user));
        if (user.role === "admin") {
          this.$router.push({ name: "DataProduk" });
        } else {
          this.$router.push({ name: "Dashboard" });
        }
      } else {
        alert("Invalid credentials");
      }
    },
  },
  mounted() {
    let user = localStorage.getItem("user-info");
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === "admin") {
        this.$router.push({ name: "DataProduk" });
      } else {
        this.$router.push({ name: "Dashboard" });
      }
    }
  },
};
</script>
