<template>
  <div>
    <h1>Profil</h1>
    <div class="update-container">
      <!-- Preview or Existing Profile Image -->
      <div v-if="previewImage || User.imageUrl" class="image-container">
        <img
          :src="previewImage || User.imageUrl"
          alt="Profile Image"
          class="product-image"
        />
      </div>
      <!-- Cancel Preview Button -->
      <button
        v-if="previewImage"
        @click="cancelImageSelection"
        class="cancel-preview-btn"
      >
        Batalkan Pilihan Gambar
      </button>
      <form class="update" @submit.prevent="UpdateProfil">
        <div class="form-row">
          <label for="NamaWarung">Nama Warung:</label>
          <input
            type="text"
            id="NamaWarung"
            placeholder="Ubah Nama Warung"
            v-model="User.NamaWarung"
          />
        </div>
        <div class="form-row">
          <label for="Nama">Nama:</label>
          <input
            type="text"
            id="Nama"
            placeholder="Ubah Nama"
            v-model="User.Nama"
          />
        </div>
        <div class="form-row">
          <label for="Telp">No. Telp:</label>
          <input
            type="text"
            id="Telp"
            placeholder="Ubah No. Telp"
            v-model="User.Telp"
          />
        </div>
        <div class="form-row">
          <label for="Alamat">Alamat:</label>
          <input
            type="text"
            id="Alamat"
            placeholder="Ubah Alamat"
            v-model="User.Alamat"
          />
        </div>
        <div class="form-row">
          <label for="Password">Password Baru:</label>
          <input
            type="password"
            id="Password"
            placeholder="Masukkan password baru"
            v-model="newPassword"
          />
        </div>
        <div class="form-row">
          <label for="image">Gambar Profil:</label>
          <input 
            type="file" 
            id="image" 
            @change="onImageChange" 
            accept="image/*"
            class="file-input"
          />
        </div>
        <div class="form-actions">
          <button type="submit">Update Profil</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfilAdmin",
  data() {
    return {
      User: {
        NamaWarung: "",
        Nama: "",
        Telp: "",
        Alamat: "",
        imageUrl: "",
      },
      newPassword: "", // Separate field for new password
      imageFile: null,
      previewImage: null,
    };
  },
  methods: {
    async UpdateProfil() {
      try {
        let previousImageId = null;
        
        // Handle image upload if there's a new image
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

        // Prepare update data
        const updateData = {
          ...this.User,
          Password: this.newPassword || undefined // Only include password if it's not empty
        };

        // Update user profile
        const updateResponse = await axios.put(
          `http://localhost:3001/user/${this.$route.params.id}`,
          updateData
        );

        if (updateResponse.data.message && updateResponse.data.message.includes("Maaf nama warung")) {
          alert(updateResponse.data.message);
        } else {
          alert("Profil berhasil diperbarui.");
          this.newPassword = ""; // Clear password field after successful update
          window.location.reload();
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert("Terjadi kesalahan saat memperbarui profil.");
        }
      }
    },
    async fetchUser() {
      try {
        const result = await axios.get(
          `http://localhost:3001/user/${this.$route.params.id}`
        );
        // Don't store password in component state
        // eslint-disable-next-line no-unused-vars
        const { Password, ...userData } = result.data;
        this.User = userData;
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
.update-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.image-container {
  margin-bottom: 20px;
}

.product-image {
  width: 50%;
  height: auto;
  margin-bottom: 20px;
}

.update {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

.form-row label {
  width: 150px;
  text-align: right;
  margin-right: 15px;
  font-weight: bold;
}

.form-row input,
.form-row select,
.form-row .file-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Style specifically for file input to match other inputs */
.file-input {
  box-sizing: border-box;
  width: 100%;
  background-color: white;
  cursor: pointer;
}

/* Optional: Style the file input button text */
.file-input::file-selector-button {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.file-input::file-selector-button:hover {
  background-color: #e0e0e0;
}

.cancel-preview-btn {
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-preview-btn:hover {
  background-color: #f57c00;
}

.form-actions button {
  padding: 12px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.form-actions button:hover {
  background-color: #388e3c;
}
</style>