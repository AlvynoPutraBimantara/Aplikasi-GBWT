<template>
  <div>
    <h1>Tambah Kategori</h1>
    <div class="update-container">
      <!-- Image Display -->
      <div v-if="previewImage">
        <img
          :src="previewImage"
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
      <form class="update" @submit.prevent="addKategori">
        <input
          type="text"
          name="Kategori"
          placeholder="Nama Kategori"
          v-model="DataKategori.Kategori"
        />
        <input
          type="file"
          @change="onImageChange"
          accept="image/*"
        />
        <button type="submit">Tambah Kategori</button>
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
      previewImage: null, // Stores preview of the selected image
      imageFile: null,
    };
  },
  methods: {
    async addKategori() {
  try {
    if (!this.imageFile || !this.DataKategori.Kategori) {
      alert("Kategori name and image are required!");
      return;
    }

    // Upload the image
    const formData = new FormData();
    formData.append("image", this.imageFile);
    const imageResponse = await axios.post("http://localhost:3006/images", formData);
    const imageUrl = imageResponse.data.imageUrl;

    // Add category with the uploaded image URL
    await axios.post("http://localhost:3006/categories", {
      category: this.DataKategori.Kategori,
      imageUrl,
    });

    alert("Kategori successfully added!");
    this.$router.push({ name: "DataKategori" });
  } catch (error) {
    console.error("Error adding category:", error);
    alert("Failed to add category. Please try again.");
  }
}
,

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
