<template>
  <div class="landing-container">
    <div class="landing-content">
      <h1 class="title">Selamat Datang di-Aplikasi GBWT</h1>
      <p class="subtitle">(Gerakan Belanja di Warung Tetangga)</p>
      <div class="button-container">
        <button 
          class="button" 
          @click="guestSignIn"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Masuk</span>
          <span v-else>Memproses...</span>
        </button>
        <button class="button" @click="goToLogin">Login</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "LandingPage",
  data() {
    return {
      isLoading: false
    };
  },
  methods: {
async guestSignIn() {
  // Clear any existing auth state before creating new session
  localStorage.removeItem("token");
  localStorage.removeItem("guestId");
  localStorage.removeItem("isGuest");
  localStorage.removeItem("user-info");

  this.isLoading = true;
  try {
    const response = await axios.post(
      'http://localhost:3001/guest-signin',
      {},
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data.token && response.data.user) {
      // Store token, user info, and guest flag
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user-info', JSON.stringify(response.data.user));
      localStorage.setItem('guestId', response.data.userId || response.data.user?.id || '');
      localStorage.setItem('isGuest', 'true');  // Crucial flag

      // Redirect to GuestDashboard (reload ensures full state update)
      window.location.href = '/GuestDashboard';
    } else {
      throw new Error('Invalid server response');
    }
  } catch (error) {
    console.error('Guest sign-in error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status
    });
    alert(`Failed to create guest session: ${error.response?.data?.message || error.message}`);
  } finally {
    this.isLoading = false;
  }
},
    goToLogin() {
      this.$router.push({ name: "Login" });
    }
  }
};
</script>

<style scoped>
.landing-container {
  background-image: url("@/assets/images/warung.jpg");
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: black;
}

.title {
  font-size: xxx-large;
  margin: 0 0 30px 0;
}

.subtitle {
  margin: 10px 0 20px 0;
}

.button-container {
  display: flex;
  gap: 20px;
}

.button {
  width: 200px;
  height: 50px;
  font-size: large;
  cursor: pointer;
  background-color: darkblue;
  color: white;
  border: none;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: navy;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.landing-content {
  font-size: 20px;
  background: rgba(255, 255, 255, 0.75);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.7);
  margin-bottom: 30px;
}
</style>
