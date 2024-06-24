import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state: {
    cart: [],
    orders: [],
    products: [],
    transactions: [],
    riwayatTransaksi: [],
  },
  mutations: {
    SET_RIWAYAT_TRANSAKSI(state, transactions) {
      state.riwayatTransaksi = transactions;
    },
    REMOVE_TRANSACTION_HISTORY(state, transactionId) {
      state.riwayatTransaksi = state.riwayatTransaksi.filter(
        (transaction) => transaction.id !== transactionId
      );
    },

    ADD_RIWAYAT_TRANSAKSI(state, transaction) {
      state.riwayatTransaksi.push(transaction);
    },
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
    REMOVE_TRANSACTION(state, transactionId) {
      state.transactions = state.transactions.filter(
        (transaction) => transaction.id !== transactionId
      );
    },
    REMOVE_TRANSACTION_ITEM(state, { transactionId, itemId }) {
      const transaction = state.transactions.find(
        (t) => t.id === transactionId
      );
      if (transaction) {
        transaction.items = transaction.items.filter(
          (item) => item.id !== itemId
        );
      }
    },
    INCREASE_PRODUCT_STOCK(state, { productId, quantity }) {
      const product = state.products.find((p) => p.id === productId);
      if (product) {
        product.Stok += quantity;
      }
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
    async fetchCart({ commit }) {
      try {
        const user = JSON.parse(localStorage.getItem("user-info"));
        const response = await axios.get("http://localhost:3000/Cart");
        const cart = response.data
          .filter((item) =>
            user ? item.user === user.Nama : item.user === "Guest"
          )
          .map(async (item) => {
            const productResponse = await axios.get(
              `http://localhost:3000/DataProduk/${item.id}`
            );
            const product = productResponse.data;
            return {
              ...item,
              pedagang: product.Pedagang,
            };
          });
        commit("SET_CART", await Promise.all(cart));
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    },

    async addToCart({ commit }, { item, user }) {
      try {
        const productResponse = await axios.get(
          `http://localhost:3000/DataProduk/${item.id}`
        );
        const product = productResponse.data;

        const cartItem = {
          id: product.id,
          name: product.Nama,
          price: parseFloat(product.Harga),
          quantity: item.quantity,
          pedagang: product.Pedagang,
          user: user.Nama || "Guest",
        };

        const response = await axios.post(
          "http://localhost:3000/Cart",
          cartItem
        );
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
        const user = JSON.parse(localStorage.getItem("user-info"));
        const response = await axios.get("http://localhost:3000/Orders");

        // Ensure orders are fetched correctly even if user is null
        const orders = response.data.filter(
          (order) => !user || order.user === user?.Nama
        );
        commit("SET_ORDERS", orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },

    async placeOrder({ commit }, order) {
      try {
        await axios.post("http://localhost:3000/Orders", order);
        commit("ADD_ORDER", order);
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
        const user = JSON.parse(localStorage.getItem("user-info"));

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

        const itemsGroupedByPedagang = order.items.reduce((acc, item) => {
          const product = state.products.find((p) => p.id === item.id);
          const pedagang = product ? product.Pedagang : "Unknown";
          if (!acc[pedagang]) {
            acc[pedagang] = [];
          }
          acc[pedagang].push({ ...item, pedagang });
          return acc;
        }, {});

        for (const [pedagang, items] of Object.entries(
          itemsGroupedByPedagang
        )) {
          const total = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const transaction = {
            id: `${Date.now()}-${pedagang}`,
            orderId: `${order.id}`,
            items,
            total,
            user: order.user || user.Nama,
            timestamp: new Date(),
            address: order.address,
            catatan: order.catatan,
          };

          await axios.post("http://localhost:3000/Transactions", transaction);
          commit("ADD_TRANSACTION", transaction);
        }

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
        const transactions = response.data;
        const productsResponse = await axios.get(
          "http://localhost:3000/DataProduk"
        );
        const products = productsResponse.data;

        const transactionsWithPedagang = transactions.map((transaction) => {
          const itemsWithPedagang = transaction.items.map((item) => {
            const product = products.find((p) => p.id === item.id);
            return {
              ...item,
              pedagang: product ? product.Pedagang : null,
            };
          });

          return {
            ...transaction,
            items: itemsWithPedagang,
          };
        });

        commit("SET_TRANSACTIONS", transactionsWithPedagang);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    },

    async deleteTransactionAction(
      { commit, state },
      { transactionId, description }
    ) {
      try {
        const transaction = state.transactions.find(
          (t) => t.id === transactionId
        );
        if (transaction) {
          transaction.description = description; // Add the description to the transaction
          await axios.post(
            "http://localhost:3000/RiwayatTransaksi",
            transaction
          );
          commit("ADD_RIWAYAT_TRANSAKSI", transaction);
        }
        await axios.delete(
          `http://localhost:3000/Transactions/${transactionId}`
        );
        commit("REMOVE_TRANSACTION", transactionId);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    },

    async deleteTransactionsAction(
      { commit, state },
      { transactionId, descriptions }
    ) {
      try {
        const transaction = state.transactions.find(
          (t) => t.id === transactionId
        );
        if (transaction) {
          transaction.descriptions = descriptions; // Add the description to the transaction
          await axios.post(
            "http://localhost:3000/RiwayatTransaksi",
            transaction
          );
          commit("ADD_RIWAYAT_TRANSAKSI", transaction);
        }
        await axios.delete(
          `http://localhost:3000/Transactions/${transactionId}`
        );
        commit("REMOVE_TRANSACTION", transactionId);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    },
    async deleteTransactionItemAction(
      { commit, dispatch },
      { transactionId, itemId }
    ) {
      try {
        const transaction = (
          await axios.get(`http://localhost:3000/Transactions/${transactionId}`)
        ).data;
        transaction.items = transaction.items.filter(
          (item) => item.id !== itemId
        );

        if (transaction.items.length === 0) {
          await dispatch("deleteTransactionAction", transactionId);
        } else {
          await axios.put(
            `http://localhost:3000/Transactions/${transactionId}`,
            transaction
          );
          commit("REMOVE_TRANSACTION_ITEM", { transactionId, itemId });
        }
      } catch (error) {
        console.error("Error deleting transaction item:", error);
      }
    },

    async refundTransaction({ commit, state }, { transaction, description }) {
      try {
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

        transaction.description = description; // Add the description to the transaction
        await axios.post("http://localhost:3000/RiwayatTransaksi", transaction);
        commit("ADD_RIWAYAT_TRANSAKSI", transaction);

        await axios.delete(
          `http://localhost:3000/Transactions/${transaction.id}`
        );
        commit("REMOVE_TRANSACTION", transaction.id);
      } catch (error) {
        console.error("Error refunding transaction:", error);
        throw error;
      }
    },
    async refundTransactionItemAction(
      { commit, state },
      { transaction, item }
    ) {
      try {
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

        transaction.items = transaction.items.filter((i) => i.id !== item.id);
        await axios.put(
          `http://localhost:3000/Transactions/${transaction.id}`,
          transaction
        );
        commit("REMOVE_TRANSACTION_ITEM", {
          transactionId: transaction.id,
          itemId: item.id,
        });
      } catch (error) {
        console.error("Error refunding transaction item:", error);
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
