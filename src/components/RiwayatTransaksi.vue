<template>
  <div>
    <UserHeader />
    <h1>Riwayat Transaksi</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Pemesan</th>
          <th>Alamat</th>
          <th>Produk</th>
          <th>Waktu Pesan</th>
          <th>Catatan</th>
          <th>Keterangan</th>
          <!---<th>Aksi</th>-->
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="transaction in filteredRiwayatTransaksi"
          :key="transaction.id"
        >
          <td>{{ transaction.id }}</td>
          <td>{{ transaction.user }}</td>
          <td>{{ transaction.address || getUserAddress(transaction.user) }}</td>
          <td>
            <ul>
              <li v-for="item in transaction.items" :key="item.id">
                {{ item.name }} - ({{ item.quantity }})
              </li>
            </ul>
          </td>
          <td>{{ new Date(transaction.timestamp).toLocaleString() }}</td>
          <td>{{ transaction.catatan }}</td>
          <td>{{ transaction.description || transaction.descriptions }}</td>
          <!---<td><button @click="deleteTransactionHistory(transaction.id)">Hapus</button></td> -->
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import UserHeader from "@/components/UserHeader.vue";

export default {
  name: "RiwayatTransaksi",
  components: {
    UserHeader,
  },
  data() {
    return {
      userData: {},
    };
  },
  computed: {
    ...mapState(["riwayatTransaksi"]),
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
    fetchUserData() {
      axios
        .get("http://localhost:3000/User")
        .then((response) => {
          this.userData = response.data.reduce((acc, user) => {
            acc[user.Nama] = user.Alamat;
            return acc;
          }, {});
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    },
    fetchRiwayatTransaksi() {
      axios
        .get("http://localhost:3000/RiwayatTransaksi")
        .then((response) => {
          this.$store.commit("SET_RIWAYAT_TRANSAKSI", response.data);
        })
        .catch((error) => {
          console.error("Error fetching transaction history:", error);
        });
    },
    getUserAddress(userName) {
      return this.userData[userName] || "Unknown Address";
    },
    deleteTransactionHistory(transactionId) {
      axios
        .delete(`http://localhost:3000/RiwayatTransaksi/${transactionId}`)
        .then(() => {
          this.$store.commit("REMOVE_TRANSACTION_HISTORY", transactionId);
          console.log(
            `Transaction ${transactionId} deleted successfully from history`
          );
        })
        .catch((error) => {
          console.error("Error deleting transaction history:", error);
        });
    },
  },
};
</script>
