<template>
  <div>
    <h1>Update Produk</h1>
    <div class="update-container">
      <!-- Preview or Existing Product Image -->
      <div v-if="previewImage || DataProduk.imageUrl" class="image-container">
        <img
          :src="previewImage || getImageUrlWithTimestamp(DataProduk.imageUrl)"
          @error="handleImageError"
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
        <!-- Nama Warung Dropdown -->
        <div class="form-row">
          <label for="Pedagang">Nama Warung:</label>
          <select id="Pedagang" v-model="DataProduk.Pedagang">
            <option disabled value="">Pilih Pedagang</option>
            <option
              v-for="warung in warungList"
              :key="warung.id"
              :value="warung.NamaWarung"
            >
              {{ warung.NamaWarung }}
            </option>
          </select>
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
        <div class="form-row">
          <label for="image">Gambar Produk:</label>
          <input type="file" id="image" @change="onImageChange" accept="image/*" />
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
          <strong>Harga Diskon:</strong> {{ formatPrice(DataProduk.Harga_diskon) }}
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
  name: "UpdateProduk",
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
        Harga_diskon: null,
      },
      formattedHarga: "",
      kategoriList: [],
      warungList: [],
      imageFile: null,
      previewImage: null,
      discountPercentage: 0,
      baseUrl: process.env.VUE_APP_PRODUCT_SERVICE_URL || "http://192.168.100.8:3002",
    };
  },
  methods: {
    getImageUrlWithTimestamp(url) {
      if (!url) return '';
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    },

    calculateDiscountedPrice() {
      const rawHarga = this.DataProduk.Harga.toString().replace(/[^\d]/g, '');
      const harga = parseFloat(rawHarga);
      const discount = parseFloat(this.discountPercentage);

      if (!isNaN(harga)) {
        if (!isNaN(discount) && discount > 0) {
          const discountedPrice = harga - (harga * discount) / 100;
          this.DataProduk.Harga_diskon = discountedPrice.toFixed(2);
        } else {
          this.DataProduk.Harga_diskon = null;
          this.discountPercentage = 0;
        }
      } else {
        this.DataProduk.Harga_diskon = null;
        this.discountPercentage = 0;
      }
    },

    formatHarga(event) {
      let value = event.target.value.replace(/[^\d]/g, '');
      this.DataProduk.Harga = value;

      if (value.length > 0) {
        this.formattedHarga = parseInt(value).toLocaleString('id-ID');
      } else {
        this.formattedHarga = '';
      }
    },

  async fetchKategori() {
      try {
        const response = await axios.get(`http://192.168.100.8:3006/categories`);
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
    const baseUrl = process.env.VUE_APP_USER_SERVICE_URL 
      ? process.env.VUE_APP_USER_SERVICE_URL.replace('/user-service', '')
      : 'http://192.168.100.8:3001';
    const response = await axios.get(`${baseUrl}/users`);
    this.warungList = response.data.filter(user => user.NamaWarung);
  } catch (error) {
    console.error("Error fetching warung list:", error.message);
  }
},

    onImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.match('image.*')) {
          alert('Please select an image file');
          return;
        }

        this.imageFile = file;
        this.previewImage = URL.createObjectURL(file);
        event.target.value = '';
      }
    },

    cancelImageSelection() {
      this.imageFile = null;
      this.previewImage = null;
      document.getElementById('image').value = '';
    },

    validateDiscount() {
      if (this.discountPercentage > 100) {
        this.discountPercentage = 100;
      }
      this.calculateDiscountedPrice();
    },

    async resetDiscount() {
      try {
        this.discountPercentage = 0;
        this.DataProduk.Harga_diskon = null;
        await axios.put(
          `${this.baseUrl}/products/${this.DataProduk.id}/reset-discount`
        );
        alert("Discount reset successfully!");
      } catch (error) {
        console.error("Error resetting discount:", error.message);
        alert("Failed to reset discount.");
      }
    },

    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },

    handleImageError(event) {
      console.error("Image load error", event);
    },

    async updateProduk() {
      try {
        const formData = new FormData();
        formData.append("Nama", this.DataProduk.Nama);
        formData.append("Harga", this.DataProduk.Harga.toString().replace(/\./g, ''));
        formData.append("Kategori", this.DataProduk.Kategori);
        formData.append("Keterangan", this.DataProduk.Keterangan);
        formData.append("Pedagang", this.DataProduk.Pedagang);
        formData.append("Stok", this.DataProduk.Stok);

        const discountValue = this.discountPercentage === 0 ||
          this.discountPercentage === '' ||
          !this.DataProduk.Harga_diskon ?
          null :
          this.DataProduk.Harga_diskon;
        formData.append("Harga_diskon", discountValue === null ? '' : discountValue.toString());

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        await axios.put(
          `${this.baseUrl}/products/${this.DataProduk.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );

        const response = await axios.get(
          `${this.baseUrl}/products/${this.DataProduk.id}`
        );
        this.DataProduk = {
          ...response.data,
          imageUrl: this.getImageUrlWithTimestamp(response.data.imageUrl ||
            `${this.baseUrl}/images/${response.data.id}`)
        };

        alert("Product updated successfully!");
        this.$router.push({ name: 'DataProduk' });
      } catch (error) {
        console.error("Error updating product:", error);
        alert(`Failed to update product. Error: ${error.message}`);
      }
    },

    async deleteProduk() {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
        await axios.delete(`${this.baseUrl}/products/${this.DataProduk.id}`);
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
        `${this.baseUrl}/products/${productId}`
      );
      this.DataProduk = {
        ...response.data,
        imageUrl: this.getImageUrlWithTimestamp(response.data.imageUrl ||
          `${this.baseUrl}/images/${response.data.id}`)
      };

      if (this.DataProduk.Harga) {
        const rawHarga = parseFloat(this.DataProduk.Harga).toString();
        this.DataProduk.Harga = rawHarga.replace(/\./g, '');
        this.formattedHarga = parseInt(rawHarga).toLocaleString('id-ID');
      }

      if (this.DataProduk.Harga_diskon) {
        const harga = parseFloat(this.DataProduk.Harga);
        const hargaDiskon = parseFloat(this.DataProduk.Harga_diskon);
        if (!isNaN(harga) && !isNaN(hargaDiskon) && harga > 0) {
          this.discountPercentage = ((harga - hargaDiskon) / harga * 100).toFixed(2);
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      alert("Failed to fetch product data. Please try again.");
    }

    await this.fetchKategori();
    await this.fetchWarung();
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
.form-row select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
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