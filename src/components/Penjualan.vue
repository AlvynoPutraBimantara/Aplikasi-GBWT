<template>
  <div>
    <UserHeader />
    <h1>Penjualan</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Pemesan</th>
          <th>Alamat</th>
          <th>Produk</th>
          <th>Timestamp</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in filteredTransactions" :key="transaction.id">
          <td>{{ transaction.id }}</td>
          <td>{{ transaction.user }}</td>
          <td>{{ transaction.address || getUserAddress(transaction.user) }}</td>
          <td>
            <ul>
              <li v-for="item in transaction.items" :key="item.id">
                {{ item.name }} - {{ item.pedagang }} ({{ item.quantity }})
                <button @click="deleteTransactionItem(transaction.id, item.id)">
                  Hapus Item
                </button>
                <button @click="refundTransactionItem(transaction, item)">
                  Batalkan Item
                </button>
              </li>
            </ul>
          </td>
          <td>{{ new Date(transaction.timestamp).toLocaleString() }}</td>
          <td>
            <button @click="deleteTransaction(transaction.id)">
              Hapus Transaksi
            </button>
            <button @click="handleRefundTransaction(transaction)">
              Batalkan Transaksi
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions, mapState } from "vuex";
import UserHeader from "@/components/UserHeader.vue";

export default {
  name: "Penjualan",
  components: {
    UserHeader,
  },
  data() {
    return {
      userData: {},
    };
  },
  computed: {
    ...mapState(["transactions"]),
    filteredTransactions() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return this.transactions.filter((transaction) =>
        transaction.items.some((item) => item.pedagang === user.NamaWarung)
      );
    },
  },
  created() {
    this.fetchTransactions();
    this.fetchUserData();
  },
  methods: {
    ...mapActions([
      "fetchTransactions",
      "deleteTransactionAction",
      "deleteTransactionItemAction",
      "refundTransaction",
      "refundTransactionItemAction",
    ]),
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
    getUserAddress(userName) {
      return this.userData[userName] || "Unknown Address";
    },
    deleteTransaction(transactionId) {
      this.deleteTransactionAction(transactionId)
        .then(() => {
          console.log(`Transaction ${transactionId} deleted successfully`);
        })
        .catch((error) => {
          console.error("Error deleting transaction:", error);
        });
    },
    handleRefundTransaction(transaction) {
      this.refundTransaction(transaction)
        .then(() => {
          console.log(`Transaction ${transaction.id} refunded successfully`);
        })
        .catch((error) => {
          console.error("Error refunding transaction:", error);
        });
    },
    deleteTransactionItem(transactionId, itemId) {
      this.deleteTransactionItemAction({ transactionId, itemId })
        .then(() => {
          const transaction = this.transactions.find(
            (t) => t.id === transactionId
          );
          if (transaction && transaction.items.length === 0) {
            this.deleteTransaction(transactionId);
          }
          console.log(
            `Item ${itemId} from transaction ${transactionId} deleted successfully`
          );
        })
        .catch((error) => {
          console.error("Error deleting item:", error);
        });
    },
    refundTransactionItem(transaction, item) {
      this.refundTransactionItemAction({ transaction, item })
        .then(() => {
          const updatedTransaction = this.transactions.find(
            (t) => t.id === transaction.id
          );
          if (updatedTransaction && updatedTransaction.items.length === 0) {
            this.deleteTransaction(transaction.id);
          }
          console.log(
            `Item ${item.id} from transaction ${transaction.id} refunded successfully`
          );
        })
        .catch((error) => {
          console.error("Error refunding item:", error);
        });
    },
  },
};
</script>
