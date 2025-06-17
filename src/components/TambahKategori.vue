<template>
  <div>
    <h1>Tambah Kategori</h1>
    <div class="update-container">
      <!-- Preview Image Section -->
      <div v-if="previewImage" class="image-container">
        <img
          :src="previewImage"
          alt="Category Preview"
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
      <form class="update" @submit.prevent="addKategori">
        <div class="form-row">
          <label for="Kategori">Nama Kategori:</label>
          <input
            type="text"
            id="Kategori"
            placeholder="Masukan Nama Kategori"
            v-model="DataKategori.Kategori"
            required
          />
        </div>
        <div class="form-row">
          <label for="image">Gambar Kategori:</label>
          <input 
            type="file" 
            id="image" 
            @change="onImageChange" 
            accept="image/*"
            class="file-input"
            required
          />
        </div>
        <div class="form-actions">
          <button type="submit">Tambah Kategori</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TambahKategori",
  data() {
    return {
      DataKategori: {
        Kategori: "",
        imageUrl: "",
      },
      previewImage: null,
      imageFile: null,
    };
  },
  methods: {
    async addKategori() {
      try {
        // Validate inputs
        if (!this.imageFile || !this.DataKategori.Kategori) {
          alert("Nama kategori dan gambar wajib diisi!");
          return;
        }

        // Create FormData for image upload
        const formData = new FormData();
        formData.append("image", this.imageFile);

        // Upload the image to the category service
        const imageResponse = await axios.post(
          `${process.env.VUE_APP_CATEGORY_SERVICE_URL}/images`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        const imageUrl = imageResponse.data.imageUrl;

        // Add category with the uploaded image URL
        await axios.post(
          `${process.env.VUE_APP_CATEGORY_SERVICE_URL}/categories`,
          {
            category: this.DataKategori.Kategori,
            imageUrl,
          }
        );

        alert("Kategori berhasil ditambahkan!");
        this.$router.push({ name: "DataKategori" });
      } catch (error) {
        console.error("Error adding category:", error);
        let errorMessage = "Gagal menambahkan kategori. Silakan coba lagi.";
        
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = error.response.data.message || errorMessage;
          } else if (error.response.status === 413) {
            errorMessage = "Ukuran gambar terlalu besar. Silakan pilih gambar yang lebih kecil.";
          }
        }
        
        alert(errorMessage);
      } finally {
        // Clean up the object URL to prevent memory leaks
        if (this.previewImage) {
          URL.revokeObjectURL(this.previewImage);
        }
      }
    },
    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        // Validate file size (e.g., 2MB limit)
        if (file.size > 2 * 1024 * 1024) {
          alert("Ukuran gambar tidak boleh melebihi 2MB");
          event.target.value = "";
          return;
        }
        
        // Validate file type
        if (!file.type.match('image.*')) {
          alert("Hanya file gambar yang diperbolehkan");
          event.target.value = "";
          return;
        }

        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
      }
    },
    cancelImageSelection() {
      this.previewImage = null;
      this.imageFile = null;
      // Reset file input
      document.getElementById('image').value = '';
    },
  },
  beforeUnmount() {
    // Clean up the object URL when component is destroyed
    if (this.previewImage) {
      URL.revokeObjectURL(this.previewImage);
    }
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
  max-height: 300px;
  object-fit: contain;
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
  transition: background-color 0.3s;
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
  transition: background-color 0.3s;
}

.form-actions button:hover {
  background-color: #388e3c;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row label {
    width: 100%;
    text-align: left;
    margin-bottom: 5px;
  }

  .product-image {
    width: 80%;
  }
}
</style>