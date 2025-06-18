<template>
  <div class="profile-container">
    <h1>Profil</h1>
    <div class="update-container">
      <!-- Preview or Existing Profile Image -->
      <div v-if="previewImage || fullImageUrl" class="image-container">
        <img
          :src="previewImage || fullImageUrl"
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
          <label for="Password">Password Baru:</label>
          <input
            type="password"
            id="Password"
            placeholder="Masukkan password baru"
            v-model="newPassword"
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
        imageUrl: "",
      },
      newPassword: "",
      imageFile: null,
      previewImage: null,
      previousImageId: null,
      baseUrl: process.env.VUE_APP_API_BASE_URL || "http://192.168.100.8:3001"
    };
  },
  computed: {
    fullImageUrl() {
      if (!this.User.imageUrl) return null;
      // If it's already a full URL (for backward compatibility)
      if (this.User.imageUrl.startsWith('http')) {
        return this.User.imageUrl;
      }
      // Construct full URL from relative path
      return `${this.baseUrl}${this.User.imageUrl}`;
    }
  },
  methods: {
    async UpdateProfil() {
      try {
        let newImageId = null;
        
        if (this.imageFile) {
          const formData = new FormData();
          formData.append("image", this.imageFile);

          const response = await axios.post(
            `${this.baseUrl}/images`,
            formData,
            { 
              headers: { 
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
              } 
            }
          );
          
          newImageId = response.data.id;
          this.User.imageUrl = `/images/${newImageId}`; // Store relative path

          if (this.previousImageId) {
            await axios.delete(`${this.baseUrl}/images/${this.previousImageId}`, {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
              }
            });
          }
        }

        const updateData = {
          ...this.User,
          Password: this.newPassword || undefined
        };

        const updateResponse = await axios.put(
          `${this.baseUrl}/user/${this.$route.params.id}`,
          updateData,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (updateResponse.data.message && updateResponse.data.message.includes("Maaf nama warung")) {
          alert(updateResponse.data.message);
        } else {
          alert("Profil berhasil diperbarui.");
          // Reload the entire page after successful update
          window.location.reload();
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
          this.logout();
        } else if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          alert("Terjadi kesalahan saat memperbarui profil.");
        }
      }
    },
    async fetchUser() {
      try {
        const result = await axios.get(
          `${this.baseUrl}/user/${this.$route.params.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        // eslint-disable-next-line no-unused-vars
        const { Password, ...userData } = result.data;
        this.User = userData;
        
        if (this.User.imageUrl) {
          const urlParts = this.User.imageUrl.split("/");
          this.previousImageId = urlParts[urlParts.length - 1];
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (error.message.includes('Network Error')) {
          alert('Cannot connect to server. Please check: \n1. Your network connection\n2. Server is running\n3. Correct server address');
        } else if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
          this.logout();
        } else {
          alert('Error loading profile data');
        }
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
    logout() {
      localStorage.clear();
      this.$router.push({ name: "LandingPage" }).then(() => {
        window.location.reload();
      });
    },
  },
  async mounted() {
    await this.fetchUser();
  },
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

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
  border-radius: 8px;
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

/* Mobile Styles */
@media only screen and (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .update-container {
    padding: 10px;
  }
  
  .product-image {
    width: 80%;
    max-width: 200px;
  }
  
  .form-row {
    flex-direction: column;
    align-items: flex-start;
    max-width: 100%;
    margin-bottom: 10px;
  }
  
  .form-row label {
    width: 100%;
    text-align: left;
    margin-right: 0;
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  .form-row input,
  .form-row select,
  .form-row .file-input {
    width: 100%;
    padding: 8px;
    font-size: 14px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
  
  .form-actions button {
    width: 100%;
    padding: 10px;
    font-size: 14px;
  }
  
  .cancel-preview-btn {
    width: 100%;
    padding: 8px;
    font-size: 14px;
  }
}
</style>