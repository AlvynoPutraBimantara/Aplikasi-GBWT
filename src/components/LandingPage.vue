<template>
  <div class="landing-container">
    <div class="landing-content">
      <h1 class="title">Selamat Datang di-Aplikasi GBWT</h1>
      <p class="subtitle">(Gerakan Belanja di Warung Tetangga)</p>
      <div class="button-container">
        <button class="button" @click="guestSignIn">Masuk</button>
        <button class="button" @click="goToLogin">Login</button>
      </div>
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

.landing-content {
  font-size: 20px;
  background: rgba(255, 255, 255, 0.75);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.7);
  margin-bottom: 30px;
}
</style>
