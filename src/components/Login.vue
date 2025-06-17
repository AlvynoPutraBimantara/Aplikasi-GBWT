<template>
  <div class="login-container">
    <h1 class="title">Login</h1>
    <div class="login-box">
      <div class="login">
        <input 
          ref="nameInput"
          type="text" 
          v-model="Nama" 
          placeholder="Masukan nama"
          @keydown.enter="login"
          @keydown.down="focusPassword"
        />
        
        <!-- Password Input with Toggle -->
        <div class="password-input">
          <input
            ref="passwordInput"
            :type="showPassword ? 'text' : 'password'"
            v-model="Password"
            placeholder="Masukan Password"
            @keydown.enter="login"
            @keydown.up="focusName"
          />
          <span class="eye-icon" @click="togglePasswordVisibility">
            <font-awesome-icon :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
          </span>
        </div>
        
        <button @click="login">Login</button>
        <p>
          <router-link to="/sign-up">Daftar</router-link>
        </p>
        <p class="forgot-password">
         <router-link :to="{ name: 'ForgotPassword' }">Lupa Password</router-link>
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
      showPassword: false,
      apiBaseUrl: "" // Will be set in mounted()
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    focusName() {
      this.$refs.nameInput.focus();
    },
    focusPassword() {
      this.$refs.passwordInput.focus();
    },
    getApiBaseUrl() {
      // Check if we're running on localhost or on a network address
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001";
      } else {
        // Replace with your actual server IP if different
        return "http://192.168.100.8:3001";
      }
    },
    async login() {
      const nama = this.Nama.trim();
      const password = this.Password.trim();

      if (!nama || !password) {
        alert("Harap masukkan nama dan password");
        return;
      }

      try {
        console.log("Attempting login for:", nama);
        const response = await axios.post(
          `${this.apiBaseUrl}/login`,
          { 
            Nama: nama,
            Password: password 
          },
          {
            headers: { 
              'Content-Type': 'application/json' 
            }
          }
        );

        if (response.data && response.data.success) {
          const user = response.data;

          // Store all necessary user info (excluding sensitive info like password)
          localStorage.setItem("token", user.token);
          localStorage.setItem("user-info", JSON.stringify({
            id: user.id,
            Nama: user.Nama,
            NamaWarung: user.NamaWarung,
            role: user.role
          }));

          // Set axios default header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

          // Redirect user based on role
          const targetRoute = user.role === "admin" ? "DataUser" : "Dashboard";
          this.$router.push({ name: targetRoute });
          
          // Small delay before reload to ensure route change
          setTimeout(() => window.location.reload(), 1);
        } else {
          throw new Error(response.data?.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error.response) {
          if (error.response.status === 401) {
            alert("Nama atau password salah");
          } else {
            alert(`Error: ${error.response.data?.message || "Terjadi kesalahan"}`);
          }
        } else {
          alert("Tidak dapat terhubung ke server");
        }
      }
    },
  },
  mounted() {
    this.apiBaseUrl = this.getApiBaseUrl();
    this.$refs.nameInput.focus();

    const user = localStorage.getItem("user-info");
    if (user) {
      const parsedUser = JSON.parse(user);
      const targetRoute = parsedUser.role === "admin" ? "DataUser" : "Dashboard";
      this.$router.push({ name: targetRoute });
    }
  },
};
</script>

<style scoped>
.login-container {
  background-image: url("@/assets/images/warung.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 10px;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.login-box {
  font-size: 20px;
  background: rgba(255, 255, 255, 0.85);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.7);
  margin-bottom: 30px;
  width: 100%;
  max-width: 450px;
}

.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  width: 100%;
}

.login input {
  width: 100%;
  height: 50px;
  margin-bottom: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login input:focus {
  border-color: darkblue;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 0, 139, 0.2);
}

.password-input {
  position: relative;
  width: 100%;
  margin-bottom: 25px;
}

.password-input input {
  width: 100%;
  height: 50px;
  padding-right: 45px;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding-left: 15px;
  font-size: 1rem;
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

.login button {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 8px;
  background: darkblue;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.login button:hover {
  background: navy;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.login p {
  margin-top: 20px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: rgba(169, 169, 169, 0.7);
  border-radius: 8px;
  padding: 10px 20px;
  width: 100%;
  transition: all 0.3s ease;
}

.login p:hover {
  background-color: rgba(169, 169, 169, 0.9);
}

.login p a {
  color: #333;
  text-decoration: none;
}

.forgot-password {
  margin-top: 10px;
  font-size: 1rem !important;
  background-color: transparent !important;
  padding: 0 !important;
}

.forgot-password a {
  color: darkblue;
  text-decoration: underline;
}

/* Tablet and Medium Screens */
@media (max-width: 992px) {
  .login-box {
    padding: 25px;
    max-width: 400px;
  }
  
  .title {
    font-size: 2rem;
    margin-bottom: 25px;
  }
  
  .login input,
  .password-input input,
  .login button {
    height: 45px;
  }
}

/* Mobile Devices */
@media (max-width: 768px) {
  .login-container {
    padding: 15px;
    background-attachment: scroll;
  }
  
  .login-box {
    padding: 20px;
    max-width: 350px;
    margin-bottom: 20px;
  }
  
  .title {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }
  
  .login p {
    font-size: 1.1rem;
    padding: 8px 15px;
  }
}

/* Small Mobile Devices */
@media (max-width: 480px) {
  .login-box {
    padding: 15px;
    max-width: 300px;
  }
  
  .title {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .login input,
  .password-input input,
  .login button {
    height: 42px;
    font-size: 0.9rem;
  }
  
  .login p {
    font-size: 1rem;
    padding: 6px 12px;
  }
  
  .forgot-password {
    font-size: 0.9rem !important;
  }
}
</style>