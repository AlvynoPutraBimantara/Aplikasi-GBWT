<template>
  <div class="signup-container">
    <h1 class="title">Daftar</h1>
    <div class="signup-box">
      <div class="register">
        <input type="text" v-model="Nama" placeholder="Masukan nama" />
        <input
          type="text"
          v-model="Telp"
          placeholder="Masukan No.telp (+62-812345678910)"
        />
        <input
          type="password"
          v-model="Password"
          placeholder="Masukan Password"
        />
        <button v-on:click="SignUp">Daftar</button>
        <p>
          <router-link to="/login">Login</router-link>
        </p>
      </div>
    </div>
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

<style scoped>
.signup-container {
  background-image: url("@/assets/images/warung.jpg");
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.title {
  font-size: xxx-large;
  margin-bottom: 30px;
}

.signup-box {
  background: rgba(255, 255, 255, 0.5); /* White with 50% opacity */
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.7);
  margin-bottom: 30px;
}

.register {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
}

.register input {
  width: 300px;
  height: 40px;
  display: block;
  margin-bottom: 30px;
  margin-right: auto;
  margin-left: auto;
  border: 1px solid skyblue;
}

.register button {
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

.register p {
  margin-top: 20px;
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  background-color: darkgrey;
  border-radius: 15px;
  padding-left: 30px;
  padding-right: 30px;
}
</style>
