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
              <img :src="`http://localhost:3002/images/${item.id}`" alt="Product Image" class="product-image" />
            </td>
            <td>{{ item.Nama }}</td>
            <td>{{ formatPrice(item.Harga) }}</td>
            <td :class="{ 'discounted': item.Harga_diskon }">
              {{ item.Harga_diskon ? formatPrice(item.Harga_diskon) : '-' }}
            </td>
            <td>{{ item.Kategori }}</td>
            <td>{{ item.Keterangan }}</td>
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
    };
  },
  methods: {
    async fetchData() {
      try {
        const { data } = await axios.get("http://localhost:3002/products");
        this.DataProduk = data.map((product) => ({
          ...product,
          imageUrl: `http://localhost:3002/images/${product.id}`,
        }));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    },
    UpdateProduk(id) {
      this.$router.push({ name: "UpdateProduk", params: { id } });
    },
    async confirmDelete(id) {
      if (confirm("Are you sure you want to delete this product?")) {
        try {
          await axios.delete(`http://localhost:3002/products/${id}`);
          this.fetchData();
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      }
    },
    formatPrice(value) {
      if (!value) return '-';
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
  },
  mounted() {
    this.fetchData();
  },
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