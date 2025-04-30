<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Aplikasi GBWT</div>
    <!-- Profile Image Display -->
    <div class="profile-image-container" v-if="userImage">
      <img :src="userImage" alt="Profile Image" class="profile-image" />
    </div>
    <div class="list-group list-group-flush">
      <router-link
        :to="`/Profil/${userId}`"
        class="list-group-item list-group-item-action bg-light"
        >Profil</router-link
      >
      <router-link
        to="/Orders"
        class="list-group-item list-group-item-action bg-light"
        >Pesanan saya</router-link
      >
      <router-link
        to="/Dagangan"
        class="list-group-item list-group-item-action bg-light"
        >Dagangan Saya</router-link
      >
      <router-link
        to="/Penjualan"
        class="list-group-item list-group-item-action bg-light"
        >Penjualan saya</router-link
      >
      <router-link
        to="/RiwayatTransaksi"
        class="list-group-item list-group-item-action bg-light"
        >RiwayatTransaksi</router-link
      >

      <router-link to="/Informasi" class="list-group-item infouser bg-light"
        ><font-awesome-icon :icon="['fas', 'circle-info']" />
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserSidebar",
  computed: {
    userId() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user ? user.id : null;
    },
    userImage() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user ? user.imageUrl : null;
    }
  },
  methods: {
    logout() {
      this.$emit("logout");
    },
  },
};
</script>

<style scoped>
.list-group-item-action {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.list-group-item-action:hover {
  background-color: darkblue;
  color: white;
}
#sidebar-wrapper {
  min-height: 100vh;
  margin-left: -300px;
  transition: margin 0.25s ease-out;
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: 0;
}

/* Profile Image Styles */
.profile-image-container {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;  /* Reduced from previous value */
  margin-bottom: 1rem; /* Reduced from previous value */
}

.profile-image {
  width: 7vw;
  height: 7vw;
  max-width: 7vw;  /* Added to prevent image from getting too large */
  max-height: 7vw; /* Added to prevent image from getting too large */
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Override the padding from App.css */
#sidebar-wrapper .sidebar-heading {
  padding: 1rem 1rem !important; /* Reduced padding */
  margin-bottom: 0 !important;   /* Remove any default margin */
}
</style>