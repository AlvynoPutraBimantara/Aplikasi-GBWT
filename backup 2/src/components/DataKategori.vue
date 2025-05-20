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
                :src="item.imageUrl"
                alt="Category Image"
                class="category-image"
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
    };
  },
  components: {
  
  },
  methods: {
    UpdateKategori(id) {
      this.$router.push({ name: "UpdateKategori", params: { id: id } });
    },
    async HapusKategori(id) {
      try {
        const result = await axios.delete(
          `http://localhost:3006/categories/${id}`
        );
        if (result.status === 200) {
          this.loadData();
        }
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
        const result = await axios.get("http://localhost:3006/categories");
        this.DataKategori = result.data;
      } catch (error) {
        console.error("Error loading categories:", error);
        alert("Gagal memuat data kategori.");
      }
    },
    goToTambahKategori() {
      this.$router.push({ name: "TambahKategori" });
    },
    async uploadImage(file) {
      try {
        const formData = new FormData();
        formData.append("image", file);

        const result = await axios.post(
          "http://localhost:3006/images",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return result.data.id; // Return image ID
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Gagal mengunggah gambar.");
      }
    },
    async TambahKategori(categoryName, imageFile) {
      try {
        // Upload the image and get its ID
        const imageId = await this.uploadImage(imageFile);

        // Create the category with the image URL
        const imageUrl = `http://localhost:3006/images/${imageId}`;
        await axios.post("http://localhost:3006/categories", {
          id: Date.now().toString(),
          category: categoryName,
          imageurl: imageUrl,
        });

        alert("Kategori berhasil ditambahkan.");
        this.loadData();
      } catch (error) {
        console.error("Error adding category:", error);
        alert("Gagal menambahkan kategori.");
      }
    },
  },
  async mounted() {
    this.loadData();
  },
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
