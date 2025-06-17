<template>
  <div class="orders-container">
    <h2>STRUK</h2>
    <div v-if="filteredOrders.length">
      <div v-for="order in filteredOrders" :key="order.id" class="invoice-container">
        <div class="invoice-header">
          <div class="header-cell">Waktu Pesan :</div>
          <div class="time-cell">{{ formatDateTime(order.created_at) }}</div>
        </div>
        <div class="invoice-content">
          <div class="action-cell">
            <button class="accept-btn" @click="acceptOrder(order)">Pesan</button>
            <button class="save-img-btn" @click="saveInvoiceAsImage(order)">
              Unduh struk&nbsp;<font-awesome-icon :icon="['fas', 'file-arrow-down']" />
            </button>
            <button class="delete-btn" @click="deleteOrder(order.id)">Hapus</button>
          </div>
        </div>
        <div v-if="order.invoice_url" class="pdf-viewer-container">
          <div v-if="forcePDFJS || isMobile()" class="pdfjs-container" :ref="`pdf-container-${order.id}`"></div>
          <object v-else
            :data="getPdfUrl(order.invoice_url)"
            type="application/pdf"
            width="100%"
            :height="pdfViewerHeight"
            @error="activatePdfJsFallback(order)">
            <p>PDF tidak dapat ditampilkan. Silakan unduh melalui tombol "Unduh struk"</p>
          </object>
          
          <div v-if="pdfLoading" class="pdf-loading">
            Memuat invoice...
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Tidak ada pesanan</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment-timezone";

export default {
  data() {
    return {
      orders: [],
      userData: {},
      guestId: localStorage.getItem("guestId") || null,
      pdfLoading: false,
      isSavingImage: false,
      pdfJsFallbackOrders: new Set(),
      forcePDFJS: navigator.userAgent.match(/Windows NT 10/), // Force PDF.js for Windows 10
      pdfViewerHeight: '500px',
      isMobileView: false
    };
  },
  computed: {
    filteredOrders() {
      const user = JSON.parse(localStorage.getItem("user-info")) || { id: this.guestId };
      return this.orders.filter((order) => order.user === user.id);
    },
  },
  async mounted() {
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView);
    
    await this.fetchOrders();
    await this.fetchUserData();
    // Render all PDFs with PDF.js if forced or on mobile
    if (this.forcePDFJS || this.isMobileView) {
      this.orders.forEach(order => {
        if (order.invoice_url) {
          this.renderWithPdfJs(order);
        }
      });
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileView);
  },
  methods: {
    isMobile() {
      return this.isMobileView;
    },
    checkMobileView() {
      this.isMobileView = window.innerWidth <= 768;
      this.pdfViewerHeight = this.isMobileView ? '300px' : '500px';
    },
    async fetchOrders() {
      try {
        const user = JSON.parse(localStorage.getItem("user-info")) || { id: this.guestId };
        if (!user.id) {
          console.error("No user ID available");
          return;
        }
        
        const response = await axios.get(`${process.env.VUE_APP_ORDERS_SERVICE_URL}/orders?user=${user.id}`);
        this.orders = response.data;
      } catch (error) {
        console.error("Error fetching orders:", error);
        this.orders = [];
      }
    },
    async fetchUserData() {
      try {
        const response = await axios.get(`http://192.168.100.8:3001/users`);
        this.userData = response.data.reduce((acc, user) => {
          acc[user.Nama] = user.Alamat;
          return acc;
        }, {});
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    onPdfError() {
      this.pdfLoading = false;
      alert('Gagal memuat PDF. Silakan coba lagi atau hubungi administrator.');
    },
    activatePdfJsFallback(order) {
      this.pdfJsFallbackOrders.add(order.id);
      this.renderWithPdfJs(order);
    },
    async downloadPdf(order) {
      try {
        const response = await axios.get(
          this.getPdfUrl(order.invoice_url), 
          { responseType: 'blob' }
        );
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Gagal memuat invoice. Silakan coba lagi nanti.');
      }
    },
    getPdfUrl(invoiceUrl) {
      if (!invoiceUrl) return '';
      if (invoiceUrl.startsWith('http')) {
        return invoiceUrl;
      }
      const cleanUrl = invoiceUrl.replace(/^\//, '');
      const timestamp = new Date().getTime();
      return `${process.env.VUE_APP_ORDERS_SERVICE_URL}/${cleanUrl}?t=${timestamp}`;
    },
    async renderWithPdfJs(order) {
      try {
        this.pdfLoading = true;
        const pdfjsLib = await this.loadPdfJs();
        const container = this.$refs[`pdf-container-${order.id}`];
        
        if (!container || !container[0]) return;
        
        const response = await axios.get(this.getPdfUrl(order.invoice_url), {
          responseType: 'arraybuffer'
        });
        
        const loadingTask = pdfjsLib.getDocument({ data: response.data });
        const pdf = await loadingTask.promise;
        
        container[0].innerHTML = '';
        
        // Adjust scale based on screen size
        const scale = this.isMobileView ? 0.8 : 1.5;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Add some margin between pages
          if (i > 1) {
            const spacer = document.createElement('div');
            spacer.style.height = '10px';
            container[0].appendChild(spacer);
          }
          
          container[0].appendChild(canvas);
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
        }
        
        this.pdfLoading = false;
      } catch (error) {
        console.error('PDF.js rendering failed:', error);
        this.onPdfError();
      }
    },
    async saveInvoiceAsImage(order) {
      if (!order.invoice_url) {
        alert("Invoice tidak tersedia untuk disimpan");
        return;
      }

      if (this.isSavingImage) {
        alert("Sedang menyimpan gambar, harap tunggu...");
        return;
      }

      this.isSavingImage = true;
      try {
        const pdfjsLib = await this.loadPdfJs();
        const response = await axios.get(`${process.env.VUE_APP_ORDERS_SERVICE_URL}${order.invoice_url}`, {
          responseType: 'arraybuffer'
        });

        const loadingTask = pdfjsLib.getDocument({ data: response.data });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        // Adjust scale for mobile
        const scale = this.isMobileView ? 1.5 : 2.0;
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const filename = `invoice_${order.id}_${timestamp}.png`;
        
        link.href = image;
        link.download = filename;
        link.click();
        
        alert(`Invoice berhasil disimpan sebagai ${filename}`);
      } catch (error) {
        console.error("Error converting PDF to image:", error);
        alert("Gagal menyimpan invoice sebagai gambar");
      } finally {
        this.isSavingImage = false;
      }
    },
    loadPdfJs() {
      return new Promise((resolve) => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
          return resolve(window.pdfjsLib);
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
          resolve(window.pdfjsLib);
        };
        document.head.appendChild(script);
      });
    },
    async acceptOrder(order) {
      try {
        const user = JSON.parse(localStorage.getItem("user-info")) || { 
          id: this.guestId,
          Nama: this.guestId,
          Alamat: order.alamat || "Unknown" 
        };

        // Validate required fields
        if (!order.order_items || order.order_items.length === 0) {
          throw new Error("Order items are required");
        }
        if (!order.total) {
          throw new Error("Total amount is required");
        }
        if (!order.alamat) {
          throw new Error("Alamat is required");
        }

        const transactionData = {
          user: user.id,
          total: order.total,
          catatan: order.catatan || '',
          alamat: order.alamat || user.Alamat,
          pemesan: order.pemesan || user.Nama,
          created_at: order.created_at || new Date().toISOString(),
          order_items: order.order_items.map(item => ({
            ...item,
            quantity: parseInt(item.quantity, 10)
          })),
          invoice_url: order.invoice_url
        };

        console.log("Using transaction service URL:", `${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions`);

        await axios.post(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions`, {
          ...transactionData,
          invoice_url: order.invoice_url
        });

        try {
          await axios.delete(`${process.env.VUE_APP_ORDERS_SERVICE_URL}/orders/${order.id}/complete`);
        } catch (deleteError) {
          console.error("Order deletion failed:", deleteError);
        }

        this.orders = this.orders.filter(o => o.id !== order.id);
        alert("Pesanan berhasil diterima!");
      } catch (error) {
        console.error("Error accepting order:", error);
        let errorMessage = error.message;
        if (error.response) {
          errorMessage = error.response.data?.error || error.response.statusText;
        }
        alert(`Gagal menerima pesanan: ${errorMessage}`);
      }
    },
    async deleteOrder(orderId) {
      try {
        const order = this.orders.find(order => order.id === orderId);
        if (!order) throw new Error("Order not found");

        const response = await axios.post(
          `${process.env.VUE_APP_ORDERS_SERVICE_URL}/orders/${orderId}/refund`
        );

        if (response.data.message) {
          this.orders = this.orders.filter(order => order.id !== orderId);
          alert(response.data.message);
        } else {
          throw new Error("Unexpected response from server");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        alert(`Failed to delete order: ${error.response?.data?.error || error.message}`);
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    formatDateTime(dateString) {
      if (!dateString) return "";
      return moment(dateString)
        .tz("Asia/Jakarta")
        .format("DD/MM/YYYY HH:mm:ss");
    },
  },
};
</script>

<style scoped>
.orders-container {
  padding: 10px;
  max-width: 100%;
  box-sizing: border-box;
}

.invoice-container {
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  background-color: #f2f2f2;
  border-bottom: 1px solid #ddd;
  padding: 8px;
}

.header-cell {
  font-weight: bold;
}

.time-cell {
  text-align: right;
}

.invoice-content {
  padding: 8px;
}

.action-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.action-cell button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-weight: bold;
  flex: 1;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
}

.action-cell button .fa-icon {
  margin-left: 5px;
}

.accept-btn {
  background-color: #4CAF50;
}

.accept-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  background-color: #f44336;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.save-img-btn {
  background-color: #2196F3;
}

.save-img-btn:hover {
  background-color: #0b7dda;
}

.pdf-viewer-container {
  width: 100%;
  border-top: 1px solid #ddd;
  position: relative;
}

object {
  width: 100%;
  height: 100%;
  border: none;
}

.pdfjs-container {
  width: 100%;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 10px;
  box-sizing: border-box;
}

.pdfjs-container canvas {
  display: block;
  margin: 0 auto;
  margin-bottom: 10px;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  max-width: 100%;
  width: 100% !important;
  height: auto !important;
}

.pdf-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #555;
  padding: 20px;
}

/* Mobile styles */
@media (max-width: 768px) {
  .orders-container {
    padding: 5px;
  }

  .invoice-container {
    margin-bottom: 8px;
  }

  .invoice-header {
    padding: 6px;
    font-size: 0.9em;
  }

  .action-cell button {
    padding: 8px;
    font-size: 0.85em;
    min-width: 80px;
  }

  .pdf-viewer-container, .pdfjs-container {
    height: 300px;
  }

  .pdfjs-container canvas {
    width: 100% !important;
    height: auto !important;
  }

  h2 {
    font-size: 1.3em;
    margin: 10px 0;
  }
}

/* Desktop styles */
@media (min-width: 769px) {
  .orders-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .pdf-viewer-container, .pdfjs-container {
    height: 500px;
  }
  
  .action-cell {
    justify-content: flex-end;
  }
  
  .action-cell button {
    flex: none;
    padding: 8px 15px;
    min-width: 120px;
  }
}
</style>