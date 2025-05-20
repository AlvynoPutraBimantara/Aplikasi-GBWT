<template>
  <div>
    <h1>Tambah Produk</h1>
    <div class="update-container">
      <!-- Preview Image Section -->
      <div v-if="previewImage" class="image-container">
        <img
          :src="previewImage"
          alt="Product Preview"
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
      <form class="update" @submit.prevent="submitProduct">
        <div class="form-row">
          <label for="image">Gambar Produk:</label>
          <input 
            type="file" 
            id="image" 
            @change="onImageChange" 
            accept="image/*"
            class="file-input"
          />
        </div>
        <div class="form-row">
          <label for="Nama">Nama Produk:</label>
          <input
            type="text"
            id="Nama"
            placeholder="Masukan Nama Produk"
            v-model="DataProduk.Nama"
          />
        </div>
        <div class="form-row">
          <label for="Harga">Harga:</label>
          <input
            type="text"
            id="Harga"
            placeholder="Masukan Harga Produk"
            v-model="formattedHarga"
            @input="formatHarga"
          />
        </div>
        <div class="form-row">
          <label for="Kategori">Kategori:</label>
          <select id="Kategori" v-model="DataProduk.Kategori">
            <option disabled value="">Pilih Kategori</option>
            <option
              v-for="kategori in kategoriList"
              :key="kategori.id"
              :value="kategori.category"
            >
              {{ kategori.category }}
            </option>
          </select>
        </div>
        <div class="form-row">
          <label for="Keterangan">Keterangan:</label>
          <input
            type="text"
            id="Keterangan"
            placeholder="Masukan Keterangan Produk"
            v-model="DataProduk.Keterangan"
          />
        </div>
        <div class="form-row">
          <label for="Stok">Stok:</label>
          <input
            type="text"
            id="Stok"
            placeholder="Masukan Stok Produk"
            v-model="DataProduk.Stok"
          />
        </div>

        <div class="form-actions">
          <button type="submit">Tambah Produk</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TambahDagangan",
  data() {
    return {
      DataProduk: {
        Nama: "",
        Harga: "",
        Kategori: "",
        Keterangan: "",
        Pedagang: "",
        Stok: "",
      },
      formattedHarga: "",
      kategoriList: [],
      imageFile: null,
      previewImage: null,
    };
  },
  methods: {
 // In the submitProduct method in TambahDagangan.vue
async submitProduct() {
  try {
    // Remove thousand separators before submitting
    const hargaValue = this.DataProduk.Harga.replace(/\./g, '');
    
    const formData = new FormData();
    formData.append("Nama", this.DataProduk.Nama);
    formData.append("Harga", hargaValue);
    formData.append("Kategori", this.DataProduk.Kategori);
    formData.append("Keterangan", this.DataProduk.Keterangan);
    formData.append("Pedagang", this.DataProduk.Pedagang);
    formData.append("Stok", this.DataProduk.Stok);
    if (this.imageFile) {
      formData.append("image", this.imageFile);
    }

    // eslint-disable-next-line no-unused-vars
    const response = await axios.post(
      "http://localhost:3002/products",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    alert("Produk berhasil ditambahkan!");
    this.$router.push("/Dagangan");
  } catch (error) {
    console.error("Error submitting product:", error);
    alert("Terjadi kesalahan saat menambahkan produk.");
  }
},
    formatHarga(event) {
      // Get the input value
      let value = event.target.value.replace(/\./g, '');
      
      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        value = value.replace(/[^\d]/g, '');
      }
      
      // Store the raw value (without separators)
      this.DataProduk.Harga = value;
      
      // Format with thousand separators
      if (value.length > 0) {
        this.formattedHarga = parseInt(value).toLocaleString('id-ID');
      } else {
        this.formattedHarga = '';
      }
    },
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
  created() {
    const userInfo = JSON.parse(localStorage.getItem("user-info"));
    this.DataProduk.Pedagang = userInfo?.NamaWarung || "Unknown";
  },
  mounted() {
    this.fetchKategori();
    // Initialize formatted price if there's existing value
    if (this.DataProduk.Harga) {
      this.formattedHarga = parseInt(this.DataProduk.Harga).toLocaleString('id-ID');
    }
  },
};
</script>

<style scoped>
/* Your existing styles remain the same */
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