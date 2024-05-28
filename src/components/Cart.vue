<template>
  <div>
    <UserHeader />
    <h2>Shopping Cart</h2>
    <div v-if="cart.length">
      <div v-for="item in cart" :key="item.id">
        <p>{{ item.name }} - {{ item.quantity }}</p>
        <label for="quantity">Quantity:</label>
        <input
          type="number"
          v-model.number="item.quantity"
          @input="updateQuantity(item)"
          :min="1"
          :max="getProductStock(item.id)"
        />

        <button @click="removeFromCart(item.id)">Remove</button>
      </div>
      <p>Total: {{ cartTotalPrice }}</p>
      <button @click="checkout">Checkout</button>
    </div>
    <div v-else>
      <p>Your cart is empty.</p>
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
        id: Date.now(),
        items: this.cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        total: this.cartTotalPrice,
      };
      await this.$store.dispatch("placeOrder", order);
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
