<template>
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

          <!-- Only show individual checkout button if there are multiple pedagang groups -->
          <button 
            v-if="Object.keys(groupedCart).length > 1"
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
          {{ isProcessingCheckout ? 'Memproses...' : checkoutButtonText }}
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
    checkoutButtonText() {
      return Object.keys(this.groupedCart).length > 1 ? 'Checkout Semua' : 'Checkout';
    }
  },
  methods: {
    async fetchCart() {
      try {
        const identifier = this.user ? this.user.id : this.guestId;
        if (!identifier) {
          console.error("No user or guest ID available");
          this.cart = [];
          return;
        }

        // For guest users, prepend 'Guest_' to the ID
        const cartUser = this.user ? this.user.id : `Guest_${this.guestId}`;
        
        const response = await axios.get(`http://localhost:3004/cart`, {
          params: { user: cartUser }
        });

        // Always treat the response as an array
        const cartItems = Array.isArray(response.data) ? response.data : [];
        
        this.cart = cartItems.map(item => ({
          ...item,
          name: item.name || 'Unknown Product',
          price: item.price || 0,
          pedagang: item.pedagang || 'Unknown',
          stock: item.stock || 0
        }));

      } catch (error) {
        console.error("Error fetching cart:", error);
        // Set empty cart on error
        this.cart = [];
      }
    },

    async fetchUser() {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        if (userInfo) {
          // Verify user exists in database
          try {
            const response = await axios.get(`http://localhost:3001/user/${userInfo.id}`);
            this.user = response.data;
          } catch (error) {
            console.error("User not found in database:", error);
            localStorage.removeItem("user-info");
            this.user = null;
          }
        }
        
        if (!this.user) {
          this.guestId = localStorage.getItem("guestId") || `guest_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("guestId", this.guestId);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    },

    groupTotalPrice(group) {
      return group.reduce((total, item) => total + item.price * item.quantity, 0);
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
        await axios.put(`http://localhost:3004/cart/${item.id}`, { 
          quantity: item.quantity 
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error("Error updating quantity:", error);
        this.showWarning("Gagal memperbarui jumlah barang");
        // Revert to previous quantity
        const prevItem = this.cart.find(i => i.id === item.id);
        if (prevItem) {
          item.quantity = prevItem.quantity;
        }
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
        this.cart = this.cart.filter(item => item.id !== itemId);
        
        // If cart is empty, delete the cart entirely
        if (this.cart.length === 0) {
          const identifier = this.user ? this.user.Nama : this.guestId;
          await axios.delete(`http://localhost:3004/cart`, {
            params: { user: identifier }
          });
        }
      } catch (error) {
        console.error("Error removing item:", error);
        this.showWarning("Gagal menghapus item dari keranjang");
      }
    },

    async ensureCartExists() {
      const identifier = this.user ? this.user.id : this.guestId;
      try {
        const response = await axios.get(`http://localhost:3004/cart`, {
          params: { user: identifier }
        });
        return response.data && response.data.length > 0;
      } catch (error) {
        console.error("Error checking cart:", error);
        return false;
      }
    },

    async clearCart() {
      const identifier = this.user ? this.user.id : this.guestId;
      try {
        await axios.delete(`http://localhost:3004/cart`, {
          params: { user: identifier }
        });
        this.cart = [];
      } catch (error) {
        console.error("Error clearing cart:", error);
        this.showWarning("Gagal mengosongkan keranjang");
      }
    },

async generateInvoice(orderId) {
  if (!orderId) {
    throw new Error('Valid order ID is required for invoice generation');
  }

  try {
    console.log(`Starting invoice generation for order ${orderId}`);
    
    // First try to get order with included items
    let orderResponse;
    try {
      orderResponse = await axios.get(`http://localhost:3003/orders/${orderId}`, {
        params: { include_items: true }
      });
    } catch (error) {
      // If first attempt fails, try alternative endpoint
      if (error.response?.status === 404) {
        orderResponse = await axios.get(`http://localhost:3003/orders/by-orderid/${orderId}`);
      } else {
        throw error;
      }
    }

    const order = orderResponse.data;
    if (!order) {
      throw new Error(`Order data not found for ID ${orderId}`);
    }

    // Ensure order_items is an array
    if (!order.order_items) {
      const itemsResponse = await axios.get(
        `http://localhost:3003/order-items?order_id=${orderId}`
      );
      order.order_items = Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
    }

    if (order.order_items.length === 0) {
      throw new Error(`No items found for order ${orderId}`);
    }

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

    // Get PDF as base64 string
    const pdfOutput = doc.output('datauristring');
    const pdfBase64 = pdfOutput.split(',')[1];
    const filename = `invoice_${order.id}.pdf`;
    
    console.log(`Attempting to save invoice for order ${orderId}`);
    
    const saveResponse = await axios.post("http://localhost:3003/invoices", {
      order_id: order.id,
      filename,
      pdfData: pdfBase64 // Send as base64
    });
    
    if (!saveResponse.data || !saveResponse.data.invoice_url) {
      throw new Error('Failed to save invoice to server');
    }
    
    console.log(`Successfully generated and saved invoice for order ${orderId}`);
    
    return { 
      success: true, 
      orderId: order.id,
      invoiceUrl: saveResponse.data.invoice_url
    };
  } catch (error) {
    console.error(`Error generating invoice for order ${orderId}:`, error);
    throw { 
      orderId,
      error: {
        message: error.message,
        retry: true
      }
    };
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
  const cartUser = this.user ? this.user.id : this.guestId;

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
        user: cartUser,
        Alamat: this.user ? this.user.Alamat : this.pedagangAlamat[pedagang],
        pemesan: this.user ? this.user.Nama : this.pedagangPemesan[pedagang],
        catatan: this.pedagangNotes[pedagang],
        timestamp,
      });
    });

  try {
    // 1. Create order for this pedagang
    const createResponse = await axios.post("http://localhost:3003/orders", { 
      orders,
      clearCart: true
    });
    
    // Verify response structure
    if (!createResponse.data?.orders?.[0]?.id) {
      throw new Error('Invalid order creation response');
    }
    
    const createdOrderId = createResponse.data.orders[0].id;

    // 2. Update local cart immediately after successful order creation
    this.cart = this.cart.filter(item => item.pedagang !== pedagang);

    // 3. Generate invoice using the confirmed order ID
    const invoiceResult = await this.generateInvoice(createdOrderId);
    
    if (!invoiceResult.success) {
      throw invoiceResult.error;
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
    
    // Refresh cart data in case of error
    await this.fetchCart();
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
  const cartUser = this.user ? this.user.id : this.guestId;

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
        user: cartUser,
        Alamat: this.user ? this.user.Alamat : this.pedagangAlamat[pedagang],
        pemesan: this.user ? this.user.Nama : this.pedagangPemesan[pedagang],
        catatan: this.pedagangNotes[pedagang],
        timestamp,
      });
    });
  }

  try {
    // 1. Create all orders
    const createResponse = await axios.post("http://localhost:3003/orders", { 
      orders: allOrders,
      clearCart: true // Flag to indicate cart should be cleared
    });
    
    // Verify response contains valid order IDs
    const createdOrders = (createResponse.data?.orders || []).filter(o => o?.id);
    if (createdOrders.length === 0) {
      throw new Error('No valid orders were created');
    }

    // 2. Clear local cart immediately after successful order creation
    this.cart = [];
    
    // 3. Generate invoices for each unique order
    const invoiceResults = await Promise.allSettled(
      createdOrders.map(order => 
        this.generateInvoice(order.id)
          .then(result => {
            order.invoiceUrl = result.invoiceUrl;
            return result;
          })
          .catch(e => ({ success: false, orderId: order.id, error: e }))
     )
        );

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
      this.showWarning("Pesanan berhasil dibuat tetapi beberapa invoice gagal digenerate. Silakan coba generate ulang.");
    } else {
      alert("Checkout berhasil! Invoice telah dibuat.");
      this.$router.push({ name: "Orders" });
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
    
    // Refresh cart data in case of error
    await this.fetchCart();
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

  // Check if we're coming back from a successful checkout
  const fromCheckout = this.$route.query.fromCheckout;
  if (fromCheckout) {
    // Force refresh cart data
    await this.clearCart();
  } else {
    await this.fetchCart();
  }

  // Add this to handle cases where cart might be stale
  const cartExists = await this.ensureCartExists();
  if (!cartExists && this.cart.length > 0) {
    this.cart = [];
  }
},

};
</script>

<style scoped>
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