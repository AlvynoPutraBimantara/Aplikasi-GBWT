<template>
  <div>
    <h1>Update Kategori</h1>
    <div class="update-container">
      <!-- Image Preview -->
      <div v-if="previewImage || DataKategori.imageUrl" class="image-container">
        <img
          :src="previewImage || DataKategori.imageUrl"
          alt="Category Image"
          class="product-image"
        />
      </div>

      <button
        v-if="previewImage"
        @click="cancelImageSelection"
        class="cancel-preview-btn"
      >
        Batalkan Pilihan Gambar
      </button>

      <form class="update" @submit.prevent="updateKategori">
        <div class="form-row">
          <label for="Kategori">Nama Kategori:</label>
          <input
            type="text"
            id="Kategori"
            placeholder="Ubah Nama Kategori"
            v-model="DataKategori.Kategori"
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
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="update-btn">Update Kategori</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UpdateKategori",
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
    async fetchCategory() {
  try {
    const result = await axios.get(
      `http://localhost:3006/categories/${this.$route.params.id}`
    );
    console.log('Category data received:', result.data); // Add this
    this.DataKategori = {
      Kategori: result.data.category,
      imageUrl: result.data.imageurl
    };
    console.log('Image URL set to:', this.DataKategori.imageUrl); // Add this
  } catch (error) {
    console.error("Error fetching category data:", error);
  }
},

  normalizeImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3006${url.startsWith('/') ? '' : '/'}${url}`;
  }
,

    async updateKategori() {
  try {
    let imageUrl = this.DataKategori.imageUrl;
    let previousImageId = null;

    // Extract previous image ID if exists
    if (imageUrl) {
      const urlParts = imageUrl.split("/");
      previousImageId = urlParts[urlParts.length - 1];
    }

    // Handle new image upload if exists
    if (this.imageFile) {
      const formData = new FormData();
      formData.append("image", this.imageFile);

      // Upload new image
      const response = await axios.post("http://localhost:3006/images", formData);
      imageUrl = `http://localhost:3006/images/${response.data.id}`;

      // Delete previous image if exists
      if (previousImageId) {
        try {
          await axios.delete(`http://localhost:3006/images/${previousImageId}`);
        } catch (error) {
          console.error("Error deleting old image:", error);
          // Continue even if deletion fails
        }
      }
    }

    // Update category with the new data
    await axios.put(`http://localhost:3006/categories/${this.$route.params.id}`, {
      category: this.DataKategori.Kategori,
      imageurl: imageUrl || null,
    });

    alert("Kategori berhasil diperbarui.");
    this.$router.push({ name: "DataKategori" });
  } catch (error) {
    console.error("Error updating category:", error);
    alert(`Gagal memperbarui kategori. ${error.response?.data?.message || error.message}`);
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
      this.previewImage = null;
      this.imageFile = null;
      // Reset file input
      document.getElementById('image').value = '';
    },
  },
  async mounted() {
    await this.fetchCategory();
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
  cursor: pointer;
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
  gap: 10px;
  margin-top: 20px;
}

.update-btn {
  background-color: #007bff;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.update-btn:hover {
  background-color: #0056b3;
}
</style>
