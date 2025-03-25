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
            <td>{{ order.pemesan || order.user }}</td>
            <td>{{ order.alamat }}</td>
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
              {{ formatDateTime(order.created_at) }}
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
import moment from "moment-timezone";

export default {
  data() {
    return {
      orders: [],
      userData: {},
      guestId: localStorage.getItem("guestId") || null,
    };
  },
  computed: {
    filteredOrders() {
      const user = JSON.parse(localStorage.getItem("user-info")) || { Nama: this.guestId };
      return this.orders.filter((order) => order.user === user.Nama || order.user === this.guestId);
    },
  },
  async mounted() {
    await this.fetchOrders();
    await this.fetchUserData();
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get("http://localhost:3003/orders");
        this.orders = response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    async fetchUserData() {
      try {
        const response = await axios.get("http://localhost:3001/users");
        this.userData = response.data.reduce((acc, user) => {
          acc[user.Nama] = user.Alamat;
          return acc;
        }, {});
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    async acceptOrder(order) {
      try {
        const user = JSON.parse(localStorage.getItem("user-info")) || { 
          Nama: this.guestId, 
          Alamat: order.alamat || "Unknown" 
        };
        
        const transactionData = {
          user: user.Nama,
          total: order.total,
          catatan: order.catatan,
          alamat: order.alamat,
          pemesan: order.pemesan || user.Nama,
          order_items: order.order_items,
        };

        await axios.post("http://localhost:3005/transactions", { order: transactionData });
        await this.deleteOrder(order.id);
        alert("Order accepted and transaction created successfully!");
      } catch (error) {
        console.error("Error accepting order:", error);
        alert("Failed to accept order. Please try again.");
      }
    },
    async deleteOrder(orderId) {
      try {
        const order = this.orders.find((order) => order.id === orderId);
        if (!order) throw new Error("Order not found");

        const refundResponse = await axios.post(
          `http://localhost:3003/orders/${orderId}/refund`
        );

        if (refundResponse.status === 200) {
          this.orders = this.orders.filter((order) => order.id !== orderId);
          alert("Pesanan berhasil dikembalikan dan stok diperbarui!");
        } else {
          throw new Error("Failed to process refund.");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Gagal mengembalikan pesanan. Silakan coba lagi.");
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    formatDateTime(dateString) {
      if (!dateString) return "";
      return moment(dateString)
        .tz("Asia/Jakarta")
        .format("DD/MM/YYYY HH:mm:ss");
    },
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
  text-align: left;
}
</style>