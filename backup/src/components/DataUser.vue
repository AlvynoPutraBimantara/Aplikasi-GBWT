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
            <th>Role</th>
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
            <td>{{ item.NamaWarung || '-' }}</td>
            <td>{{ item.Nama }}</td>
            <td>{{ item.Telp || '-' }}</td>
            <td>{{ item.Alamat || '-' }}</td>
            <td>{{ item.role }}</td>
            <td>
              <button @click="editUser(item.id)">Edit</button>
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
import jwt from "jsonwebtoken"; // ✅ Import the missing jwt dependency

export default {
  name: "DataUser",
  data() {
    return {
      users: [],
      loading: false,
      error: null
    };
  },
  methods: {
    editUser(id) {
      this.$router.push({ name: "ProfilAdmin", params: { id } });
    },
    async deleteUser(id) {
      try {
        const token = localStorage.getItem("auth-token");
        const response = await axios.delete(`http://localhost:3000/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 200) {
          this.loadData();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        this.handleError(error);
      }
    },
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.deleteUser(id);
      }
    },
    handleError(error) {
      if (error.response) {
        if (error.response.status === 401) {
          this.error = "Session expired. Please login again.";
          this.logout();
        } else if (error.response.status === 403) {
          this.error = "Access denied. Admin privileges required.";
        } else {
          this.error = error.response.data?.message || "Terjadi kesalahan";
        }
      } else {
        this.error = "Tidak dapat terhubung ke server";
      }
    },
    logout() {
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user-info");
      this.$router.push({ name: "Login" });
    },
    async loadData() {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem("auth-token");
        if (!token) {
          this.logout();
          return;
        }

        const decoded = jwt.decode(token);
        if (!decoded || decoded.role !== "admin") {
          this.error = "Access denied. Admin privileges required.";
          return;
        }

        const response = await axios.get("http://localhost:3000/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Debug-Info': 'Checking header forwarding'
          }
        });

        this.users = response.data.filter(user => 
          user.role !== "admin" && user.role !== "guest"
        );
      } catch (error) {
        console.error("Error loading users:", error);
        this.handleError(error);
      } finally {
        this.loading = false;
      }
    }
  },
  async mounted() {
    await this.loadData();
  }
};
</script>

<style>
.data-warung-container {
  text-align: center;
  padding: 20px;
}

.table-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
  max-width: 1200px;
}

th, td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

.user-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

button {
  padding: 6px 12px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button:first-of-type {
  background-color: #3498db;
  color: white;
}

button:first-of-type:hover {
  background-color: #2980b9;
}

button:last-of-type {
  background-color: #e74c3c;
  color: white;
}

button:last-of-type:hover {
  background-color: #c0392b;
}

.error-message {
  color: #e74c3c;
  margin: 15px 0;
  padding: 10px;
  background-color: #fdecea;
  border-radius: 4px;
  display: inline-block;
}

.loading-indicator {
  margin: 20px 0;
  font-style: italic;
  color: #7f8c8d;
}
</style>
