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
              <img 
                :src="item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : baseUrl + item.imageUrl) : ''" 
                alt="User Image" 
                class="user-image" 
                v-if="item.imageUrl"
              />
              <span v-else>No Image</span>
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
      apiBaseUrl: ""
    };
  },
  computed: {
    baseUrl() {
      return process.env.VUE_APP_API_BASE_URL || "http://192.168.100.8:3001";
    }
  },
  methods: {
    getApiBaseUrl() {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001";
      } else {
        return "http://192.168.100.8:3001";
      }
    },
    UpdateUser(id) {
      this.$router.push({ name: "ProfilAdmin", params: { id: id } });
    },
    async HapusUser(id) {
      try {
        const token = localStorage.getItem("token");
        let result = await axios.delete(`${this.apiBaseUrl}/user/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (result.status === 200) {
          this.loadData();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        if (error.response && error.response.status === 400) {
          alert(error.response.data.message);
        } else {
          alert("Gagal menghapus user. Silakan coba lagi.");
        }
      }
    },
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.HapusUser(id);
      }
    },
    async loadData() {
      try {
        const token = localStorage.getItem("token");
        let user = localStorage.getItem("user-info");
        if (!user || !token) {
          this.$router.push({ name: "Login" });
          return;
        }

        const response = await axios.get(`${this.apiBaseUrl}/users/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        this.User = response.data.filter(user => user.role !== "admin").map(user => {
          return {
            ...user,
            Telp: this.formatPhoneDisplay(user.Telp)
          };
        });
      } catch (error) {
        console.error("Error loading users:", error);
        if (error.response && error.response.status === 401) {
          this.$router.push({ name: "Login" });
        } else {
          alert("Gagal memuat data user. Silakan coba lagi.");
        }
      }
    },
    formatPhoneDisplay(telp) {
      if (!telp) return "-";
      const cleaned = telp.toString().replace(/\D/g, '');
      if (cleaned.startsWith('62')) {
        return '0' + cleaned.substring(2);
      }
      return telp;
    }
  },
  async mounted() {
    this.apiBaseUrl = this.getApiBaseUrl();

    const userInfo = localStorage.getItem("user-info");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role !== "admin") {
        this.$router.push({ name: "Dashboard" });
        return;
      }
    }

    this.loadData();
  }
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