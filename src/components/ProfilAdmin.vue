<template>
  <Header />
  <h1>Profil</h1>
  <form class="update" @submit.prevent="UpdateProfil">
    <input
      type="text"
      name="NamaWarung"
      placeholder="Ubah Nama Warung"
      v-model="User.NamaWarung"
    />
    <input
      type="text"
      name="Nama"
      placeholder="Ubah Nama"
      v-model="User.Nama"
    />
    <input
      type="text"
      name="Telp"
      placeholder="Ubah No. Telp"
      v-model="User.Telp"
    />
    <input
      type="text"
      name="Alamat"
      placeholder="Ubah Alamat"
      v-model="User.Alamat"
    />
    <input
      type="text"
      name="Password"
      placeholder="Ubah Password"
      v-model="User.Password"
    />
    <input type="file" @change="onImageChange" />
    <button type="submit">Update Data User</button>
  </form>
  <form class="logout">
    <button class="logout-btn" v-on:click="logout">Logout</button>
  </form>
</template>

<script>
import Header from "./Header.vue";
import axios from "axios";

export default {
  name: "ProfilAdmin",
  components: {
    Header,
  },
  data() {
    return {
      User: {
        NamaWarung: "",
        Nama: "",
        Telp: "",
        Alamat: "",
        Password: "",
        imageUrl: "",
      },
      imageFile: null,
    };
  },
  methods: {
    async UpdateProfil() {
      try {
        if (this.imageFile) {
          const formData = new FormData();
          formData.append("image", this.imageFile);
          const response = await axios.post(
            "http://localhost:3001/uploads",
            formData
          );
          this.User.imageUrl = `http://localhost:3001${response.data.imageUrl}`;
        }
        const result = await axios.put(
          `http://localhost:3000/User/${this.$route.params.id}`,
          this.User
        );
        if (result.status === 200) {
          this.$router.push({ name: "DataUser" });
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert(
          "An error occurred while updating the profile. Please try again later."
        );
      }
    },
    onImageChange(event) {
      this.imageFile = event.target.files[0];
    },
    async fetchUser() {
      const result = await axios.get(
        `http://localhost:3000/User/${this.$route.params.id}`
      );
      this.User = result.data;
    },
    logout() {
      localStorage.clear();
      this.$router.push({ name: "Login" });
    },
  },
  async mounted() {
    let user = localStorage.getItem("user-info");
    if (!user) {
      this.$router.push({ name: "SignUp" });
    }
    await this.fetchUser();
  },
};
</script>

<style scoped>
.update {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.update input,
.update select,
.update button {
  display: block;
  margin-bottom: 10px;
  padding: 10px;
  width: 400px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 20px;
}

.update input::placeholder,
.update select::placeholder {
  color: #aaa;
}

.update button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.update button:hover {
  background-color: #0056b3;
}

.image-container {
  text-align: center;
  margin-bottom: 20px;
}

.logout {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logout-btn {
  background-color: red;
  display: block;
  padding: 10px;
  width: 400px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.logout-btn:hover {
  background-color: darkred;
}
</style>
