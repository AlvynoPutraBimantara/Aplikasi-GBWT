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
          <label for="image">Gambar Profil:</label>
          <input 
            type="file" 
            id="image" 
            @change="onImageChange" 
            accept="image/*"
            class="file-input"
          />
        </div>
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
          <label for="Password">Password:</label>
          <input
            type="password"
            id="Password"
            placeholder="Ubah Password"
            v-model="User.Password"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="update-btn">Update Profil</button>
          <button type="button" @click="logout" class="logout-btn">Logout</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Profil",
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
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        const token = userInfo?.token;
        
        if (!token) {
          this.logout();
          return;
        }

        const formData = new FormData();
        
        // Append user data
        formData.append("NamaWarung", this.User.NamaWarung);
        formData.append("Nama", this.User.Nama);
        formData.append("Telp", this.User.Telp);
        formData.append("Alamat", this.User.Alamat);
        if (this.User.Password) {
          formData.append("Password", this.User.Password);
        }
        
        // Append image if selected
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        const response = await axios.put(
          `http://localhost:3000/user-service/${this.$route.params.id}`,
          formData,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        if (response.data) {
          // Update local storage with new user data
          const updatedUser = { ...userInfo, ...response.data };
          localStorage.setItem("user-info", JSON.stringify(updatedUser));
          
          alert("Profil berhasil diperbarui.");
          this.$router.go(); // Refresh the page
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert("Terjadi kesalahan saat memperbarui profil.");
        }
      }
    },
    async fetchUser() {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        const token = userInfo?.token;
        
        if (!token) {
          this.logout();
          return;
        }

        const response = await axios.get(
          `http://localhost:3000/user-service/${this.$route.params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.User = response.data;
      } catch (error) {
        console.error("Error fetching user:", error);
        this.logout();
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
      document.getElementById("image").value = "";
    },
    logout() {
      localStorage.removeItem("user-info");
      this.$router.push({ name: "Login" });
    },
  },
  async mounted() {
    await this.fetchUser();
  },
};
</script>

<style scoped>
/* (Keep all existing styles the same) */
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

.file-input {
  box-sizing: border-box;
  width: 100%;
  background-color: white;
  cursor: pointer;
}

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

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.form-actions button {
  padding: 12px 20px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.update-btn {
  background-color: #4caf50;
}

.update-btn:hover {
  background-color: #388e3c;
}

.logout-btn {
  background-color: red;
}

.logout-btn:hover {
  background-color: darkred;
}
</style>