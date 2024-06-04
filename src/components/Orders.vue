<template>
  <div>
    <UserHeader />
    <h2>STRUK</h2>
    <div v-if="orders.length">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Pemesan</th>
            <th>Alamat</th>
            <th>Barang</th>
            <th>Total</th>
            <th>Timestamp</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.user }}</td>
            <td>{{ getUserAddress(order.user) }}</td>
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
              <ul>
                <li v-for="item in order.items" :key="item.id">
                  {{ new Date(item.timestamp).toLocaleString() }}
                </li>
              </ul>
            </td>
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
import { mapState } from "vuex";
import UserHeader from "./UserHeader.vue";

export default {
  components: {
    UserHeader,
  },
  data() {
    return {
      userData: {},
    };
  },
  computed: {
    ...mapState(["orders"]),
  },
  async mounted() {
    await this.$store.dispatch("fetchOrders");
    await this.$store.dispatch("fetchProducts"); // Ensure products are fetched
    this.fetchUserData();
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
    getUserAddress(userName) {
      return this.userData[userName] || "Unknown Address";
    },
    async deleteOrder(orderId) {
      await this.$store.dispatch("deleteOrder", orderId.toString());
    },
    async acceptOrder(order) {
      const user = JSON.parse(localStorage.getItem("user-info")) || {
        Nama: "Guest",
      };
      await this.$store.dispatch("acceptOrder", { ...order, user });
    },
  },
};
</script>
