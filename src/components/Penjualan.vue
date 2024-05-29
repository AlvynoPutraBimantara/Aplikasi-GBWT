<template>
  <div>
    <UserHeader />
    <h1>Penjualan</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Pedagang</th>
          <th>Produk</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id">
          <td>{{ transaction.id }}</td>
          <td>{{ transaction.pedagang }}</td>
          <td>
            <ul>
              <li v-for="item in transaction.items" :key="item.id">
                {{ item.name }} ({{ item.quantity }})
              </li>
            </ul>
          </td>
          <td>
            <button @click="deleteTransaction(transaction.id)">Hapus</button>
            <button @click="handleRefundTransaction(transaction)">
              Batalkan
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import UserHeader from "@/components/UserHeader.vue";

export default {
  name: "Penjualan",
  components: {
    UserHeader,
  },
  computed: {
    ...mapState(["transactions"]),
  },
  created() {
    this.fetchTransactions();
  },
  methods: {
    ...mapActions([
      "fetchTransactions",
      "deleteTransactionAction", // Change this to match the Vuex action name
      "refundTransaction",
    ]),
    deleteTransaction(transactionId) {
      this.deleteTransactionAction(transactionId) // Call the renamed action here
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
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
