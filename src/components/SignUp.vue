// SignUp.vue
<template>
  <h1
    style="
      font-size: xxx-large;
      margin-right: auto;
      margin-left: auto;
      display: block;
    "
  >
    Daftar
  </h1>
  <div class="register">
    <input type="text" v-model="Nama" placeholder="Masukan nama" />
    <input
      type="text"
      v-model="Telp"
      placeholder="Masukan No.telp (+62-812345678910)"
    />
    <input type="password" v-model="Password" placeholder="Masukan Password" />
    <button v-on:click="SignUp">Daftar</button>
    <p>
      <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "SignUp",
  data() {
    return {
      Nama: "",
      Telp: "",
      Password: "",
    };
  },
  methods: {
    async SignUp() {
      if (this.Nama === "" || this.Telp === "" || this.Password === "") {
        alert("All fields are required.");
        return;
      }

      if (this.Telp.toString().length < 10) {
        alert("Phone number must be at least 10 digits.");
        return;
      }

      try {
        let result = await axios.post("http://localhost:3000/User", {
          Nama: this.Nama,
          Telp: this.Telp,
          Password: this.Password,
          role: "user",
        });
        console.warn(result);
        if (result.status == 201) {
          localStorage.setItem("user-info", JSON.stringify(result.data));
          this.$router.push({ name: "Dashboard" });
        }
      } catch (error) {
        console.error("Error during sign up:", error);
        alert("An error occurred. Please try again.");
      }
    },
  },
  mounted() {
    let user = localStorage.getItem("user-info");
    if (user) {
      this.$router.push({ name: "Dashboard" });
    }
  },
};
</script>
