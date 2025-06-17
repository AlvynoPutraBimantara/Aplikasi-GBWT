<template>
  <div>
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

        // Format phone number to start with 0 if it starts with 62
        if (this.User.Telp && this.User.Telp.startsWith('62')) {
          this.User.Telp = '0' + this.User.Telp.substring(2);
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
          this.newPassword = "";
          this.imageFile = null;
          this.previewImage = null;
          
          if (newImageId) {
            this.previousImageId = newImageId;
          }
          
          await this.fetchUser();
          this.$router.push('/datauser'); // Unique to ProfilAdmin: redirect to datauser
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
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

        // Format phone number on initial load if it starts with 62
        if (this.User.Telp && this.User.Telp.startsWith('62')) {
          this.User.Telp = '0' + this.User.Telp.substring(2);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (error.message.includes('Network Error')) {
          alert('Cannot connect to server. Please check: \n1. Your network connection\n2. Server is running\n3. Correct server address');
        } else if (error.response?.status === 401) {
          alert('Session expired. Please login again.');
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
  },
  watch: {
    'User.Telp': {
      handler(newVal) {
        if (newVal && newVal.startsWith('62')) {
          this.User.Telp = '0' + newVal.substring(2);
        }
      },
      immediate: true
    }
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