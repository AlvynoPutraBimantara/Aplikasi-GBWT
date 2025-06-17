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
import { v4 as uuidv4 } from 'uuid';

export default {
  name: "LandingPage",
  data() {
    return {
      isLoading: false,
      deviceId: null,
      services: {
        user: process.env.VUE_APP_USER_SERVICE_URL,
        product: process.env.VUE_APP_PRODUCT_SERVICE_URL,
        category: process.env.VUE_APP_CATEGORY_SERVICE_URL,
        cart: process.env.VUE_APP_CART_SERVICE_URL,
        orders: process.env.VUE_APP_ORDERS_SERVICE_URL,
        transactions: process.env.VUE_APP_TRANSACTIONS_SERVICE_URL
      }
    };
  },
  created() {
    this.deviceId = localStorage.getItem('deviceId') || uuidv4();
    localStorage.setItem('deviceId', this.deviceId);
  },
  methods: {
    async guestSignIn() {
      localStorage.removeItem("token");
      localStorage.removeItem("guestId");
      localStorage.removeItem("isGuest");
      localStorage.removeItem("user-info");

      this.isLoading = true;
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/guest-signin`,
          {
            deviceId: this.deviceId
          },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Device-Id': this.deviceId
            } 
          }
        );

        if (response.data.token && response.data.user) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user-info', JSON.stringify({
            ...response.data.user,
            deviceId: this.deviceId
          }));
          localStorage.setItem('guestId', response.data.userId || response.data.user?.id || '');
          localStorage.setItem('isGuest', 'true');

          this.initializeServices(response.data.token);
          window.location.href = '/GuestDashboard';
        } else {
          throw new Error('Invalid server response');
        }
      } catch (error) {
        console.error('Guest sign-in error:', {
          message: error.response?.data?.message || error.message,
          status: error.response?.status
        });
        alert(`Gagal membuat sesi tamu: ${error.response?.data?.message || error.message}`);
      } finally {
        this.isLoading = false;
      }
    },
    
    initializeServices(token) {
      const services = Object.keys(this.services);
      services.forEach(service => {
        axios.defaults.baseURL = this.services[service];
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['X-Device-Id'] = this.deviceId;
      });
      
      axios.interceptors.response.use(
        response => response,
        error => {
          if (error.response && error.response.status === 401) {
            this.handleSessionExpired();
          }
          return Promise.reject(error);
        }
      );
    },
    
    handleSessionExpired() {
      localStorage.clear();
      localStorage.setItem('deviceId', this.deviceId);
      this.$router.push({ name: 'LandingPage' });
      alert('Sesi telah berakhir. Silakan masuk kembali.');
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
  background-attachment: fixed;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: black;
  padding: 20px;
}

.landing-content {
  font-size: 20px;
  background: rgba(255, 255, 255, 0.85);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.7);
  margin-bottom: 30px;
  text-align: center;
  max-width: 90%;
}

.title {
  font-size: 2.5rem;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.2rem;
  margin: 10px 0 30px 0;
}

.button-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.button {
  min-width: 180px;
  height: 50px;
  font-size: 1rem;
  cursor: pointer;
  background-color: darkblue;
  color: white;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 0 20px;
}

.button:hover {
  background-color: navy;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* Tablet and Medium Screens */
@media (max-width: 992px) {
  .landing-content {
    padding: 25px;
    width: 80%;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
  
  .button {
    min-width: 160px;
    height: 45px;
    font-size: 0.9rem;
  }
}

/* Mobile Devices */
@media (max-width: 768px) {
  .landing-container {
    padding: 15px;
    background-attachment: scroll;
  }
  
  .landing-content {
    padding: 20px;
    width: 90%;
    margin-bottom: 20px;
  }
  
  .title {
    font-size: 1.8rem;
    margin-bottom: 15px;
  }
  
  .subtitle {
    font-size: 1rem;
    margin-bottom: 25px;
  }
  
  .button-container {
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }
  
  .button {
    width: 100%;
    height: 45px;
    font-size: 0.9rem;
  }
}

/* Small Mobile Devices */
@media (max-width: 480px) {
  .landing-content {
    padding: 15px;
    width: 95%;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
  
  .button {
    height: 42px;
    font-size: 0.85rem;
  }
}
</style>