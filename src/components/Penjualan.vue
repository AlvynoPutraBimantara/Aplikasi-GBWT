<template>
  <div>
    <UserHeader />
    <h1>Penjualan</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Pedagang</th>
          <th>Items</th>
          <th>Actions</th>
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
            <button @click="deleteTransaction(transaction.id)">Delete</button>
            <button @click="refundTransaction(transaction)">Refund</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import UserHeader from "./UserHeader.vue";
import { mapState, mapActions } from "vuex";

export default {
  components: {
    UserHeader,
  },
  name: "Penjualan",
  computed: {
    ...mapState(["transactions"]),
  },
  methods: {
    ...mapActions([
      "fetchTransactions",
      "deleteTransaction",
      "refundTransaction",
    ]),
  },
  created() {
    this.fetchTransactions();
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
