<template>
  <div>
    <h1>Riwayat Transaksi</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Total</th>
          <th>Pemesan</th>
          <th>Alamat</th>
          <th>Produk</th>
          <th>Waktu Pesan</th>
          <th>Catatan</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in filteredRiwayatTransaksi" :key="transaction.id">
          <td>{{ transaction.id }}</td>
          <td>{{ formatPrice(transaction.total) }}</td>
          <td>{{ transaction.user }}</td>
          <td>{{ transaction.alamat || getUserAddress(transaction.user) }}</td>
          <td>
            <ul>
              <li v-for="item in transaction.items" :key="item.id">
                {{ item.name }}<br />
                - {{ item.quantity }}<br />
                - ({{ formatPrice(item.price) }})
              </li>
            </ul>
          </td>
          <td>{{ formatDateTime(transaction.created_at) }}</td>
          <td>{{ transaction.catatan }}</td>
          <td>{{ transaction.description }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RiwayatTransaksi",
  data() {
    return {
      userData: {},
      riwayatTransaksi: [],
    };
  },
  computed: {
    filteredRiwayatTransaksi() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return this.riwayatTransaksi.filter((transaction) =>
        transaction.items.some((item) => item.pedagang === user.NamaWarung)
      );
    },
  },
  created() {
    this.fetchUserData();
    this.fetchRiwayatTransaksi();
  },
  methods: {
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    formatDateTime(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
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
    async fetchRiwayatTransaksi() {
      try {
        const response = await axios.get("http://localhost:3005/transactions-history");
        const transactions = response.data;

        // Fetch items for each transaction
        const transactionsWithItems = await Promise.all(
          transactions.map(async (transaction) => {
            const itemsResponse = await axios.get(
              `http://localhost:3005/transactions-history-items/${transaction.id}`
            );
            return {
              ...transaction,
              items: itemsResponse.data,
            };
          })
        );

        this.riwayatTransaksi = transactionsWithItems;
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      }
    },
    getUserAddress(userName) {
      return this.userData[userName] || "Unknown Address";
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>