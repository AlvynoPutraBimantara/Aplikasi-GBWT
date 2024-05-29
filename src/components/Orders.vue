<template>
  <div>
    <UserHeader />
    <h2>STRUK</h2>
    <div v-if="orders.length">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Items</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>
              <ul>
                <li v-for="item in order.items" :key="item.id">
                  {{ item.name }} - {{ item.quantity }} <br />
                  Pedagang: {{ item.pedagang }} <br />
                  ID: {{ item.id }}
                </li>
              </ul>
            </td>
            <td>{{ order.total }}</td>
            <td>
              <button @click="acceptOrder(order)">Accept</button>
              <button @click="deleteOrder(order.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No orders found.</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import UserHeader from "./UserHeader.vue";

export default {
  components: {
    UserHeader,
  },
  computed: {
    ...mapState(["orders"]),
  },
  async mounted() {
    await this.$store.dispatch("fetchOrders");
    await this.$store.dispatch("fetchProducts"); // Ensure products are fetched
  },
  methods: {
    async deleteOrder(orderId) {
      await this.$store.dispatch("deleteOrder", orderId.toString());
    },
    async acceptOrder(order) {
      try {
        await this.$store.dispatch("acceptOrder", order);
        console.log("Order accepted and transaction created successfully.");
      } catch (error) {
        console.error("Error accepting order:", error);
      }
    },
  },
};
</script>
