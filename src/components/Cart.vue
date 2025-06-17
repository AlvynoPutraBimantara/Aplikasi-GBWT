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
                <button @click="removeFromCart(item.id)" class="delete-btn">
                  <font-awesome-icon :icon="['fas', 'trash-can']" />
                </button>
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
         <div v-if="isGuestUser" class="guest-inputs">
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
    return {
      cart: [],
      user: null,
      guestId: null,
      warningMessage: "",
      isProcessingCheckout: false,
      invoiceError: null,
      pedagangNotes: reactive({}),
      pedagangPemesan: reactive({}),
      pedagangAlamat: reactive({}),
      baseUrl: process.env.VUE_APP_API_BASE_URL || "http://192.168.100.8:3000",
      ordersServiceUrl: process.env.VUE_APP_ORDERS_SERVICE_URL || 'http://192.168.100.8:3003'
    };
  },
  computed: {
    isGuestUser() {
      return !this.user || (this.user && this.user.role === 'guest');
    },
    filteredCart() {
      return this.cart;
    },
    groupedCart() {
      return this.cart.reduce((groups, item) => {
        const pedagang = item.pedagang;
        if (!groups[pedagang]) {
          groups[pedagang] = [];
          
          // Initialize input values reactively
          if (!(pedagang in this.pedagangNotes)) {
            this.pedagangNotes[pedagang] = "";
          }
          if (!(pedagang in this.pedagangPemesan)) {
            this.pedagangPemesan[pedagang] = "";
          }
          if (!(pedagang in this.pedagangAlamat)) {
            this.pedagangAlamat[pedagang] = "";
          }
        }
        groups[pedagang].push(item);
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
    async fetchUser() {
      try {
        const userInfo = JSON.parse(localStorage.getItem("user-info"));
        if (userInfo && userInfo.id) {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
              `${this.baseUrl}/user/${userInfo.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                timeout: 30000
              }
            );
            this.user = response.data;
          } catch (error) {
            console.log("User not found or error fetching user, proceeding as guest", error);
            this.user = null;
          }
        }
        
        // Generate guest ID if no user
        if (!this.user) {
          this.guestId = localStorage.getItem("guestId") || 
            `guest_${Math.random().toString(36).substr(2, 8)}`;
          localStorage.setItem("guestId", this.guestId);
        }
      } catch (error) {
        console.error("Error in fetchUser:", error);
        this.user = null;
        this.guestId = localStorage.getItem("guestId") || 
          `guest_${Math.random().toString(36).substr(2, 8)}`;
        localStorage.setItem("guestId", this.guestId);
      }
    },

    async fetchCart() {
      try {
        const identifier = this.user ? this.user.id : this.guestId;
        if (!identifier) {
          console.error("No user or guest ID available");
          this.cart = [];
          return;
        }

        // Normalize guest ID format for backend
        const normalizedId = identifier.startsWith('guest_') 
          ? `Guest_${identifier.substring(6)}` 
          : identifier;

        // Add authentication for logged-in users
        const config = {
          params: { user: normalizedId },
          timeout: 30000
        };

        if (this.user) {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers = {
              'Authorization': `Bearer ${token}`
            };
          }
        }

        // Use the correct cart service URL from environment
        const cartServiceUrl = process.env.VUE_APP_CART_SERVICE_URL || 'http://192.168.100.8:3004';
        const response = await axios.get(
          `${cartServiceUrl}/cart`,
          config
        );

        // Transform response data
        this.cart = Array.isArray(response.data) 
          ? response.data.map(item => ({
              id: item.id,
              cart_id: item.cart_id,
              itemid: item.itemid,
              name: item.name,
              price: parseFloat(item.price),
              quantity: parseInt(item.quantity),
              pedagang: item.pedagang,
              stock: item.stock || 0
            }))
          : [];
        
        // Initialize inputs
        this.cart.forEach(item => {
          const pedagang = item.pedagang;
          if (!this.pedagangNotes[pedagang]) {
            this.pedagangNotes[pedagang] = '';
          }
          if (!this.pedagangPemesan[pedagang]) {
            this.pedagangPemesan[pedagang] = '';
          }
          if (!this.pedagangAlamat[pedagang]) {
            this.pedagangAlamat[pedagang] = '';
          }
        });

      } catch (error) {
        console.error("Error fetching cart:", error);
        if (error.response && error.response.status === 404) {
          // Empty cart is normal for new users
          this.cart = [];
        } else {
          this.showWarning("Gagal memuat keranjang. Silakan coba lagi.");
          this.cart = [];
        }
      }
    },

    async ensureCartExists() {
      const identifier = this.user ? this.user.id : this.guestId;
      if (!identifier) return false;
      
      try {
        const normalizedId = identifier.startsWith('guest_') 
          ? `Guest_${identifier.substring(6)}` 
          : identifier;

        const config = {
          params: { user: normalizedId },
          timeout: 30000
        };

        if (this.user) {
          const token = localStorage.getItem('token');
          config.headers = {
            'Authorization': `Bearer ${token}`
          };
        }

        const response = await axios.get(`${process.env.VUE_APP_CART_SERVICE_URL || 'http://192.168.100.8:3004'}/cart`, config);
        return Array.isArray(response.data) && response.data.length > 0;
      } catch (error) {
        console.error("Error checking cart:", error);
        return false;
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
        const config = {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        };

        if (this.user) {
          const token = localStorage.getItem('token');
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        await axios.put(
          `${process.env.VUE_APP_CART_SERVICE_URL || 'http://192.168.100.8:3004'}/cart/${item.id}`, 
          { quantity: item.quantity },
          config
        );
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
        const config = {
          timeout: 30000
        };
        if (this.user) {
          const token = localStorage.getItem('token');
          config.headers = {
            'Authorization': `Bearer ${token}`
          };
        }

        await axios.delete(
          `${process.env.VUE_APP_CART_SERVICE_URL || 'http://192.168.100.8:3004'}/cart/${itemId}`,
          config
        );
        this.cart = this.cart.filter(item => item.id !== itemId);
        
        // If cart is empty, delete the cart entirely
        if (this.cart.length === 0) {
          const identifier = this.user ? this.user.id : this.guestId;
          const normalizedId = identifier.startsWith('guest_') 
            ? `Guest_${identifier.substring(6)}` 
            : identifier;
            
          await axios.delete(`${process.env.VUE_APP_CART_SERVICE_URL || 'http://192.168.100.8:3004'}/cart`, {
            params: { user: normalizedId },
            ...config
          });
        }
      } catch (error) {
        console.error("Error removing item:", error);
        this.showWarning("Gagal menghapus item dari keranjang");
      }
    },

    async clearCart() {
      const identifier = this.user ? this.user.id : this.guestId;
      try {
        const normalizedId = identifier.startsWith('guest_') 
          ? `Guest_${identifier.substring(6)}` 
          : identifier;

        const config = {
          params: { user: normalizedId },
          timeout: 30000
        };

        if (this.user) {
          const token = localStorage.getItem('token');
          config.headers = {
            'Authorization': `Bearer ${token}`
          };
        }

        await axios.delete(
          `${process.env.VUE_APP_CART_SERVICE_URL || 'http://192.168.100.8:3004'}/cart`,
          config
        );
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
      const config = {
        timeout: 30000
      };
      if (this.user) {
        const token = localStorage.getItem('token');
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      orderResponse = await axios.get(
        `${this.ordersServiceUrl}/orders/${orderId}`,
        {
          params: { include_items: true },
          ...config
        }
      );
    } catch (error) {
      // If first attempt fails, try alternative endpoint
      if (error.response?.status === 404) {
        const config = {
          timeout: 30000
        };
        if (this.user) {
          const token = localStorage.getItem('token');
          config.headers = {
            'Authorization': `Bearer ${token}`
          };
        }
        orderResponse = await axios.get(
          `${this.ordersServiceUrl}/orders/by-orderid/${orderId}`,
          config
        );
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
      const config = {
        timeout: 30000
      };
      if (this.user) {
        const token = localStorage.getItem('token');
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      const itemsResponse = await axios.get(
        `${this.ordersServiceUrl}/order-items?order_id=${orderId}`,
        config
      );
      order.order_items = Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
    }

    // Add validation before PDF creation
    if (!order || !order.order_items || order.order_items.length === 0) {
      throw new Error('Invalid order data for invoice generation');
    }

    // Use a smaller page size (A5) for better mobile viewing
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [148, 210] // A5 size (half of A4)
    });

    doc.setProperties({
      title: `Invoice ${order.id}`,
      subject: 'Purchase Invoice',
      author: 'GBWT',
      keywords: 'invoice, purchase',
      creator: 'GBWT'
    });

    // Larger title and simpler design
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    const title = "STRUK PEMESANAN";
    doc.text(title, 105, 15, { align: 'center' });
    
    // Simple divider line
    doc.setDrawColor(100, 100, 100);
    doc.line(10, 20, 138, 20);

    // Larger text for order info
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Kode pemesanan: ${order.id}`, 10, 28);
    doc.setFont(undefined, 'normal');
    doc.text(`Tanggal: ${new Date(order.created_at).toLocaleDateString('id-ID')}`, 10, 33);
    doc.text(`Nama: ${order.pemesan}`, 10, 38);
    doc.text(`Alamat: ${order.alamat}`, 10, 43);
    
    // Simpler table headers with larger text
    const headers = [
      [
        { content: "No", styles: { halign: 'center', fontStyle: 'bold', fontSize: 10 } },
        { content: "Produk", styles: { halign: 'left', fontStyle: 'bold', fontSize: 10 } },
        { content: "Qty", styles: { halign: 'center', fontStyle: 'bold', fontSize: 10 } },
        { content: "Subtotal", styles: { halign: 'right', fontStyle: 'bold', fontSize: 10 } }
      ]
    ];
    
    // Simplified table data with larger text
    const data = order.order_items.map((item, index) => [
      { content: (index + 1).toString(), styles: { halign: 'center', fontSize: 10 } },
      { content: item.name, styles: { halign: 'left', fontSize: 10 } },
      { content: item.quantity.toString(), styles: { halign: 'center', fontSize: 10 } },
      { content: this.formatPrice(item.price * item.quantity), styles: { halign: 'right', fontSize: 10 } }
    ]);

    // Create the table with more compact spacing
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 50,
      margin: { left: 10, right: 10 },
      styles: {
        cellPadding: 2, // Reduced padding
        fontSize: 10,
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { cellWidth: 12 }, // Smaller number column
        1: { cellWidth: 'auto' }, // Auto width for product name
        2: { cellWidth: 15 }, // Quantity column
        3: { cellWidth: 35 } // Subtotal column
      },
      theme: 'grid', // Simple grid theme
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
          `Dicetak: ${jakartaTime}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Total section with larger, bolder text - modified to place "TOTAL PEMBAYARAN" on left
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL PEMBAYARAN:', 10, finalY); // Changed from 80 to 10 and removed right alignment
    doc.text(this.formatPrice(order.total), 138, finalY, { align: 'right' });

    // Notes section with larger text
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Catatan:', 10, finalY + 10);
    doc.setFont(undefined, 'normal');
    const splitNote = doc.splitTextToSize(order.catatan || '-', 128);
    doc.text(splitNote, 10, finalY + 15);

    // Get PDF as base64 string
    const pdfOutput = doc.output('datauristring');
    const pdfBase64 = pdfOutput.split(',')[1];
    const filename = `invoice_${order.id}.pdf`;
    
    console.log(`Attempting to save invoice for order ${orderId}`);
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    if (this.user) {
      const token = localStorage.getItem('token');
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const saveResponse = await axios.post(
      `${this.ordersServiceUrl}/invoices`, 
      {
        order_id: order.id,
        filename,
        pdfData: pdfBase64 // Send as base64
      },
      config
    );
    
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
    // Mark order as needing invoice retry
    await this.updateOrderStatus(orderId, 'invoice_failed');
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
      if (this.isGuestUser) {
        if (!this.pedagangPemesan[pedagang]?.trim()) {
          this.showWarning(`Harap isi nama pemesan untuk ${pedagang}`);
          return false;
        }
        if (!this.pedagangAlamat[pedagang]?.trim()) {
          this.showWarning(`Harap isi alamat pengiriman untuk ${pedagang}`);
          return false;
        }
        
        // Additional validation
        if (this.pedagangPemesan[pedagang].length < 3) {
          this.showWarning(`Nama pemesan terlalu pendek untuk ${pedagang}`);
          return false;
        }
        if (this.pedagangAlamat[pedagang].length < 3) {
          this.showWarning(`Alamat terlalu pendek untuk ${pedagang}`);
          return false;
        }
      }
      return true;
    },

async checkoutPedagang(pedagang) {
  await this.fetchCart();

  if (!this.validatePedagangInputs(pedagang)) {
    return;
  }

  this.isProcessingCheckout = true;
  this.invoiceError = null;

  const generateRandomId = () => Math.random().toString(36).substr(2, 8).toUpperCase();
  const orders = [];
  const orderId = generateRandomId();
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

  const pemesan = this.isGuestUser ? this.pedagangPemesan[pedagang] : this.user.Nama;
  const alamat = this.isGuestUser ? this.pedagangAlamat[pedagang] : this.user.Alamat;
  const user = this.user ? this.user.id : (this.guestId.startsWith('Guest_') ? this.guestId : `Guest_${this.guestId}`);

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
        user: user,
        alamat: alamat,
        pemesan: pemesan,
        catatan: this.pedagangNotes[pedagang],
        timestamp: timestamp
      });
    });

  try {
    console.log('Sending order data:', {
      orders: orders.map(o => ({
        pemesan: o.pemesan,
        alamat: o.alamat,
        orderid: o.orderid,
        itemid: o.itemid,
        quantity: o.quantity
      })),
      clearCart: false
    });

    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    if (this.user) {
      const token = localStorage.getItem('token');
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const createResponse = await axios.post(
      `${this.ordersServiceUrl}/orders`,
      {
        orders,
        clearCart: false
      },
      config
    );

    const createdOrderId = createResponse.data.orders[0].id;

    const invoiceResult = await this.generateInvoice(createdOrderId);

    await axios.put(
      `${this.ordersServiceUrl}/orders/${createdOrderId}`,
      { invoice_url: invoiceResult.invoiceUrl },
      config
    );

    const itemsToDelete = this.cart.filter(item => item.pedagang === pedagang);
    await Promise.all(
      itemsToDelete.map(item => {
        const deleteConfig = { timeout: 30000 };
        if (this.user) {
          const token = localStorage.getItem('token');
          deleteConfig.headers = {
            'Authorization': `Bearer ${token}`
          };
        }
        return axios.delete(
          `${process.env.VUE_APP_CART_SERVICE_URL || 'http://192.168.100.8:3004'}/cart/${item.id}`,
          deleteConfig
        );
      })
    );

    this.cart = this.cart.filter(item => item.pedagang !== pedagang);

    alert(`Checkout berhasil untuk ${pedagang}! Invoice telah dibuat.`);
  } catch (error) {
    console.error(`Error during checkout for ${pedagang}:`, error);

    let errorMessage = "Checkout gagal. Silakan coba lagi.";
    if (error.response) {
      if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.status === 400) {
        errorMessage = "Data pesanan tidak valid. Silakan periksa kembali.";
      } else if (error.response.status === 500) {
        errorMessage = "Server error. Silakan coba lagi nanti.";
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Checkout timed out. Please try again';
    } else if (!error.response) {
      errorMessage = "Checkout gagal. Silakan cek koneksi internet Anda dan coba lagi.";
    }

    this.showWarning(errorMessage);
    await this.fetchCart();
  } finally {
    this.isProcessingCheckout = false;
  }
},

async checkoutAll() {
  if (!this.user && !this.guestId) {
    this.showWarning("Anda harus login atau melanjutkan sebagai tamu.");
    return;
  }

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

  const cartUser = this.user ? this.user.id : (this.guestId.startsWith('Guest_') ? this.guestId : `Guest_${this.guestId}`);

  for (const pedagang in this.groupedCart) {
    orderIds[pedagang] = generateRandomId();
    const pemesan = this.isGuestUser ? this.pedagangPemesan[pedagang] : this.user.Nama;
    const alamat = this.isGuestUser ? this.pedagangAlamat[pedagang] : this.user.Alamat;

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
        alamat: alamat,
        pemesan: pemesan,
        catatan: this.pedagangNotes[pedagang],
        timestamp: timestamp,
      });
    });
  }

  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    if (this.user) {
      const token = localStorage.getItem('token');
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const createResponse = await axios.post(
      `${this.ordersServiceUrl}/orders`,
      {
        orders: allOrders,
        clearCart: true
      },
      config
    );

    const createdOrders = createResponse.data.orders;

    const invoiceResults = await Promise.allSettled(
      createdOrders.map(order =>
        this.generateInvoice(order.id)
      )
    );

    await Promise.all(
      createdOrders.map((order, index) => {
        if (invoiceResults[index].status === 'fulfilled') {
          return axios.put(
            `${this.ordersServiceUrl}/orders/${order.id}`,
            { invoice_url: invoiceResults[index].value.invoiceUrl },
            config
          );
        }
      })
    );

    this.cart = [];

    alert("Checkout berhasil! Invoice telah dibuat.");
    this.$router.push({ name: "Orders" });
  } catch (error) {
    console.error("Error during checkout:", error);

    let errorMessage = "Checkout gagal. Silakan coba lagi.";
    if (error.response) {
      if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.status === 400) {
        errorMessage = "Data pesanan tidak valid. Silakan periksa kembali.";
      } else if (error.response.status === 500) {
        errorMessage = "Server error. Silakan coba lagi nanti.";
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Checkout timed out. Please try again';
    } else if (!error.response) {
      errorMessage = "Checkout gagal. Silakan cek koneksi internet Anda dan coba lagi.";
    }

    this.showWarning(errorMessage);
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

    async updateOrderStatus(orderId, status) {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        };

        if (this.user) {
          const token = localStorage.getItem('token');
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        await axios.put(
          `${this.ordersServiceUrl}/orders/${orderId}/status`,
          { status },
          config
        );
      } catch (error) {
        console.error(`Error updating order ${orderId} status:`, error);
      }
    }
  },
  async mounted() {
    await this.fetchUser();
    
    // Only fetch cart if we have a valid user/guest ID
    if (this.user?.id || this.guestId) {
      await this.fetchCart();
    }

    // Check if we're coming back from checkout
    if (this.$route.query.fromCheckout) {
      await this.clearCart();
    }
  },
};
</script>



<style scoped>
/* Mobile-first styles */
.pedagang-group {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: lightblue;
}

.pedagang-group h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
  background-color: lightblue;
  font-size: 1rem;
}

.pedagang-inputs {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: lightblue;
}

.guest-inputs {
  margin-top: 0.5rem;
}

.checkout-btn {
  margin-top: 0.5rem;
  background-color: #4caf50;
  color: white;
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkout-btn:hover {
  background-color: #388e3c;
}

.combined-checkout {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
}

.checkout-all-btn {
  background-color: #2196f3;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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
  font-size: 0.75rem;
}

th,
td {
  border: 1px solid #ddd;
  padding: 3px;
}

/* Make the Product column wider */
td:first-child,
th:first-child {
  width: 40%; /* Adjust this percentage as needed */
  word-break: break-word;
}

/* Make other columns narrower */
td:not(:first-child),
th:not(:first-child) {
  width: 15%; /* Adjust this percentage as needed */
  text-align: center;
}

th {
  background-color: #f2f2f2;
  text-align: left;
}

.delete-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background-color: #cc0000;
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
  gap: 3px;
  justify-content: center;
}

.decrement-btn {
  width: 24px;
  height: 24px;
  border: 1px solid black;
  background-color: red;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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
  width: 24px;
  height: 24px;
  border: 1px solid black;
  background-color: green;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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
  width: 40px;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

button {
  padding: 6px 12px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

button:hover {
  background-color: darkblue;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #6c757d;
}

/* Desktop styles */
@media (min-width: 768px) {
  .pedagang-group {
    margin-bottom: 2rem;
    padding: 1rem;
  }

  .pedagang-group h3 {
    font-size: 1.25rem;
  }

  .pedagang-inputs {
    margin-top: 1rem;
    padding: 1rem;
  }

  .guest-inputs {
    margin-top: 1rem;
  }

  .checkout-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .combined-checkout {
    margin-top: 2rem;
    padding: 1rem;
  }

  .checkout-all-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    margin-top: 1rem;
  }

  table {
    font-size: 1rem;
  }

  th, td {
    padding: 8px;
  }

  /* Adjust desktop column widths if needed */
  td:first-child,
  th:first-child {
    width: 50%; /* Wider product column on desktop */
  }

  td:not(:first-child),
  th:not(:first-child) {
    width: auto; /* Let other columns adjust naturally on desktop */
    text-align: center;
  }

  .quantity-controls {
    gap: 5px;
  }

  .decrement-btn, .increment-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .quantity-input {
    width: 50px;
    padding: 6px;
  }

  .delete-btn {
    width: 32px;
    height: 32px;
  }

  button {
    padding: 8px 16px;
    font-size: 1rem;
  }
}
</style>