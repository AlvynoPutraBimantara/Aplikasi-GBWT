<template>
  <!-- Template remains exactly the same -->
  <div>
    <h2>Keranjang Belanja</h2>
    <div v-if="filteredCart.length">
      <!-- Group cart items by pedagang -->
      <div v-for="(group, pedagang) in groupedCart" :key="pedagang" class="pedagang-group">
        <h3>{{ pedagang }}</h3>
        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th>Harga</th>
              <th>Jumlah</th>
              <th>Subtotal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in group" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ formatPrice(item.price) }}</td>
              <td>
                <div class="quantity-controls">
                  <button 
                    @click="decrementItemQuantity(item)" 
                    :disabled="item.quantity <= 1" 
                    class="decrement-btn"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    v-model.number="item.quantity"
                    @blur="updateQuantity(item)"
                    @input="validateQuantity(item)"
                    :min="1"
                    :max="item.stock"
                    class="quantity-input"
                  />
                  <button 
                    @click="incrementItemQuantity(item)" 
                    :disabled="item.quantity >= item.stock" 
                    class="increment-btn"
                  >
                    +
                  </button>
                </div>
              </td>
              <td>{{ formatPrice(item.price * item.quantity) }}</td>
              <td>
                <button @click="removeFromCart(item.id)">Hapus</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right">Total {{ pedagang }}:</td>
              <td>{{ formatPrice(groupTotalPrice(group)) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <!-- Input component for each pedagang group -->
        <div class="pedagang-inputs">
          <div>
            <label :for="`catatan-${pedagang}`">Catatan untuk {{ pedagang }}:</label>
            <textarea 
              :id="`catatan-${pedagang}`" 
              v-model="pedagangNotes[pedagang]"
              :placeholder="`Masukkan catatan`"
            ></textarea>
          </div>

          <!-- Guest-specific inputs (only shown for non-logged in users) -->
          <div v-if="!user" class="guest-inputs">
            <div>
              <label :for="`pemesan-${pedagang}`">Nama Pemesan:</label>
              <input 
                type="text" 
                :id="`pemesan-${pedagang}`" 
                v-model="pedagangPemesan[pedagang]" 
                required
                :placeholder="`Masukkan nama Anda`"
              >
            </div>
            <div>
              <label :for="`alamat-${pedagang}`">Alamat Pengiriman:</label>
              <textarea 
                :id="`alamat-${pedagang}`" 
                v-model="pedagangAlamat[pedagang]" 
                required
                :placeholder="`Masukkan alamat`"
              ></textarea>
            </div>
          </div>

          <button 
            @click="checkoutPedagang(pedagang)" 
            :disabled="isProcessingCheckout"
            class="checkout-btn"
          >
            {{ isProcessingCheckout ? 'Memproses...' : `Checkout ${pedagang}` }}
          </button>
        </div>
      </div>

      <!-- Display Warning Message -->
      <p v-if="warningMessage" class="warning">{{ warningMessage }}</p>

      <!-- Combined checkout button -->
      <div class="combined-checkout">
        <p>Total Semua Pesanan: {{ formatPrice(cartTotalPrice) }}</p>
        <button 
          @click="checkoutAll" 
          :disabled="isProcessingCheckout"
          class="checkout-all-btn"
        >
          {{ isProcessingCheckout ? 'Memproses...' : 'Checkout Semua' }}
        </button>
      </div>
      
      <!-- Invoice generation error message -->
      <div v-if="invoiceError" class="invoice-error">
        <p class="error-title">Gagal membuat invoice untuk beberapa pesanan:</p>
        <ul>
          <li v-for="(error, orderId) in invoiceError" :key="orderId">
            Pesanan {{ orderId }}: {{ error.message }}
            <span v-if="error.retry">
              <button @click="retryGenerateInvoice(orderId)">Coba Lagi</button>
            </span>
          </li>
        </ul>
        <p v-if="invoiceError && Object.keys(invoiceError).length > 0" class="error-note">
          Catatan: Pesanan Anda telah berhasil dibuat, tetapi terjadi masalah saat membuat invoice.
          Anda masih dapat melihat pesanan Anda di halaman Pesanan.
        </p>
      </div>
    </div>
    <div v-else>
      <p>Keranjang Kosong</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { reactive } from 'vue';

export default {
  data() {
    const state = reactive({
      pedagangNotes: {},
      pedagangPemesan: {},
      pedagangAlamat: {},
    });

    return {
      cart: [],
      user: null,
      guestId: null,
      warningMessage: "",
      isProcessingCheckout: false,
      invoiceError: null,
      ...state,
    };
  },
  computed: {
    filteredCart() {
      return this.cart;
    },
    groupedCart() {
      // Group items by pedagang
      return this.cart.reduce((groups, item) => {
        if (!groups[item.pedagang]) {
          groups[item.pedagang] = [];
          // Initialize input values for this pedagang
          this.pedagangNotes[item.pedagang] = "";
          this.pedagangPemesan[item.pedagang] = "";
          this.pedagangAlamat[item.pedagang] = "";
        }
        groups[item.pedagang].push(item);
        return groups;
      }, {});
    },
    cartTotalPrice() {
      return this.cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },
  methods: {
    // All methods remain exactly the same
    groupTotalPrice(group) {
      return group.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    async fetchUser() {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        if (userInfo) {
          const userId = userInfo.id;
          const response = await axios.get(`http://localhost:3001/user/${userId}`);
          this.user = response.data;
        } else {
          this.guestId = localStorage.getItem("guestId") || `guest-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("guestId", this.guestId);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    },
    async fetchCart() {
      try {
        const identifier = this.user ? this.user.Nama : this.guestId;
        const response = await axios.get(`http://localhost:3004/cart?user=${identifier}`);
        const cartItems = response.data;

        const promises = cartItems.map(async (item) => {
          try {
            const productResponse = await axios.get(
              `http://localhost:3002/products/${item.itemid}`
            );
            const productData = productResponse.data;

            return {
              ...item,
              name: item.name,
              stock: productData.Stok,
              pedagang: item.pedagang,
            };
          } catch (error) {
            console.error(`Error fetching product data for itemid ${item.itemid}:`, error);
            return { 
              ...item,
              stock: 0,
              name: item.name,
              price: item.price,
              pedagang: item.pedagang
            };
          }
        });

        this.cart = await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    },
    validateQuantity(item) {
      if (item.quantity < 1 || isNaN(item.quantity)) {
        item.quantity = 1;
      } else if (item.quantity > item.stock) {
        item.quantity = item.stock;
        this.showWarning("Maksimal jumlah produk dalam stok tercapai!");
      }
    },
    async updateQuantity(item) {
      this.validateQuantity(item);
      try {
        await axios.put(`http://localhost:3004/cart/${item.id}`, { quantity: item.quantity });
        console.log("Cart item quantity updated successfully.");
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
      }
    },
    incrementItemQuantity(item) {
      if (item.quantity < item.stock) {
        item.quantity++;
        this.updateQuantity(item);
      }
    },
    decrementItemQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
        this.updateQuantity(item);
      }
    },
    async removeFromCart(itemId) {
      try {
        await axios.delete(`http://localhost:3004/cart/${itemId}`);
        
        const identifier = this.user ? this.user.Nama : this.guestId;
        const response = await axios.get(`http://localhost:3004/cart?user=${identifier}`);
        
        if (response.data.length === 0) {
          await axios.delete(`http://localhost:3004/cart?user=${identifier}`);
        }
        
        this.cart = this.cart.filter((item) => item.id !== itemId);
      } catch (error) {
        console.error("Error removing item from cart:", error);
      }
    },
    async generateInvoice(orderId) {
      try {
        console.log(`Starting invoice generation for order ${orderId}`);
        
        let order;
        try {
          const response = await axios.get(`http://localhost:3003/orders/${orderId}`, {
            params: {
              include_items: true
            }
          });
          order = response.data;
        } catch (firstError) {
          if (firstError.response?.status === 404) {
            try {
              const fallbackResponse = await axios.get(
                `http://localhost:3003/orders/by-orderid/${orderId}`
              );
              order = fallbackResponse.data;
            } catch (fallbackError) {
              throw new Error(`Order ${orderId} not found in either ID field`);
            }
          } else {
            throw firstError;
          }
        }

        if (!order) {
          throw new Error(`Order data not found for ID ${orderId}`);
        }

        if (!order.order_items) {
          const itemsResponse = await axios.get(
            `http://localhost:3003/order-items?order_id=${order.id}`
          );
          order.order_items = Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
        } else if (!Array.isArray(order.order_items)) {
          order.order_items = [order.order_items];
        }

        if (order.order_items.length === 0) {
          throw new Error(`No items found for order ${orderId}`);
        }

        console.log(`Fetched order data with ${order.order_items.length} items`, order);

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        doc.setProperties({
          title: `Invoice ${order.id}`,
          subject: 'Purchase Invoice',
          author: 'GBWT',
          keywords: 'invoice, purchase',
          creator: 'GBWT'
        });

        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        const title = "STRUK PEMESANAN";
        doc.text(title, 105, 20, { align: 'center' });
        
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 25, 195, 25);

        doc.setFontSize(10);
        doc.text(`Kode pemesanan: ${order.id}`, 15, 35);
        doc.text(`Tanggal: ${new Date(order.created_at).toLocaleDateString('id-ID')}`, 15, 40);
        doc.text(`Nama Pelanggan: ${order.pemesan}`, 15, 45);
        doc.text(`Alamat: ${order.alamat}`, 15, 50);
        
        const headers = [
          [
            { content: "No", styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255 } },
            { content: "Nama Produk", styles: { halign: 'left', fillColor: [41, 128, 185], textColor: 255 } },
            { content: "Harga", styles: { halign: 'right', fillColor: [41, 128, 185], textColor: 255 } },
            { content: "Qty", styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255 } },
            { content: "Subtotal", styles: { halign: 'right', fillColor: [41, 128, 185], textColor: 255 } }
          ]
        ];
        
        const data = order.order_items.map((item, index) => [
          { content: (index + 1).toString(), styles: { halign: 'center' } },
          { content: item.name, styles: { halign: 'left' } },
          { content: this.formatPrice(item.price), styles: { halign: 'right' } },
          { content: item.quantity.toString(), styles: { halign: 'center' } },
          { content: this.formatPrice(item.price * item.quantity), styles: { halign: 'right' } }
        ]);

        autoTable(doc, {
          head: headers,
          body: data,
          startY: 60,
          margin: { left: 15, right: 15 },
          styles: {
            cellPadding: 3,
            fontSize: 9,
            valign: 'middle'
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 80 },
            2: { cellWidth: 30 },
            3: { cellWidth: 15 },
            4: { cellWidth: 30 }
          },
          didDrawPage: (data) => {
            doc.setFontSize(8);
            doc.setTextColor(100);
            
            const options = {
              timeZone: 'Asia/Jakarta',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            };
            
            const jakartaTime = new Date().toLocaleString('id-ID', options);
            doc.text(
              `Dipesan pada - ${jakartaTime}`,
              data.settings.margin.left,
              doc.internal.pageSize.height - 10
            );
          }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        autoTable(doc, {
          body: [
            [
              { 
                content: 'Total Pembayaran:', 
                styles: { halign: 'right', fontStyle: 'bold' } 
              },
              { 
                content: this.formatPrice(order.total),
                styles: { halign: 'right', fontStyle: 'bold' } 
              }
            ]
          ],
          startY: finalY,
          margin: { left: 80, right: 15 },
          tableWidth: 110,
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 40 }
          },
          styles: {
            cellPadding: 3,
            fontSize: 12
          }
        });

        doc.setFontSize(8);
        doc.text('Catatan:', 15, finalY + 10);
        doc.text(order.catatan || '-', 15, finalY + 15);

        const pdfData = doc.output("datauristring").split(",")[1];
        const filename = `invoice_${order.id}.pdf`;
        
        console.log(`Attempting to save invoice for order ${orderId}`);
        
        const saveResponse = await axios.post("http://localhost:3003/invoices", {
          order_id: order.id,
          filename,
          pdfData
        });
        
        if (!saveResponse.data || !saveResponse.data.invoiceId) {
          throw new Error('Failed to save invoice to server');
        }
        
        console.log(`Successfully generated and saved invoice for order ${orderId}`);
        
        return { 
          success: true, 
          orderId: order.id,
          invoiceUrl: saveResponse.data.invoiceUrl
        };
      } catch (error) {
        console.error(`Error generating invoice for order ${orderId}:`, error);
        
        const errorInfo = {
          message: error.response 
            ? error.response.data?.error || error.response.statusText || 'Unknown server error'
            : error.message || 'Unknown error',
          retry: true
        };
        
        throw { orderId, error: errorInfo };
      }
    },
    async retryGenerateInvoice(orderId) {
      try {
        this.isProcessingCheckout = true;
        const result = await this.generateInvoice(orderId);
        
        if (this.invoiceError && this.invoiceError[orderId]) {
          delete this.invoiceError[orderId];
          if (Object.keys(this.invoiceError).length === 0) {
            this.invoiceError = null;
            alert("Invoice berhasil dibuat setelah percobaan ulang!");
          }
        }
        return result;
      } catch (error) {
        console.error(`Retry failed for order ${orderId}:`, error);
        this.showWarning(`Gagal membuat invoice untuk pesanan ${orderId} saat percobaan ulang`);
        throw error;
      } finally {
        this.isProcessingCheckout = false;
      }
    },
    validatePedagangInputs(pedagang) {
      if (!this.user) {
        if (!this.pedagangPemesan[pedagang]?.trim()) {
          alert(`Harap isi nama pemesan untuk ${pedagang}`);
          return false;
        }
        if (!this.pedagangAlamat[pedagang]?.trim()) {
          alert(`Harap isi alamat pengiriman untuk ${pedagang}`);
          return false;
        }
      }
      return true;
    },
    async checkoutPedagang(pedagang) {
      if (!this.validatePedagangInputs(pedagang)) {
        return;
      }

      this.isProcessingCheckout = true;
      this.invoiceError = null;

      const generateRandomId = () => Math.random().toString(36).substr(2, 8).toUpperCase();
      const orders = [];
      const orderId = generateRandomId();
      const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

      this.cart
        .filter(item => item.pedagang === pedagang)
        .forEach((item) => {
          orders.push({
            temporaryId: orderId,
            orderid: orderId,
            itemid: item.itemid,
            name: item.name,
            pedagang: item.pedagang,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            user: this.user ? this.user.Nama : this.guestId,
            Alamat: this.user ? this.user.Alamat : this.pedagangAlamat[pedagang],
            pemesan: this.user ? this.user.Nama : this.pedagangPemesan[pedagang],
            catatan: this.pedagangNotes[pedagang],
            timestamp,
          });
        });

      try {
        // 1. Create order for this pedagang
        const createResponse = await axios.post("http://localhost:3003/orders", { orders });
        const createdOrders = createResponse.data.orders || [];

        // 2. Remove these items from cart
        const itemIdsToRemove = this.cart
          .filter(item => item.pedagang === pedagang)
          .map(item => item.id);
        
        await Promise.all(
          itemIdsToRemove.map(id => axios.delete(`http://localhost:3004/cart/${id}`))
        );

        // 3. Update local cart
        this.cart = this.cart.filter(item => item.pedagang !== pedagang);

        // 4. Generate invoice for this order
        if (createdOrders.length > 0) {
          const invoiceResult = await this.generateInvoice(createdOrders[0].id);
          
          if (!invoiceResult.success) {
            throw invoiceResult.error;
          }
        }

        alert(`Checkout berhasil untuk ${pedagang}! Invoice telah dibuat.`);
      } catch (error) {
        console.error(`Error during checkout for ${pedagang}:`, error);
        
        if (error.response) {
          if (error.response.status === 400) {
            this.showWarning("Data pesanan tidak valid. Silakan periksa kembali.");
          } else if (error.response.status === 500) {
            this.showWarning("Server error. Silakan coba lagi nanti.");
          }
        } else {
          this.showWarning(`Checkout gagal untuk ${pedagang}. Silakan cek koneksi internet Anda dan coba lagi.`);
        }
      } finally {
        this.isProcessingCheckout = false;
      }
    },
    async checkoutAll() {
      if (!this.user && !this.guestId) {
        alert("Anda harus login atau melanjutkan sebagai tamu.");
        return;
      }

      // Validate all pedagang inputs
      for (const pedagang in this.groupedCart) {
        if (!this.validatePedagangInputs(pedagang)) {
          return;
        }
      }

      this.isProcessingCheckout = true;
      this.invoiceError = null;

      const generateRandomId = () => Math.random().toString(36).substr(2, 8).toUpperCase();
      const allOrders = [];
      const orderIds = {};
      const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Prepare orders for each pedagang
      for (const pedagang in this.groupedCart) {
        orderIds[pedagang] = generateRandomId();
        
        this.groupedCart[pedagang].forEach((item) => {
          allOrders.push({
            temporaryId: orderIds[pedagang],
            orderid: orderIds[pedagang],
            itemid: item.itemid,
            name: item.name,
            pedagang: item.pedagang,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            user: this.user ? this.user.Nama : this.guestId,
            Alamat: this.user ? this.user.Alamat : this.pedagangAlamat[pedagang],
            pemesan: this.user ? this.user.Nama : this.pedagangPemesan[pedagang],
            catatan: this.pedagangNotes[pedagang],
            timestamp,
          });
        });
      }

      try {
        // 1. Create all orders
        const createResponse = await axios.post("http://localhost:3003/orders", { orders: allOrders });
        const createdOrders = createResponse.data.orders || [];

        // 2. Clear cart
        await axios.delete(`http://localhost:3004/cart?user=${this.user ? this.user.Nama : this.guestId}`);

        // 3. Generate invoices for each unique order
        const invoiceResults = await Promise.allSettled(
          createdOrders.map(order => 
            this.generateInvoice(order.id)
              .then(result => {
                order.invoiceUrl = result.invoiceUrl;
                return result;
              })
              .catch(e => ({ success: false, orderId: order.id, error: e }))
        ));

        // Check for failed invoices
        const failedInvoices = invoiceResults
          .filter(result => 
            result.status === 'rejected' || 
            (result.status === 'fulfilled' && !result.value.success)
          )
          .reduce((acc, result) => {
            const error = result.status === 'rejected' ? result.reason : result.value.error;
            acc[error.orderId] = error.error;
            return acc;
          }, {});

        if (Object.keys(failedInvoices).length > 0) {
          this.invoiceError = failedInvoices;
          console.warn('Some invoices failed to generate:', failedInvoices);
        }
        
        // 4. Clear local cart and redirect if all invoices succeeded
        if (!this.invoiceError) {
          this.cart = [];
          alert("Checkout berhasil! Invoice telah dibuat.");
          this.$router.push({ name: "Orders" });
        } else {
          // Partial success - orders created but some invoices failed
          this.cart = [];
          this.showWarning("Pesanan berhasil dibuat tetapi beberapa invoice gagal digenerate. Silakan coba generate ulang.");
        }
      } catch (error) {
        console.error("Error during checkout:", error);
        
        if (error.response) {
          if (error.response.status === 400) {
            this.showWarning("Data pesanan tidak valid. Silakan periksa kembali.");
          } else if (error.response.status === 500) {
            this.showWarning("Server error. Silakan coba lagi nanti.");
          }
        } else {
          this.showWarning("Checkout gagal. Silakan cek koneksi internet Anda dan coba lagi.");
        }
      } finally {
        this.isProcessingCheckout = false;
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    showWarning(message) {
      this.warningMessage = message;
      setTimeout(() => {
        this.warningMessage = "";
      }, 3000);
    },
  },
  async mounted() {
    await this.fetchUser();
    await this.fetchCart();
  },
};
</script>

<style scoped>
/* All styles remain exactly the same */
.pedagang-group {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: lightblue;
}

.pedagang-group h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
  background-color: lightblue;
}

.pedagang-inputs {
  margin-top: 1rem;
  padding: 1rem;
  
  border-radius: 4px;
  background-color: lightblue;
}

.guest-inputs {
  margin-top: 1rem;
}

.checkout-btn {
  margin-top: 1rem;
  background-color: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.checkout-btn:hover {
  background-color: #388e3c;
}

.combined-checkout {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
}

.checkout-all-btn {
  background-color: #2196f3;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.checkout-all-btn:hover {
  background-color: #1976d2;
}

.text-right {
  text-align: right;
}

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

.warning {
  color: red;
  font-weight: bold;
  margin-top: 5px;
}

.invoice-error {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ff6b6b;
  border-radius: 4px;
  background-color: #fff5f5;
}

.error-title {
  font-weight: bold;
  color: #c92a2a;
  margin-bottom: 10px;
}

.error-note {
  margin-top: 10px;
  font-style: italic;
  color: #495057;
}

div {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
}

.decrement-btn {
  width: 32px;
  height: 32px;
  border: 1px solid black;
  background-color: red;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decrement-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.decrement-btn:not(:disabled):hover {
  background-color: #c82333;
  border-color: #c82333;
}

.increment-btn {
  width: 32px;
  height: 32px;
  border: 1px solid black;
  background-color: green;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.increment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.increment-btn:not(:disabled):hover {
  background-color: #218838;
  border-color: #218838;
}

.quantity-input {
  width: 50px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

button {
  padding: 8px 16px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: darkblue;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #6c757d;
}
</style>