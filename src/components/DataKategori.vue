<template>
  <div class="data-kategori-container">
    <Header />
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
            <td>{{ item.Kategori }}</td>
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
import Header from "./Header.vue";
import axios from "axios";

export default {
  name: "DataKategori",
  data() {
    return {
      DataKategori: [],
    };
  },
  components: {
    Header,
  },
  methods: {
    UpdateKategori(id) {
      this.$router.push({ name: "UpdateKategori", params: { id: id } });
    },
    async HapusKategori(id) {
      let result = await axios.delete(
        "http://localhost:3000/DataKategori/" + id
      );
      console.warn(result);
      if (result.status == 200) {
        this.loadData();
      }
    },
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.HapusKategori(id);
      }
    },
    async loadData() {
      let user = localStorage.getItem("user-info");
      if (!user) {
        this.$router.push({ name: "SignUp" });
      } else {
        let result = await axios.get("http://localhost:3000/DataKategori");
        this.DataKategori = result.data;
      }
    },
    goToTambahKategori() {
      this.$router.push({ name: "TambahKategori" });
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
