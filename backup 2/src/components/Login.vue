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
          <span @click="togglePasswordVisibility">
            <font-awesome-icon :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
          </span>
        </div>
        
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
      showPassword: false,
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
      "http://localhost:3001/login",
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

    // Check for successful response
    if (response.data && response.data.success) {
      const user = response.data;
      
      // Store user info in localStorage (without sensitive data)
      const userInfo = {
        id: user.id,
        Nama: user.Nama,
        NamaWarung: user.NamaWarung,
        role: user.role,
        token: user.token
      };
      
      localStorage.setItem("user-info", JSON.stringify(userInfo));
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;

      // Redirect based on role
      const targetRoute = user.role === "admin" ? "DataUser" : "Dashboard";
      this.$router.push({ name: targetRoute });
      
      // Small delay before reload to ensure route change
      setTimeout(() => window.location.reload(), 100);
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
    // Focus name input on component mount
    this.$refs.nameInput.focus();
    
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
  background: rgba(255, 255, 255, 0.5);
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
  padding-left: 10px;
  padding-right: 40px;
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