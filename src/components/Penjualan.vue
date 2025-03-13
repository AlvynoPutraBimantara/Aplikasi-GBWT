<template>
  <div>
    <h1>Penjualan</h1>
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
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in filteredTransactions" :key="transaction.id">
          <td>{{ transaction.id }}</td>
          <td>{{ formatPrice(transaction.total) }}</td>
          <td>{{ transaction.user }}</td>
          <td>{{ transaction.alamat }}</td>
          <td>
            <ul>
              <li v-for="item in transaction.transaction_items" :key="item.id">
                {{ item.name }} <br />- {{ formatPrice(item.price) }}<br />
                - ({{ item.quantity }})
              </li>
            </ul>
          </td>
          <td>{{ formatDateTime(transaction.created_at) }}</td>
          <td>{{ transaction.catatan }}</td>
          <td>
            <button @click="deleteTransaction(transaction.id)">
              Terima Pesanan
            </button>
            <button @click="deleteTransactions(transaction.id)">Kasbon</button>
            <button @click="handleRefundTransaction(transaction)">
              Kembalikan Pesanan
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Kasbon Table -->
    <div>
      <h2>Kasbon</h2>
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
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in kasbonTransactions" :key="transaction.id">
            <td>{{ transaction.id }}</td>
            <td>{{ formatPrice(transaction.total) }}</td>
            <td>{{ transaction.user }}</td>
            <td>{{ transaction.alamat }}</td>
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
            <td>
              <button @click="markAsPaid(transaction.id)">
                Lunas
              </button>
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
  name: "Penjualan",
  data() {
    return {
      transactions: [], // Store transactions fetched from the backend
      kasbonTransactions: [], // Store Kasbon transactions fetched from the backend
      userData: {}, // Store user data for address lookup
    };
  },
  computed: {
    // Filter transactions to show only those relevant to the logged-in user
    filteredTransactions() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return this.transactions.filter((transaction) =>
        transaction.transaction_items.some((item) => item.pedagang === user.NamaWarung)
      );
    },
  },
  async created() {
    await this.fetchTransactions(); // Fetch transactions when the component is mounted
    await this.fetchKasbonTransactions(); // Fetch Kasbon transactions when the component is mounted
  },
  methods: {
    // Fetch transactions from the backend
    async fetchTransactions() {
      try {
        const response = await axios.get("http://localhost:3005/transactions");
        this.transactions = response.data; // Store fetched transactions
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    },
    // Fetch Kasbon transactions from the backend
    async fetchKasbonTransactions() {
      try {
        // Fetch all transactions with description "Kasbon"
        const response = await axios.get("http://localhost:3005/transactions-history");
        const kasbonTransactions = response.data.filter(
          (transaction) => transaction.description === "Kasbon"
        );

        // Fetch items for each Kasbon transaction
        const kasbonTransactionsWithItems = await Promise.all(
          kasbonTransactions.map(async (transaction) => {
            const itemsResponse = await axios.get(
              `http://localhost:3005/transactions-history-items/${transaction.id}`
            );
            return {
              ...transaction,
              items: itemsResponse.data,
            };
          })
        );

        this.kasbonTransactions = kasbonTransactionsWithItems;
      } catch (error) {
        console.error("Error fetching Kasbon transactions:", error);
      }
    },
    // Format price as currency
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    // Format date and time
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
    // Handle "Terima Pesanan" action
    async deleteTransaction(transactionId) {
      try {
        await axios.post(`http://localhost:3005/transactions/${transactionId}/move-to-history`, {
          description: "Lunas",
        });
        this.transactions = this.transactions.filter(
          (transaction) => transaction.id !== transactionId
        );
        alert("Pesanan diterima dan dipindahkan ke riwayat!");
      } catch (error) {
        console.error("Error accepting order:", error);
        alert("Gagal menerima pesanan. Silakan coba lagi.");
      }
    },
    // Handle "Kasbon" action
    async deleteTransactions(transactionId) {
      try {
        await axios.post(`http://localhost:3005/transactions/${transactionId}/move-to-history`, {
          description: "Kasbon",
        });
        this.transactions = this.transactions.filter(
          (transaction) => transaction.id !== transactionId
        );
        alert("Kasbon berhasil dan dipindahkan ke riwayat!");
        await this.fetchKasbonTransactions(); // Refresh Kasbon transactions after moving
      } catch (error) {
        console.error("Error handling Kasbon:", error);
        alert("Gagal memproses Kasbon. Silakan coba lagi.");
      }
    },
    // Handle refund action
    async handleRefundTransaction(transaction) {
      try {
        // Call the refund endpoint
        await axios.post(`http://localhost:3005/transactions/${transaction.id}/refund`);
        this.transactions = this.transactions.filter(
          (t) => t.id !== transaction.id
        );
        alert("Pesanan berhasil dikembalikan dan stok diperbarui!");
      } catch (error) {
        console.error("Error refunding transaction:", error);
        alert("Gagal mengembalikan pesanan. Silakan coba lagi.");
      }
    },
    // Mark transaction as paid
    async markAsPaid(transactionId) {
      try {
        // Update the transaction description to "Sudah dibayar"
        await axios.put(`http://localhost:3005/transactions-history/${transactionId}/mark-as-paid`);
        alert("Transaksi berhasil ditandai sebagai Sudah Dibayar!");
        await this.fetchKasbonTransactions(); // Refresh Kasbon transactions after updating
      } catch (error) {
        console.error("Error marking transaction as paid:", error);
        alert("Gagal menandai transaksi sebagai Sudah Dibayar. Silakan coba lagi.");
      }
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>