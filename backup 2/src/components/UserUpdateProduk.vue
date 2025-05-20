<template>
  <div>
    <h1>Update Produk</h1>
    <div class="update-container">
      <!-- Preview or Existing Product Image -->
     <div v-if="previewImage || DataProduk.imageUrl" class="image-container">
  <img
    :src="previewImage || DataProduk.imageUrl"
    alt="Product Image"
    class="product-image"
    @error="handleImageError"
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
        <div class="form-row">
          <label for="image">Gambar Produk:</label>
          <input 
            type="file" 
            id="image" 
            @change="onImageChange" 
            class="file-input"
          />
        </div>
        <div class="form-row">
          <label for="Nama">Nama Produk:</label>
          <input
            type="text"
            id="Nama"
            placeholder="Ubah Nama Produk"
            v-model="DataProduk.Nama"
          />
        </div>
        <div class="form-row">
          <label for="Harga">Harga Produk:</label>
          <input
            type="text"
            id="Harga"
            placeholder="Ubah Harga Produk"
            v-model="formattedHarga"
            @input="formatHarga"
            @blur="validateHarga"
          />
        </div>
        <!-- Category Dropdown -->
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
            placeholder="Ubah Keterangan Produk"
            v-model="DataProduk.Keterangan"
          />
        </div>
        <!-- Nama Warung Display (Read-only) -->
        <div class="form-row">
          <label for="Pedagang">Nama Warung:</label>
          <input
            type="text"
            id="Pedagang"
            placeholder="Nama Warung"
            v-model="DataProduk.Pedagang"
            readonly
          />
        </div>
        <div class="form-row">
          <label for="Stok">Stok Produk:</label>
          <input
            type="text"
            id="Stok"
            placeholder="Ubah Stok Produk"
            v-model="DataProduk.Stok"
          />
        </div>

        <!-- Discount Percentage Input -->
        <div class="form-row">
          <label for="Discount">Diskon (%):</label>
          <div class="discount-input-container">
            <input
              type="number"
              id="Discount"
              placeholder="Masukkan Diskon (%)"
              v-model="discountPercentage"
              @input="validateDiscount"
              min="0"
              max="100"
            />
            <!-- Reset Discount Button -->
            <button
              type="button"
              @click="resetDiscount"
              class="reset-discount-btn"
            >
              Reset
            </button>
          </div>
        </div>
        <!-- Display Discounted Price -->
        <div v-if="DataProduk.Harga_diskon" class="discounted-price">
          <strong>Harga Diskon:</strong> {{ formatCurrency(DataProduk.Harga_diskon) }}
        </div>
        <div class="form-actions">
          <button type="submit">Update Data Produk</button>
        </div>
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
        Harga_diskon: "",
      },
      kategoriList: [],
      warungList: [],
      imageFile: null,
      previewImage: null,
      discountPercentage: 0,
      formattedHarga: "",
      rawHarga: "",
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
    validateDiscount() {
      if (this.discountPercentage > 100) {
        this.discountPercentage = 100;
      }
      this.calculateDiscountedPrice();
    },
    calculateDiscountedPrice() {
      const harga = parseFloat(this.rawHarga);
      const discount = parseFloat(this.discountPercentage);
      if (!isNaN(harga) && !isNaN(discount)) {
        const discountedPrice = harga - (harga * discount) / 100;
        this.DataProduk.Harga_diskon = discountedPrice.toFixed(2);
      } else {
        this.DataProduk.Harga_diskon = "";
      }
    },
    formatHarga(event) {
      // Remove all non-digit characters
      const numericValue = event.target.value.replace(/[^0-9]/g, '');
      this.rawHarga = numericValue;
      
      // Format with thousand separators
      if (numericValue) {
        this.formattedHarga = this.formatCurrency(numericValue);
        this.DataProduk.Harga = numericValue;
      } else {
        this.formattedHarga = '';
        this.DataProduk.Harga = '';
      }
      
      // Recalculate discount if needed
      if (this.discountPercentage > 0) {
        this.calculateDiscountedPrice();
      }
    },
    validateHarga() {
      // Ensure we always have a valid number
      if (!this.rawHarga) {
        this.formattedHarga = '';
        this.DataProduk.Harga = '';
      }
    },
    formatCurrency(value) {
      return parseInt(value, 10).toLocaleString('id-ID');
    },
    async resetDiscount() {
      try {
        this.discountPercentage = 0;
        this.DataProduk.Harga_diskon = "";
        await axios.put(
          `http://localhost:3002/products/${this.DataProduk.id}/reset-discount`
        );
        alert("Discount reset successfully!");
      } catch (error) {
        console.error("Error resetting discount:", error.message);
        alert("Failed to reset discount.");
      }
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
        formData.append("Harga_diskon", this.DataProduk.Harga_diskon || "");
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
        this.$router.push("/Dagangan");
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
    this.DataProduk = {
      ...response.data,
      imageUrl: response.data.imageUrl 
        ? response.data.imageUrl 
        : `http://localhost:3002/images/${response.data.id}`
    };
    
    // Format existing price
    if (this.DataProduk.Harga) {
      this.rawHarga = this.DataProduk.Harga;
      this.formattedHarga = this.formatCurrency(this.DataProduk.Harga);
    }
    
    if (this.DataProduk.Harga_diskon) {
      const harga = parseFloat(this.DataProduk.Harga);
      const hargaDiskon = parseFloat(this.DataProduk.Harga_diskon);
      if (!isNaN(harga) && !isNaN(hargaDiskon) && harga > 0) {
        this.discountPercentage = ((harga - hargaDiskon) / harga * 100).toFixed(2);
      }
    }
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

.discount-input-container {
  display: flex;
  gap: 10px;
  flex: 1;
}

.discount-input-container input {
  flex: 1;
}

.reset-discount-btn {
  padding: 10px 15px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reset-discount-btn:hover {
  background-color: #d32f2f;
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

.delete-btn {
  padding: 12px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.discounted-price {
  margin-top: 10px;
  color: #4caf50;
  font-size: 16px;
}
</style>