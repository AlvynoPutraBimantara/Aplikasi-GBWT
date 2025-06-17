<template>
  <div>
    <h1>Update Kategori</h1>
    <div class="update-container">
      <!-- Image Preview -->
      <div v-if="previewImage || fullImageUrl" class="image-container">
        <img
          :src="previewImage || fullImageUrl"
          alt="Category Image"
          class="product-image"
          @error="handleImageError"
          @load="handleImageLoad"
          crossorigin="anonymous"
        />
        <div v-if="imageLoading" class="image-loading">Loading image...</div>
      </div>
      <div v-else class="image-placeholder">
        <span>No Image Available</span>
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
            v-model="DataKategori.category"
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
        id: "",
        category: "",
        imageUrl: "",
      },
      previewImage: null,
      imageFile: null,
      imageLoading: true,
      baseUrl: "http://192.168.100.8:3006"
    };
  },
  computed: {
    fullImageUrl() {
      if (!this.DataKategori.imageUrl) return null;

      // Already full URL
      if (this.DataKategori.imageUrl.startsWith("http")) {
        return this.DataKategori.imageUrl;
      }

      // Extract image ID from path or plain ID
      const imageId = this.DataKategori.imageUrl.includes("/")
        ? this.DataKategori.imageUrl.split("/").pop()
        : this.DataKategori.imageUrl;

      return `${this.baseUrl}/images/${imageId}`;
    }
  },
  methods: {
    handleImageLoad() {
      this.imageLoading = false;
      console.log("Image loaded successfully");
    },

    handleImageError(event) {
      this.imageLoading = false;
      console.error("Image load error - Details:", {
        attemptedUrl: event.target.src,
        imageUrl: this.DataKategori.imageUrl,
        fullImageUrl: this.fullImageUrl
      });

      // Hide broken image
      event.target.style.display = "none";
    },

    async fetchCategory() {
      try {
        const response = await axios.get(
          `${this.baseUrl}/categories/${this.$route.params.id}`
        );

        this.DataKategori = {
          id: response.data.id,
          category: response.data.category,
          imageUrl: response.data.imageUrl || null
        };

        console.log("Fetched category data:", this.DataKategori);
      } catch (error) {
        console.error("Error fetching category:", error);
        alert("Gagal memuat data kategori");
      }
    },

    async updateKategori() {
      try {
        let imageUrl = this.DataKategori.imageUrl;
        let previousImageId = null;

        if (imageUrl) {
          const urlParts = imageUrl.split("/");
          previousImageId = urlParts[urlParts.length - 1];
        }

        if (this.imageFile) {
          const formData = new FormData();
          formData.append("image", this.imageFile);

          const uploadResponse = await axios.post(
            `${this.baseUrl}/images`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" }
            }
          );

          imageUrl = `/images/${uploadResponse.data.id}`;

          // Delete old image
          if (previousImageId) {
            try {
              await axios.delete(`${this.baseUrl}/images/${previousImageId}`);
            } catch (err) {
              console.error("Old image delete failed:", err);
            }
          }
        }

        await axios.put(`${this.baseUrl}/categories/${this.DataKategori.id}`, {
          category: this.DataKategori.category,
          imageUrl: imageUrl || null
        });

        alert("Kategori berhasil diperbarui!");
        this.$router.push({ name: "DataKategori" });
      } catch (error) {
        console.error("Error updating category:", error);
        alert(
          `Gagal memperbarui kategori. ${error.response?.data?.message || error.message}`
        );
      }
    },

    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.match("image.*")) {
          alert("Harap pilih file gambar");
          return;
        }
        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
        this.imageLoading = true;
      }
    },

    cancelImageSelection() {
      this.previewImage = null;
      this.imageFile = null;
      this.imageLoading = false;
      document.getElementById("image").value = "";
    }
  },
  async mounted() {
    await this.fetchCategory();

    console.log("Current image configuration:", {
      storedPath: this.DataKategori.imageUrl,
      computedUrl: this.fullImageUrl
    });

    if (this.fullImageUrl) {
      try {
        const response = await fetch(this.fullImageUrl, { method: "HEAD" });
        console.log("Image accessibility:", response.ok ? "OK" : "Failed");
      } catch (error) {
        console.error("Image test failed:", error);
      }
    }
  },
  beforeUnmount() {
    if (this.previewImage) {
      URL.revokeObjectURL(this.previewImage);
    }
  }
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
