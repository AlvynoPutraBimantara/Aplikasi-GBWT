import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    cart: [],
    orders: [],
    products: [],
    transactions: [],
  },
  mutations: {
    // existing mutations...

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
    INCREASE_PRODUCT_STOCK(state, { productId, quantity }) {
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        product.Stok += quantity;
      }
    },
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions;
    },
    ADD_TRANSACTION(state, transaction) {
      state.transactions.push(transaction);
    },
    REMOVE_TRANSACTION(state, transactionId) {
      state.transactions = state.transactions.filter(
        (transaction) => transaction.id !== transactionId
      );
    },
    UPDATE_PRODUCT(state, updatedProduct) {
      const index = state.products.findIndex(
        (product) => product.id === updatedProduct.id
      );
      if (index !== -1) {
        state.products.splice(index, 1, updatedProduct);
      }
    },
  },
  actions: {
    // existing actions...

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
    async clearCartOnServer() {
      try {
        const response = await axios.get("http://localhost:3000/Cart");
        const cartItems = response.data;
        for (const item of cartItems) {
          await axios.delete(`http://localhost:3000/Cart/${item.id}`);
        }
      } catch (error) {
        console.error("Error clearing cart on server:", error);
      }
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
        const response = await axios.post(
          "http://localhost:3000/Orders",
          order
        );
        commit("ADD_ORDER", response.data);
      } catch (error) {
        console.error("Error placing order:", error);
      }
    },
    async deleteOrder({ commit }, orderId) {
      try {
        await axios.delete(`http://localhost:3000/Orders/${orderId}`);
        commit("REMOVE_ORDER", orderId);
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    },
    async acceptOrder({ commit, state }, order) {
      try {
        for (const item of order.items) {
          const product = state.products.find((p) => p.id === item.id);
          if (product && product.Stok >= item.quantity) {
            await axios.patch(`http://localhost:3000/DataProduk/${item.id}`, {
              Stok: product.Stok - item.quantity,
            });
            commit("UPDATE_PRODUCT_STOCK", {
              productId: item.id,
              quantity: item.quantity,
            });
          } else {
            throw new Error(`Insufficient stock for product ID ${item.id}`);
          }
        }

        const transaction = {
          id: `"${Date.now()}"`,
          orderId: `"${order.id}"`,
          items: order.items,
          total: order.total,
          timestamp: new Date().toISOString(),
        };
        await axios.post("http://localhost:3000/Transactions", transaction);
        commit("ADD_TRANSACTION", transaction);

        // Delete the order
        await axios.delete(`http://localhost:3000/Orders/${order.id}`);
        commit("REMOVE_ORDER", order.id);
      } catch (error) {
        console.error("Error accepting order:", error);
        throw error;
      }
    },
    async fetchProducts({ commit }) {
      try {
        const response = await axios.get("http://localhost:3000/DataProduk");
        commit("SET_PRODUCTS", response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    },
    async fetchTransactions({ commit }) {
      try {
        const response = await axios.get("http://localhost:3000/Transactions");
        commit("SET_TRANSACTIONS", response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    },
    async deleteTransactionAction({ commit }, transactionId) {
      try {
        await axios.delete(
          `http://localhost:3000/Transactions/${transactionId}`
        );
        commit("REMOVE_TRANSACTION", transactionId);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    },
    async refundTransaction({ commit, state }, transaction) {
      try {
        // Loop through the transaction items and update the stock
        for (const item of transaction.items) {
          const product = state.products.find((p) => p.id === item.id);
          if (product) {
            await axios.patch(`http://localhost:3000/DataProduk/${item.id}`, {
              Stok: product.Stok + item.quantity,
            });
            commit("INCREASE_PRODUCT_STOCK", {
              productId: item.id,
              quantity: item.quantity,
            });
          }
        }

        await axios.delete(
          `http://localhost:3000/Transactions/${transaction.id}`
        );
        commit("REMOVE_TRANSACTION", transaction.id);
      } catch (error) {
        console.error("Error refunding transaction:", error);
        throw error;
      }
    },
  },
  getters: {
    cartTotalPrice: (state) => {
      return state.cart.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    },
  },
});
