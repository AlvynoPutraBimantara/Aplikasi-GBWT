<template>
  <div class="forgot-container">
    <div class="forgot-content">
      <h1 class="title">Lupa Password</h1>
      <div class="form-box">
        <div class="form-group">
          <input type="text" v-model="Nama" placeholder="Masukan nama" />
          <input type="text" v-model="Telp" placeholder="Masukan No.telp (0812345678910)" />

          <div class="password-input">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              v-model="newPassword"
              placeholder="Password Baru"
            />
            <span @click="toggleNewPasswordVisibility" class="eye-icon">
              <font-awesome-icon :icon="showNewPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
            </span>
          </div>

          <div class="password-input">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Konfirmasi Password"
            />
            <span @click="toggleConfirmPasswordVisibility" class="eye-icon">
              <font-awesome-icon :icon="showConfirmPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
            </span>
          </div>

          <button @click="handleReset" class="submit-btn">Ubah Password</button>

          <div class="contact-admin">
            <p>Jika anda masih mengalami masalah, anda dapat menghubungi admin</p>
            <a
              href="https://wa.me/6287857909820"
              target="_blank"
              class="whatsapp-button"
            >
              Hubungi Admin <font-awesome-icon icon="fa-brands fa-whatsapp" />
            </a>
          </div>
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
        // Check phone number using user service
        const telpCheck = await axios.get(
          `${process.env.VUE_APP_USER_SERVICE_URL}/user/check-phone`,
          { params: { telp: formattedTelp } }
        );

        if (!telpCheck.data.exists) {
          alert(`Nomor telepon ${formattedTelp} tidak terdaftar`);
          return;
        }

        if (telpCheck.data.user.Nama !== this.Nama) {
          alert(`Nama tidak cocok dengan nomor telepon ${formattedTelp}`);
          return;
        }

        // Reset password using user service
        const updateRes = await axios.put(
          `${process.env.VUE_APP_USER_SERVICE_URL}/user/${telpCheck.data.user.id}/reset-password`,
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
.forgot-container {
  background-image: url("@/assets/images/warung.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.forgot-content {
  width: 100%;
  max-width: 500px;
}

.title {
  font-size: 2.5rem;
  color: black;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.8);
}

.form-box {
  background: rgba(255, 255, 255, 0.85);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.7);
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group input {
  width: 100%;
  height: 50px;
  padding: 0 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: darkblue;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 139, 0.2);
}

.password-input {
  position: relative;
  width: 100%;
}

.eye-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #555;
  transition: color 0.3s ease;
}

.eye-icon:hover {
  color: darkblue;
}

.submit-btn {
  width: 100%;
  height: 50px;
  background-color: darkblue;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: navy;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.contact-admin {
  text-align: center;
  margin-top: 20px;
  color: #333;
}

.contact-admin p {
  margin-bottom: 15px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.whatsapp-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #25D366;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  width: 100%;
  max-width: 250px;
  margin: 0 auto;
}

.whatsapp-button:hover {
  background-color: darkgreen;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Tablet and Medium Screens */
@media (max-width: 992px) {
  .forgot-content {
    max-width: 450px;
  }
  
  .title {
    font-size: 2.2rem;
  }
  
  .form-box {
    padding: 25px;
  }
  
  .form-group input,
  .submit-btn {
    height: 45px;
  }
}

/* Mobile Devices */
@media (max-width: 768px) {
  .forgot-container {
    padding: 15px;
    background-attachment: scroll;
  }
  
  .forgot-content {
    max-width: 90%;
  }
  
  .title {
    font-size: 1.8rem;
    margin-bottom: 15px;
  }
  
  .form-box {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .form-group {
    gap: 15px;
  }
  
  .form-group input,
  .submit-btn {
    height: 42px;
    font-size: 0.9rem;
  }
  
  .contact-admin p {
    font-size: 0.85rem;
  }
  
  .whatsapp-button {
    font-size: 0.9rem;
    padding: 10px 15px;
  }
}

/* Small Mobile Devices */
@media (max-width: 480px) {
  .forgot-content {
    max-width: 95%;
  }
  
  .title {
    font-size: 1.6rem;
  }
  
  .form-box {
    padding: 15px;
  }
  
  .form-group input,
  .submit-btn {
    height: 40px;
    font-size: 0.85rem;
  }
  
  .whatsapp-button {
    font-size: 0.85rem;
  }
}
</style>