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
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions;
    },
    ADD_TRANSACTION(state, transaction) {
      state.transactions.push(transaction);
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

        await axios.delete(`http://localhost:3000/Orders/${order.id}`);
        commit("REMOVE_ORDER", order.id);

        const transaction = {
          id: Date.now().toString(),
          pedagang: order.items.map((item) => item.pedagang), // Assuming `pedagang` is a property of items
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
        };

        const transactionResponse = await axios.post(
          "http://localhost:3000/Transactions",
          transaction
        );
        commit("ADD_TRANSACTION", transactionResponse.data);
      } catch (error) {
        console.error("Error accepting order:", error);
        throw error;
      }
    },
    async saveTransaction({ commit }, transaction) {
      try {
        const response = await axios.post(
          "http://localhost:3000/Transactions",
          transaction
        );
        commit("ADD_TRANSACTION", response.data);
      } catch (error) {
        console.error("Error saving transaction:", error);
        throw error;
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
    async processTransaction({ commit, state }) {
      const pedagangData = await axios.get("http://localhost:3000/DataProduk");
      const orders = state.orders;
      const transactions = [];

      orders.forEach((order) => {
        order.items.forEach((item) => {
          const product = pedagangData.data.find((p) => p.id === item.id);
          if (product) {
            const pedagangTransaction = transactions.find(
              (t) => t.Pedagang === product.Pedagang
            );
            if (pedagangTransaction) {
              pedagangTransaction.items.push({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
              });
            } else {
              transactions.push({
                id: String(Date.now()),
                Pedagang: product.Pedagang,
                items: [
                  { id: item.id, name: item.name, quantity: item.quantity },
                ],
              });
            }
          }
        });
      });

      await axios.post("http://localhost:3000/Transactions", transactions);
      commit("SET_TRANSACTIONS", transactions);
    },
  },
  getters: {
    cartItemCount: (state) => state.cart.length,
    cartTotalPrice: (state) =>
      state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
    orders: (state) => state.orders,
  },
});
