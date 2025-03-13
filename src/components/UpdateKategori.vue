<template>
  <div>
    <h1>Update Kategori</h1>
    <div class="update-container">
      <!-- Image Display -->
      <div v-if="previewImage || DataKategori.imageUrl">
        <img
          :src="previewImage || DataKategori.imageUrl"
          alt="Category Image"
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
      <form class="update" @submit.prevent="updateKategori">
        <input
          type="text"
          name="Kategori"
          placeholder="Ubah Nama Kategori"
          v-model="DataKategori.Kategori"
        />
        <input
          type="file"
          @change="onImageChange"
          accept="image/*"
        />
        <button type="submit">Update Data Kategori</button>
      </form>
    </div>
  </div>
</template>

<script>

import axios from "axios";

export default {
  name: "UpdateKategori",
  components: {

  },
  data() {
    return {
      DataKategori: {
        Kategori: "",
        imageUrl: "",
      },
      previewImage: null, // Stores preview of the selected image
      imageFile: null,
    };
  },
  methods: {
    async fetchCategory() {
      try {
        const result = await axios.get(
          `http://localhost:3006/categories/${this.$route.params.id}`
        );
        this.DataKategori = {
          Kategori: result.data.category,
          imageUrl: result.data.imageUrl,
        };
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    },

    async updateKategori() {
      try {
        let previousImageId = null;

        // Extract old image ID if it exists
        if (this.DataKategori.imageUrl) {
          const urlParts = this.DataKategori.imageUrl.split("/");
          previousImageId = urlParts[urlParts.length - 1];
        }

        // Upload new image if selected
        if (this.imageFile) {
          const formData = new FormData();
          formData.append("image", this.imageFile);

          const response = await axios.post("http://localhost:3006/images", formData);
          const newImageId = response.data.id;
          this.DataKategori.imageUrl = `http://localhost:3006/images/${newImageId}`;

          // Delete old image if applicable
          if (previousImageId) {
            await axios.delete(`http://localhost:3006/images/${previousImageId}`);
          }
        }

        // Update category data
        await axios.put(`http://localhost:3006/categories/${this.$route.params.id}`, {
          category: this.DataKategori.Kategori,
          imageurl: this.DataKategori.imageUrl || null,
        });

        alert("Category updated successfully.");
        this.$router.push({ name: "DataKategori" });
      } catch (error) {
        console.error("Error updating category:", error);
        alert("Failed to update category. Please try again.");
      }
    },

    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;

        // Generate preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    cancelImageSelection() {
      this.previewImage = null;
      this.imageFile = null;
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
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.update input,
.update button {
  display: block;
  margin-bottom: 10px;
  padding: 10px;
  width: 400px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
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
</style>
