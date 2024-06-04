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
      if (this.Nama === "" || this.Password === "") {
        alert("Please enter both name and password");
        return;
      }

      try {
        let result = await axios.get(
          `http://localhost:3000/User?Nama=${this.Nama}&Password=${this.Password}`
        );
        if (result.status === 200 && result.data.length > 0) {
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
      } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again later.");
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

<style scoped>
.login input {
  width: 300px;
  height: 40px;
  display: block;
  margin-bottom: 30px;
  margin-right: auto;
  margin-left: auto;
  border: 1px solid skyblue;
}
.login button {
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
