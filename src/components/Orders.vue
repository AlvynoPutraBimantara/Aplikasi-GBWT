// Orders.vue
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
            <th>Waktu Pesan</th>
            <th>Catatan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.user }}</td>
            <td>{{ order.address || getUserAddress(order.user) }}</td>
            <td>
              <ul>
                <li v-for="item in order.items" :key="item.id">
                  {{ item.name }} - {{ item.quantity }} <br />
                  - ({{ formatPrice(item.price) }})
                </li>
              </ul>
            </td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>
              <ul>
                <li v-for="item in order.items" :key="item.id">
                  {{ new Date(item.timestamp).toLocaleString() }}
                </li>
              </ul>
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
      return this.userData[userName] || "Alamat tidak ditemukan";
    },
    async acceptOrder(order) {
      let user = JSON.parse(localStorage.getItem("user-info")) || {
        Nama: "Guest",
      };
      if (!user.Nama) {
        user = { Nama: "Guest" };
      }
      order.user = user.Nama;
      await this.$store.dispatch("acceptOrder", order);
    },
    deleteOrder(orderId) {
      this.$store.dispatch("deleteOrder", orderId);
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
  },
};
</script>
