<template>
  <div class="data-kategori-container">
    <h1>Data Kategori</h1>
    <div class="table-container">
      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
            <th>Gambar</th>
            <th>Nama Kategori</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in DataKategori" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <img
                :src="getFullImageUrl(item.imageUrl)"
                alt="Category Image"
                class="category-image"
                @error="handleImageError"
                crossorigin="anonymous"
              />

            </td>
            <td>{{ item.category }}</td>
            <td>
              <button @click="UpdateKategori(item.id)">Update</button>
              <button @click="confirmDelete(item.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="button-container">
      <button @click="goToTambahKategori">Tambah Kategori</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DataKategori",
  data() {
    return {
      DataKategori: [],
      imageLoading: {},
      baseUrl: "http://192.168.100.8:3006" // Use your network IP
    };
  },
  methods: {
    getFullImageUrl(imageUrl) {
      if (!imageUrl) return '';
      
      // If it's already a full URL
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Extract image ID from path or plain ID
      const imageId = imageUrl.includes('/') 
        ? imageUrl.split('/').pop() 
        : imageUrl;
      
      return `${this.baseUrl}/images/${imageId}`;
    },
    
    handleImageError(event) {
      const img = event.target;
      img.style.display = 'none';
      console.error("Image load error:", img.src);
    },
    
    UpdateKategori(id) {
      this.$router.push({ name: "UpdateKategori", params: { id } });
    },
    
    async HapusKategori(id) {
      try {
        // First get the category to find the associated image
        const category = this.DataKategori.find(item => item.id === id);
        if (category && category.imageUrl) {
          const imageId = category.imageUrl.split('/').pop();
          await axios.delete(`${this.baseUrl}/images/${imageId}`);
        }
        
        // Then delete the category
        await axios.delete(`${this.baseUrl}/categories/${id}`);
        
        this.loadData();
        alert("Kategori berhasil dihapus");
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Gagal menghapus kategori.");
      }
    },
    
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.HapusKategori(id);
      }
    },
    
async loadData() {
  try {
    const response = await axios.get(`${this.baseUrl}/categories`);
    this.DataKategori = response.data;
    
    // Reset imageLoading and initialize with new values
    this.imageLoading = {};
    this.DataKategori.forEach(item => {
      this.imageLoading[item.id] = true;
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    alert("Gagal memuat data kategori.");
  }
},
    
    goToTambahKategori() {
      this.$router.push({ name: "TambahKategori" });
    },
    
    async uploadImage(file) {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `${this.baseUrl}/images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return response.data.id;
    }
  },
  async mounted() {
    await this.loadData();
  }
};
</script>

<style>
.data-kategori-container {
  text-align: center;
}

.table-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

table {
  border-collapse: collapse;
}

th,
td {
  width: 200px;
  height: 50px;
  text-align: center;
  padding: 8px;
  border: 1px solid black;
}

.category-image {
  width: 100px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.button-container button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
}

.button-container button:hover {
  background-color: #0056b3;
}
</style>
