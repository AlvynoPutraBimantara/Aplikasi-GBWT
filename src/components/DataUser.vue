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
            <th>Password</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in users" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <img v-if="item.imageUrl" :src="item.imageUrl" alt="User Image" class="user-image" />
              <span v-else>No Image</span>
            </td>
            <td>{{ item.NamaWarung }}</td>
            <td>{{ item.Nama }}</td>
            <td>{{ item.Telp }}</td>
            <td>{{ item.Alamat }}</td>
            <td>{{ item.Password }}</td>

            <td>
              <button @click="updateUser(item.id)">Edit</button>
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
      users: [],
    };
  },
  methods: {
    updateUser(id) {
      this.$router.push({ name: "ProfilAdmin", params: { id: id } });
    },
    async deleteUser(id) {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        const result = await axios.delete(`http://localhost:3000/user-service/${id}`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });
        if (result.status === 200) {
          this.loadData();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Gagal menghapus user. Silakan coba lagi.");
      }
    },
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.deleteUser(id);
      }
    },
    async loadData() {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        if (!userInfo) {
          this.$router.push({ name: "SignUp" });
          return;
        }

        const response = await axios.get("http://localhost:3000/user-service", {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });

        if (response.data.success) {
          this.users = response.data.data.filter(user => user.role !== "admin");
        } else {
          throw new Error(response.data.message || "Failed to load users");
        }
      } catch (error) {
        console.error("Error loading users:", error);
        if (error.response && error.response.status === 401) {
          alert("Sesi telah berakhir. Silakan login kembali.");
          this.$router.push({ name: "Login" });
        } else {
          alert("Gagal memuat data user. Silakan coba lagi.");
        }
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
