<template>
  <div>
    <UserHeader />
    <h2>Shopping Cart</h2>
    <div v-if="cart.length">
      <table>
        <thead>
          <tr>
            <th>Warung</th>
            <th>Produk</th>
            <th>Harga</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cart" :key="item.id">
            <td>{{ item.pedagang }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.price }}</td>
            <td>
              <input
                type="number"
                v-model.number="item.quantity"
                @input="updateQuantity(item)"
                :min="1"
                :max="getProductStock(item.id)"
              />
            </td>
            <td>{{ item.price * item.quantity }}</td>
            <td>
              <button @click="removeFromCart(item.id)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p>Total: {{ cartTotalPrice }}</p>
      <button @click="checkout">Checkout</button>
    </div>
    <div v-else>
      <p>Keranjang Kosong</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import UserHeader from "./UserHeader.vue";

export default {
  components: {
    UserHeader,
  },
  computed: {
    ...mapState(["cart"]),
    ...mapGetters(["cartTotalPrice"]),
  },
  methods: {
    updateQuantity(item) {
      if (item.quantity < 1) {
        item.quantity = 1;
      }
      const maxStock = this.getProductStock(item.id);
      if (item.quantity > maxStock) {
        item.quantity = maxStock;
      }
      this.$store.dispatch("updateCartQuantity", {
        id: item.id,
        quantity: item.quantity,
      });
    },
    removeFromCart(itemId) {
      this.$store.dispatch("removeFromCart", itemId);
    },
    async checkout() {
      const order = {
        id: `"${Date.now()}"`,
        items: this.cart.map((item) => ({
          id: item.id,
          name: item.name,
          pedagang: item.pedagang,
          price: item.price,
          quantity: item.quantity,
        })),
        total: this.cartTotalPrice,
      };
      await this.$store.dispatch("placeOrder", order);
      await this.$store.dispatch("clearCartOnServer");
      this.$store.dispatch("clearCart");
    },
    getProductStock(productId) {
      const product = this.$store.state.products.find(
        (product) => product.id === productId
      );
      return product ? product.Stok : 0;
    },
  },
  async mounted() {
    await this.$store.dispatch("fetchCart");
    await this.$store.dispatch("fetchProducts"); // Ensure products are fetched
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

td input {
  width: 50px;
}
</style>
