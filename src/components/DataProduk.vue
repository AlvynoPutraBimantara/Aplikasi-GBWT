<template>
  <div class="data-produk-container">
    <h1>Data Produk</h1>
    <div class="table-container">
      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
            <th>Gambar</th>
            <th>Nama</th>
            <th>Harga</th>
            <th>Harga Diskon</th>
            <th>Kategori</th>
            <th>Keterangan</th>
            <th>Pedagang</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in DataProduk" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <img 
                v-if="item.imageUrl" 
                :src="getImageUrl(item.id)" 
                alt="Product Image" 
                class="product-image" 
                @error="handleImageError"
              />
              <span v-else>No Image</span>
            </td>
            <td>{{ item.Nama }}</td>
            <td>{{ formatPrice(item.Harga) }}</td>
            <td :class="{ 'discounted': item.Harga_diskon }">
              {{ item.Harga_diskon ? formatPrice(item.Harga_diskon) : '-' }}
            </td>
            <td>{{ item.Kategori }}</td>
            <td>{{ item.Keterangan || '-' }}</td>
            <td>{{ item.Pedagang }}</td>
            <td>{{ item.Stok }}</td>
            <td>
              <button @click="UpdateProduk(item.id)" class="btn-edit">Edit</button>
              <button @click="confirmDelete(item.id)" class="btn-delete">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DataProduk",
  data() {
    return {
      DataProduk: [],
      baseUrl: process.env.VUE_APP_PRODUCT_SERVICE_URL || 'http://192.168.100.8:3002',
      loading: false,
      error: null,
      refreshInterval: null
    };
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await axios.get(`${this.baseUrl}/products`);
        this.DataProduk = data;
      } catch (error) {
        console.error("Error fetching products:", error);
        this.error = "Failed to load products";
      } finally {
        this.loading = false;
      }
    },
    getImageUrl(id) {
      return `${this.baseUrl}/images/${id}?t=${Date.now()}`;
    },
    handleImageError(event) {
      event.target.style.display = 'none';
    },
    UpdateProduk(id) {
      this.$router.push({ name: "UpdateProduk", params: { id } });
    },
    async confirmDelete(id) {
      if (confirm("Are you sure you want to delete this product?")) {
        try {
          await axios.delete(`${this.baseUrl}/products/${id}`);
          this.fetchData();
          this.$toast.success("Product deleted successfully");
        } catch (error) {
          console.error("Error deleting product:", error);
          this.$toast.error("Failed to delete product");
        }
      }
    },
    formatPrice(value) {
      if (!value) return '-';
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
      }).format(value);
    },
  },
  mounted() {
    this.fetchData();
    this.refreshInterval = setInterval(() => {
      this.fetchData();
    }, 30000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
};
</script>

<style>
.data-produk-container {
  text-align: center;
}

.table-container {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 0 auto;
}

th,
td {
  text-align: center;
  padding: 10px;
}

.product-image {
  width: 100px;
  height: auto;
  display: block;
  margin: 0 auto;
}

button {
  margin: 0 5px;
}

.btn-edit {
  margin-right: 10px;
}

.btn-delete {
  margin-left: 10px;
}

.discounted {
  color: red;
  font-weight: bold;
}
</style>