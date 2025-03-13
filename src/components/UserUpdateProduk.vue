<template>
  <div>
    <h1>Update Produk</h1>
    <div class="update-container">
      <!-- Preview or Existing Product Image -->
      <div v-if="previewImage || DataProduk.imageUrl">
        <img
          :src="previewImage || DataProduk.imageUrl"
          alt="Product Image"
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
      <form class="update" @submit.prevent="updateProduk">
        <input
          type="text"
          name="Nama"
          placeholder="Ubah Nama Produk"
          v-model="DataProduk.Nama"
        />
        <input
          type="text"
          name="Harga"
          placeholder="Ubah Harga Produk"
          v-model="DataProduk.Harga"
        />
        <!-- Category Dropdown -->
        <select v-model="DataProduk.Kategori">
          <option disabled value="">Pilih Kategori</option>
          <option
            v-for="kategori in kategoriList"
            :key="kategori.id"
            :value="kategori.category"
          >
            {{ kategori.category }}
          </option>
        </select>
        <input
          type="text"
          name="Keterangan"
          placeholder="Ubah Keterangan Produk"
          v-model="DataProduk.Keterangan"
        />
        <!-- Nama Warung Dropdown -->
        <select v-model="DataProduk.Pedagang">
          <option disabled value="">Pilih Pedagang</option>
          <option
            v-for="warung in warungList"
            :key="warung.id"
            :value="warung.NamaWarung"
          >
            {{ warung.NamaWarung }}
          </option>
        </select>
        <input
          type="text"
          name="Stok"
          placeholder="Ubah Stok Produk"
          v-model="DataProduk.Stok"
        />
        <input type="file" @change="onImageChange" />
        <button type="submit">Update Data Produk</button>
      </form>
      <form class="delete">
        <button class="delete-btn" @click="deleteProduk">Hapus Produk</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserUpdateProduk",
  data() {
    return {
      DataProduk: {
        id: "",
        Nama: "",
        Harga: "",
        Kategori: "",
        Keterangan: "",
        Pedagang: "",
        Stok: "",
        imageUrl: "",
      },
      kategoriList: [], // List of categories
      warungList: [],   // List of warungs
      imageFile: null,  // Selected image file
      previewImage: null, // Preview image URL
    };
  },
  methods: {
    async fetchKategori() {
      try {
        const response = await axios.get("http://localhost:3006/categories");
        this.kategoriList = response.data.map((item) => ({
          id: item.id,
          category: item.category,
        }));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    async fetchWarung() {
      try {
        const response = await axios.get("http://localhost:3002/users");
        this.warungList = response.data;
      } catch (error) {
        console.error("Error fetching warung list:", error.message);
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
    async updateProduk() {
      try {
        const formData = new FormData();
        formData.append("Nama", this.DataProduk.Nama);
        formData.append("Harga", this.DataProduk.Harga);
        formData.append("Kategori", this.DataProduk.Kategori);
        formData.append("Keterangan", this.DataProduk.Keterangan);
        formData.append("Pedagang", this.DataProduk.Pedagang);
        formData.append("Stok", this.DataProduk.Stok);
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        await axios.put(
          `http://localhost:3002/products/${this.DataProduk.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        alert("Product updated successfully!");
        this.$router.push("/Dagangan");
        setTimeout(() => window.location.reload(), 0.1);
      } catch (error) {
        console.error("Error updating product:", error.message);
        alert("Failed to update product.");
      }
    },
    async deleteProduk() {
      try {
        await axios.delete(`http://localhost:3002/products/${this.DataProduk.id}`);
        alert("Product deleted successfully!");
        this.$router.push("/DataProduk");
      } catch (error) {
        console.error("Error deleting product:", error.message);
        alert("Failed to delete product.");
      }
    },
  },
  async mounted() {
    const productId = this.$route.params.id;
    try {
      const response = await axios.get(
        `http://localhost:3002/products/${productId}`
      );
      this.DataProduk = response.data;
    } catch (error) {
      console.error("Error fetching product data:", error.message);
    }

    await this.fetchKategori();
    await this.fetchWarung();
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

.product-image {
  width: 50%;
  height: auto;
  margin-bottom: 20px;
}

.cancel-preview-btn {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #ff4500;
  color: white;
  border: none;
  cursor: pointer;
}

.cancel-preview-btn:hover {
  background-color: #d03500;
}

.update {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.update input,
.update select,
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

.delete-btn {
  background-color: red;
  color: white;
  border: none;
  padding: 10px;
  width: 400px;
  margin-top: 20px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c82333;
}
</style>
