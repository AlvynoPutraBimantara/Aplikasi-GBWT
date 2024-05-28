import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    cart: [],
    orders: [],
    products: [],
  },
  mutations: {
    SET_CART(state, cart) {
      state.cart = cart;
    },
    ADD_TO_CART(state, item) {
      const existingItem = state.cart.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.cart.push(item);
      }
    },
    REMOVE_FROM_CART(state, itemId) {
      state.cart = state.cart.filter((item) => item.id !== itemId);
    },
    UPDATE_CART_QUANTITY(state, { id, quantity }) {
      const item = state.cart.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },
    CLEAR_CART(state) {
      state.cart = [];
    },
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    ADD_ORDER(state, order) {
      state.orders.push(order);
    },
    REMOVE_ORDER(state, orderId) {
      state.orders = state.orders.filter(
        (order) => order.id.toString() !== orderId.toString()
      );
    },
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    UPDATE_PRODUCT_STOCK(state, { productId, quantity }) {
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        product.Stok -= quantity;
      }
    },
  },
  actions: {
    async fetchCart({ commit }) {
      try {
        const response = await axios.get("http://localhost:3000/Cart");
        commit("SET_CART", response.data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    },
    async addToCart({ commit }, item) {
      try {
        const response = await axios.post("http://localhost:3000/Cart", item);
        commit("ADD_TO_CART", response.data);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },
    async removeFromCart({ commit }, itemId) {
      try {
        await axios.delete(`http://localhost:3000/Cart/${itemId}`);
        commit("REMOVE_FROM_CART", itemId);
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    },
    async updateCartQuantity({ commit }, item) {
      commit("UPDATE_CART_QUANTITY", item);
    },
    clearCart({ commit }) {
      commit("CLEAR_CART");
    },
    async fetchOrders({ commit }) {
      try {
        const response = await axios.get("http://localhost:3000/Orders");
        commit("SET_ORDERS", response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    async placeOrder({ commit }, order) {
      try {
        // Generate a new order ID as a string
        const newOrderId = String(Date.now());
        const newOrder = { ...order, id: newOrderId };

        const response = await axios.post(
          "http://localhost:3000/Orders",
          newOrder
        );
        commit("ADD_ORDER", response.data);
      } catch (error) {
        console.error("Error placing order:", error);
      }
    },
    async fetchProducts({ commit }) {
      try {
        const response = await axios.get("http://localhost:3000/DataProduk");
        console.log("Fetched products:", response.data);
        commit("SET_PRODUCTS", response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    },
    async deleteOrder({ commit }, orderId) {
      try {
        console.log(`Deleting order with ID: ${orderId}`);
        await axios.delete(`http://localhost:3000/Orders/${orderId}`);
        commit("REMOVE_ORDER", orderId);
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    },
    async acceptOrder({ commit, state }, order) {
      try {
        console.log("Accepting order:", order);
        console.log("Current products state:", state.products);

        // Step 1: Check stock for each item in the order
        for (const item of order.items) {
          console.log("Processing item:", item);
          const product = state.products.find((p) => p.id === item.id);
          console.log("Found product:", product);
          if (!product) {
            console.error(`Product ${item.name} not found`);
            throw new Error(`Product ${item.name} not found`);
          }

          const productStock = Number(product.Stok);
          console.log(
            `Checking stock for ${item.name}: required ${item.quantity}, available ${productStock}`
          );

          if (productStock < item.quantity) {
            console.error(`Insufficient stock for product ${item.name}`);
            throw new Error(`Insufficient stock for product ${item.name}`);
          }
        }

        // Step 2: Update stock for each item in the order
        for (const item of order.items) {
          const product = state.products.find((p) => p.id === item.id);
          const updatedStock = Number(product.Stok) - item.quantity;

          const updatedProduct = {
            ...product,
            Stok: updatedStock,
          };

          await axios.put(
            `http://localhost:3000/DataProduk/${product.id}`,
            updatedProduct
          );

          console.log(
            `Updated stock for ${item.name}: new stock ${updatedStock}`
          );

          commit("UPDATE_PRODUCT_STOCK", {
            productId: product.id,
            quantity: item.quantity,
          });
        }

        // Step 3: Remove the order from the state
        await axios.delete(`http://localhost:3000/Orders/${order.id}`);
        commit("REMOVE_ORDER", order.id);
      } catch (error) {
        console.error("Error accepting order:", error.message);
        // Optionally handle the error (e.g., show a notification to the user)
      }
    },
  },
  getters: {
    cartItemCount: (state) => state.cart.length,
    cartTotalPrice: (state) =>
      state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
    orders: (state) => state.orders,
  },
});
