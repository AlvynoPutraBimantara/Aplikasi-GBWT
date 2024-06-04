<template>
  <div class="landing-page">
    <h1 class="title">Selamat Datang di-Aplikasi GBWT</h1>
    <p class="subtitle">(Gerakan Belanja di Warung Tetangga)</p>
    <div class="button-container">
      <button class="button" @click="guestSignIn">Guest Sign In</button>
      <button class="button" @click="goToLogin">Login</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "LandingPage",
  methods: {
    guestSignIn() {
      localStorage.setItem("guest", "true");
      this.$router.push({ name: "Dashboard" });
    },
    goToLogin() {
      this.$router.push({ name: "Login" });
    },
  },
};
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.title {
  font-size: xxx-large;
  margin: 0;
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
</style>
