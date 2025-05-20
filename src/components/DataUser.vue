<template>
  <div class="data-warung-container">


    <h1>Data User</h1>
    <div class="table-container">
      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
            <th>Gambar</th>
            <th>Nama Warung</th>
            <th>Nama</th>
            <th>Telp</th>
            <th>Alamat</th>
         
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in User" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <img :src="item.imageUrl" alt="User Image" class="user-image" />
            </td>
            <td>{{ item.NamaWarung }}</td>
            <td>{{ item.Nama }}</td>
            <td>{{ item.Telp }}</td>
            <td>{{ item.Alamat }}</td>
            

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

import axios from "axios";

export default {
  name: "DataUser",
  data() {
    return {
      User: [],
    };
  },
  components: {
  
  },
  methods: {
    UpdateUser(id) {
      this.$router.push({ name: "ProfilAdmin", params: { id: id } });
    },
    async HapusUser(id) {
      try {
        let result = await axios.delete(`http://localhost:3001/user/${id}`);
        if (result.status === 200) {
          this.loadData();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    },
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.HapusUser(id);
      }
    },
    async loadData() {
      try {
        let user = localStorage.getItem("user-info");
        if (!user) {
          this.$router.push({ name: "SignUp" });
        } else {
          let result = await axios.get("http://localhost:3001/users");
          this.User = result.data.filter((user) => user.role !== "admin");
        }
      } catch (error) {
        console.error("Error loading users:", error);
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

.user-image {
  width: 100px;
  height: auto;
  display: block;
  margin: 0 auto;
}

button:first-of-type {
  background-color: #2ecc71;
  color: white;
}

button:first-of-type:hover {
  background-color: #27ae60;
}

button:last-of-type {
  background-color: #e74c3c;
  color: white;
}

button:last-of-type:hover {
  background-color: #c0392b;
}
</style>
