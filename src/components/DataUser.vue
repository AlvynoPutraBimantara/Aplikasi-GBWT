<template>
  <div class="data-warung-container">
    <Header />

    <h1>Data User</h1>
    <div class="table-container">
      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nama Warung</th>
            <th>Nama</th>
            <th>Telp</th>
            <th>Alamat</th>
            <th>Password</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in User" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.NamaWarung }}</td>
            <td>{{ item.Nama }}</td>
            <td>{{ item.Telp }}</td>
            <td>{{ item.Alamat }}</td>
            <td>{{ item.Password }}</td>
            <td>
              <button @click="UpdateUser(item.id)">Edit</button>
              <button @click="confirmDelete(item.id)">Hapus</button>
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
  name: "DataUser",
  data() {
    return {
      User: [],
    };
  },
  components: {
    Header,
  },
  methods: {
    UpdateUser(id) {
      this.$router.push({ name: "Profil", params: { id: id } });
    },
    async HapusUser(id) {
      let result = await axios.delete(`http://localhost:3000/User/${id}`);
      if (result.status === 200) {
        this.loadData();
      }
    },
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.HapusUser(id);
      }
    },
    async loadData() {
      let user = localStorage.getItem("user-info");
      if (!user) {
        this.$router.push({ name: "SignUp" });
      } else {
        let result = await axios.get("http://localhost:3000/User");
        this.User = result.data;
      }
    },
  },
  async mounted() {
    this.loadData();
  },
};
</script>

<style>
.data-warung-container {
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
  width: 100px;
  height: 50px;
  text-align: center;
  padding: 8px;
  border: 1px solid black;
}
</style>
