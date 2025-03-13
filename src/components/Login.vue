<template>
  <div class="login-container">
    <h1 class="title">Login</h1>
    <div class="login-box">
      <div class="login">
        <input type="text" v-model="Nama" placeholder="Masukan nama" />
        <input
          type="password"
          v-model="Password"
          placeholder="Masukan Password"
        />
        <button @click="login">Login</button>
        <p>
          <router-link to="/sign-up">Daftar</router-link>
        </p>
      </div>
    </div>
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
      const result = await axios.post("http://localhost:3001/login", {
        Nama: this.Nama,
        Password: this.Password,
      });

      if (result.status === 200) {
        const user = result.data;
        localStorage.setItem("user-info", JSON.stringify(user));

        if (user.role === "admin") {
          this.$router.push({ name: "DataUser" });
        } else {
          this.$router.push({ name: "Dashboard" });
        }

        // Reload the page after redirection
        setTimeout(() => window.location.reload(), 1);
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response && error.response.status === 401) {
        alert("Invalid credentials");
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  },
},

  mounted() {
    const user = localStorage.getItem("user-info");
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === "admin") {
        this.$router.push({ name: "DataUser" });
      } else {
        this.$router.push({ name: "Dashboard" });
      }
    }
  },
};
</script>

<style scoped>
.login-container {
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

.login-box {
  font-size: 20px;
  background: rgba(255, 255, 255, 0.5); /* White with 20% opacity */
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.7);
  margin-bottom: 30px;
}

.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
}

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

.login p {
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
