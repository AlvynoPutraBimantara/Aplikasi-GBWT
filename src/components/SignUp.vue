<template>
  <div class="signup-container">
    <h1 class="title">Daftar</h1>
    <div class="signup-box">
      <div class="register">
        <input type="text" v-model="Nama" placeholder="Masukan nama" />
        <input type="text" v-model="Telp" placeholder="Masukan No.telp (0812345678910)" />
        <input type="text" v-model="Alamat" placeholder="Masukan Alamat" />
        
        <div class="password-input">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="Password"
            placeholder="Masukan Password"
          />
          <span @click="togglePasswordVisibility">
            <font-awesome-icon :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
          </span>
        </div>
        <div class="password-input">
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            placeholder="Konfirmasi Password"
          />
          <span @click="toggleConfirmPasswordVisibility">
            <font-awesome-icon :icon="showConfirmPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
          </span>
        </div>

        <button v-on:click="SignUp">Daftar</button>
        <p><router-link to="/login">Login</router-link></p>
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
      Alamat: "",
      Password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    async SignUp() {
      if (
        this.Nama === "" ||
        this.Telp === "" ||
        this.Password === "" ||
        this.confirmPassword === "" ||
        this.Alamat === ""
      ) {
        alert("Semua field wajib diisi.");
        return;
      }

      if (this.Password !== this.confirmPassword) {
        alert("Konfirmasi password tidak cocok.");
        return;
      }

      if (this.Telp.toString().length < 10) {
        alert("Nomor telepon harus minimal 10 digit.");
        return;
      }

      let formattedTelp = this.Telp.toString();
      if (formattedTelp.startsWith("0")) {
        formattedTelp = "62" + formattedTelp.substring(1);
      }

      try {
        const result = await axios.post("http://localhost:3000/user", {
          Nama: this.Nama,
          Telp: formattedTelp,
          Alamat: this.Alamat,
          Password: this.Password,
        });
        
        if (result.status === 201) {
          const userData = result.data;
          localStorage.setItem("user-info", JSON.stringify(userData));
          alert("Pendaftaran berhasil!");
          this.$router.push({ name: "Dashboard" });
        }
      } catch (error) {
        console.error("Error during sign up:", error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
        }
      }
    },
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
  background: rgba(255, 255, 255, 0.5);
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
  padding-left: 10px;
}

.password-input {
  position: relative;
  width: 300px;
  margin-bottom: 10px;
}

.password-input input {
  width: 100%;
  height: 40px;
  padding-left: 10px;
  padding-right: 40px;
  border: 1px solid skyblue;
}

.password-input span {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
  color: rgb(10, 10, 10);
  opacity: 0.6;
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
