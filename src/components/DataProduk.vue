<template>
  <div class="data-produk-container">
    <Header />
    <h1>Data Produk</h1>
    <div class="table-container">
      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nama</th>
            <th>Harga</th>
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
            <td>{{ item.Nama }}</td>
            <td>{{ item.Harga }}</td>
            <td>{{ item.Kategori }}</td>
            <td>{{ item.Keterangan }}</td>
            <td>{{ item.Pedagang }}</td>
            <td>{{ item.Stok }}</td>
            <td>
              <button @click="UpdateProduk(item.id)" class="btn-edit">
                Edit
              </button>
              <button @click="confirmDelete(item.id)" class="btn-delete">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Header from "./Header.vue";
import axios from "axios";

export default {
  name: "DataProduk",
  data() {
    return {
      Nama: "",
      DataProduk: [],
    };
  },
  components: {
    Header,
  },
  methods: {
    UpdateProduk(id) {
      this.$router.push({ name: "UpdateProduk", params: { id: id } });
    },
    async HapusProduk(id) {
      let result = await axios.delete("http://localhost:3000/DataProduk/" + id);
      console.warn(result);
      if (result.status === 200) {
        this.loadData();
      }
    },
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.HapusProduk(id);
      }
    },
    async loadData() {
      let user = localStorage.getItem("user-info");
      if (!user) {
        this.$router.push({ name: "SignUp" });
      } else {
        this.Nama = JSON.parse(user).name;
        let result = await axios.get("http://localhost:3000/DataProduk");
        this.DataProduk = result.data;
      }
    },
  },
  async mounted() {
    this.loadData();
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
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 0 auto; /* Center the table horizontally */
}

th,
td {
  width: 800px;
  height: 50px;
  text-align: center;
}

button {
  margin: 0 5px; /* Add margin between buttons */
}

.btn-edit {
  margin-right: 10px; /* Specific margin for the edit button */
}

.btn-delete {
  margin-left: 10px; /* Specific margin for the delete button */
}
</style>
