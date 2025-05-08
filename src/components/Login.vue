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
    // In src/components/Login.vue, update the login method:
// In src/components/Login.vue, update the login method:
async login() {
  const nama = this.Nama.trim();
  const password = this.Password.trim();

  if (!nama || !password) {
    alert("Please enter both username and password");
    return;
  }

  try {
    const response = await axios.post(
      'http://localhost:3000/user-service/login', 
      {
        Nama: nama,
        Password: password
      }, 
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    if (response.data && response.data.success) {
      const { token, user, imageUrl } = response.data.data;
      
      // Store user info
      localStorage.setItem("user-info", JSON.stringify({
        ...user,
        token,
        imageUrl
      }));
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Redirect based on role
      this.$router.push({ 
        name: user.role === "admin" ? "DataUser" : "Dashboard" 
      });
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    let message = "Login failed. Please try again.";
    
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.status === 401) {
        message = "Invalid username or password";
      }
    }
    
    alert(message);
  }
}
  },
  mounted() {
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
