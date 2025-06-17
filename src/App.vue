<template>
  <div id="wrapper" class="d-flex">
    <!-- Sidebar -->
    <Sidebar v-if="isAdmin" @logout="logout" />
    <UserSidebar v-else-if="isRegularUser" @logout="logout" />
    <GuestSidebar v-else-if="isGuest" @logout="logout" />

    <!-- Mobile Sidebar Toggle Button -->
    <button 
      v-if="showMobileToggle"
      class="mobile-sidebar-toggle"
      @click="toggleSidebar"
    >
      <font-awesome-icon :icon="['fas', isSidebarOpen ? 'times' : 'bars']" />
    </button>

    <!-- Page Content -->
    <div id="page-content-wrapper" class="flex-column">
      <!-- Header -->
      <Header v-if="isAdmin" @toggle-sidebar="toggleSidebar" />
      <UserHeader v-else-if="isRegularUser" />
      <GuestHeader v-else-if="isGuest" />

      <div class="container-fluid">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "popper.js/dist/umd/popper.min.js";
import "jquery/dist/jquery.min.js";
import "./App.css";

import Sidebar from "./components/Sidebar.vue";
import UserSidebar from "./components/UserSidebar.vue";
import GuestSidebar from "./components/GuestSidebar.vue";
import Header from "./components/Header.vue";
import GuestHeader from "./components/GuestHeader.vue";
import UserHeader from "./components/UserHeader.vue";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

library.add(faBars, faTimes);

export default {
  name: "App",
  components: {
    Sidebar,
    UserSidebar,
    GuestSidebar,
    Header,
    GuestHeader,
    UserHeader,
  },
  data() {
    return {
      isSidebarOpen: false,
      isMobile: false
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("token");
    },
    userInfo() {
      try {
        return JSON.parse(localStorage.getItem("user-info")) || {};
      } catch {
        return {};
      }
    },
    isAdmin() {
      return this.userInfo.role === "admin";
    },
    isRegularUser() {
      return this.userInfo.role === "user";
    },
    isGuest() {
      return (
        this.userInfo.role === "guest" ||
        localStorage.getItem("isGuest") === "true"
      );
    },
    showMobileToggle() {
      return this.isMobile && (this.isAdmin || this.isRegularUser || this.isGuest);
    }
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push({ name: "LandingPage" }).then(() => {
        window.location.reload();
      });
    },
    toggleSidebar() {
      document.getElementById("wrapper").classList.toggle("toggled");
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768;
    }
  },
  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
    
    if (!this.isLoggedIn && !this.isGuest) {
      this.$router.push({ name: "LandingPage" });
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
  }
};
</script>

<style scoped>
.mobile-sidebar-toggle {
  display: none;
  position: fixed;
  left: 10px;
  top: 60px; /* Position below the header */
  z-index: 999;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: darkblue;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-sidebar-toggle:hover {
  background-color: #1a237e;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .mobile-sidebar-toggle {
    display: flex;
  }
  
  #wrapper.toggled .mobile-sidebar-toggle {
    left: 310px;
  }
  
  /* Adjust for mobile header if needed */
  .mobile-top-nav ~ .mobile-sidebar-toggle {
    top: 50px; /* Adjust based on your mobile header height */
  }
}
</style>