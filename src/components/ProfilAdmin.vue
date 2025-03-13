<template>
  <div>
    <h1>Profil</h1>
    <div v-if="User.imageUrl || previewImage">
      <img
        :src="previewImage || User.imageUrl"
        alt="Profile Image"
        style="width: 400px; height: auto; margin-bottom: 10px"
      />
    </div>
    <button
      v-if="previewImage"
      @click="cancelImageSelection"
      style="margin-bottom: 10px"
    >
      Batalkan Pilihan Gambar
    </button>
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
      <input
        type="file"
        @change="onImageChange"
        accept="image/*"
        name="imageUrl"
      />
      <button type="submit">Update Profil</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfilAdmin",
  components: {
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
      previewImage: null,
    };
  },
  methods: {
    async UpdateProfil() {
      try {
        let previousImageId = null;

        if (this.User.imageUrl) {
          const urlParts = this.User.imageUrl.split("/");
          previousImageId = urlParts[urlParts.length - 1];
        }

        if (this.imageFile) {
          const formData = new FormData();
          formData.append("image", this.imageFile);

          const response = await axios.post("http://localhost:3001/uploads", formData);
          const newImageId = response.data.id;
          this.User.imageUrl = `http://localhost:3001/uploads/${newImageId}`;

          if (previousImageId) {
            await axios.delete(`http://localhost:3001/uploads/${previousImageId}`);
          }
        }

        await axios.put(
          `http://localhost:3001/user/${this.$route.params.id}`,
          this.User
        );
        alert("Profile updated successfully.");
        this.$router.push({ name: "DataUser" });
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred.");
      }
    },
    async fetchUser() {
      try {
        const result = await axios.get(
          `http://localhost:3001/user/${this.$route.params.id}`
        );
        this.User = result.data;
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    },
    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    cancelImageSelection() {
      this.imageFile = null;
      this.previewImage = null;
    },
  },
  async mounted() {
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
