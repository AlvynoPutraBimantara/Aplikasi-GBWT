<template>
  <div class="signup-container">
    <h1 class="title">Lupa Password</h1>
    <div class="signup-box">
      <div class="register">
        <input type="text" v-model="Nama" placeholder="Masukan nama" />
        <input type="text" v-model="Telp" placeholder="Masukan No.telp (0812345678910)" />

        <div class="password-input">
          <input
            :type="showNewPassword ? 'text' : 'password'"
            v-model="newPassword"
            placeholder="Password Baru"
          />
          <span @click="toggleNewPasswordVisibility">
            <font-awesome-icon :icon="showNewPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
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

        <button @click="handleReset">Ubah Password</button>

        <div class="contact-admin">
          <p>Jika anda masih mengalami masalah, anda dapat menghubungi admin</p>
        <a
  href="https://wa.me/6287857909820"
  target="_blank"
  class="whatsapp-button"
>
  Hubungi Admin    <font-awesome-icon icon="fa-brands fa-whatsapp" />
</a>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ForgotPassword",
  data() {
    return {
      Nama: "",
      Telp: "",
      newPassword: "",
      confirmPassword: "",
      showNewPassword: false,
      showConfirmPassword: false,
    };
  },
  methods: {
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    formatPhoneNumber(telp) {
      return telp.toString().trim().replace(/^0/, '62').replace(/^\+/, '').replace(/\D/g, '');
    },
    goToWhatsApp() {
      window.open('https://wa.me/6287857909820', '_blank');
    },
    async handleReset() {
      if (!this.Nama || !this.Telp || !this.newPassword || !this.confirmPassword) {
        alert("Harap isi semua field");
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        alert("Konfirmasi password tidak cocok");
        return;
      }

      const formattedTelp = this.formatPhoneNumber(this.Telp);

      try {
        const telpCheck = await axios.get(
          `http://localhost:3001/user/check-phone?telp=${formattedTelp}`
        );

        if (!telpCheck.data.exists) {
          alert(`Nomor telepon ${formattedTelp} tidak terdaftar`);
          return;
        }

        if (telpCheck.data.user.Nama !== this.Nama) {
          alert(`Nama tidak cocok dengan nomor telepon ${formattedTelp}`);
          return;
        }

        const updateRes = await axios.put(
          `http://localhost:3001/user/${telpCheck.data.user.id}/reset-password`,
          { newPassword: this.newPassword }
        );

        if (updateRes.data.success) {
          alert("Password berhasil diubah!");
          this.$router.push({ name: "Login" });
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        let errorMessage = "Terjadi kesalahan saat mengubah password";

        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "Nomor telepon tidak ditemukan";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }

        alert(errorMessage);
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
  color: black;
}

.signup-box {
  background: rgba(255, 255, 255, 0.75);
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
  margin-bottom: 20px;
}

.contact-admin {
  text-align: center;
  margin-top: 20px;
  color: black;
}

.contact-admin p {
  margin-bottom: 10px;
  font-size: 16px;
}

.whatsapp-button {
  display: inline-flex;
  align-items: center;
  background-color: #25D366;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 15px;
}

.whatsapp-button:hover {
  background-color: #128C7E;
}

.whatsapp-button font-awesome-icon {
  margin-left: 10px;
  font-size: 20px;
}
</style>
