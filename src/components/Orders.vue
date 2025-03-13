<template>
  <div>
    <h2>STRUK</h2>
    <div v-if="filteredOrders.length">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Pemesan</th>
            <th>Alamat</th>
            <th>Barang</th>
            <th>Total</th>
            <th>Waktu Pesan</th>
            <th>Catatan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.user }}</td>
            <td>{{ order.address || getUserAddress(order.user) }}</td>
            <td>
              <ul>
                <li v-for="item in order.order_items" :key="item.id">
                  {{ item.name }} - {{ item.quantity }} <br />
                  - ({{ formatPrice(item.price) }})
                </li>
              </ul>
            </td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>
              {{ formatDateTime(order.created_at) }} <!-- Display formatted timestamp in 24-hour format -->
            </td>
            <td>{{ order.catatan }}</td>
            <td>
              <button @click="acceptOrder(order)">Pesan</button>
              <button @click="deleteOrder(order.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>Tidak ada pesanan</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment-timezone"; // Import moment-timezone

export default {
  data() {
    return {
      orders: [], // Store orders fetched from the backend
      userData: {}, // Store user data for address lookup
    };
  },
  computed: {
    // Filter orders to show only those relevant to the logged-in user
    filteredOrders() {
      const user = JSON.parse(localStorage.getItem("user-info")) || { Nama: "Guest" };
      return this.orders.filter((order) => order.user === user.Nama);
    },
  },
  async mounted() {
    await this.fetchOrders(); // Fetch orders when the component is mounted
    await this.fetchUserData(); // Fetch user data for address lookup
  },
  methods: {
    // Fetch orders from the backend
    async fetchOrders() {
      try {
        const response = await axios.get("http://localhost:3003/orders");
        this.orders = response.data; // Store fetched orders
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    // Fetch user data for address lookup
    async fetchUserData() {
      try {
        const response = await axios.get("http://localhost:3001/users");
        this.userData = response.data.reduce((acc, user) => {
          acc[user.Nama] = user.Alamat; // Map user names to addresses
          return acc;
        }, {});
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    // Get user address by name
    getUserAddress(userName) {
      return this.userData[userName] || "Alamat tidak ditemukan";
    },
    // Handle order acceptance
    async acceptOrder(order) {
      try {
        const user = JSON.parse(localStorage.getItem("user-info")) || { Nama: "Guest", Alamat: "Unknown" };
        const transactionData = {
          user: user.Nama,
          total: order.total,
          catatan: order.catatan,
          alamat: user.Alamat, // Insert user's Alamat data value
          order_items: order.order_items,
        };

        // Create the transaction in the backend
        await axios.post("http://localhost:3005/transactions", { order: transactionData });

        // Delete the order from the orders table after successful transaction creation
        await this.deleteOrder(order.id);

        alert("Order accepted and transaction created successfully!");
      } catch (error) {
        console.error("Error accepting order:", error);
        alert("Failed to accept order. Please try again.");
      }
    },
    // Handle order deletion
    async deleteOrder(orderId) {
      try {
        await axios.delete(`http://localhost:3003/orders/${orderId}`);
        this.orders = this.orders.filter((order) => order.id !== orderId); // Remove deleted order from the list
        
        
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    },
    // Format price as currency
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    // Format date and time in 24-hour format (UTC+7 Asia/Jakarta)
    formatDateTime(dateString) {
      if (!dateString) return ""; // Handle empty or null values
      return moment(dateString)
        .tz("Asia/Jakarta") // Convert to Asia/Jakarta timezone
        .format("DD/MM/YYYY HH:mm:ss"); // Format as DD/MM/YYYY HH:mm:ss (24-hour format)
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>