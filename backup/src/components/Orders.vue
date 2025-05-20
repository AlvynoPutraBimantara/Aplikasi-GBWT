<template>
  <!-- Template remains the same as previous version -->
  <div>
    <h2>STRUK</h2>
    <div v-if="filteredOrders.length">
      <div v-for="order in filteredOrders" :key="order.id" class="invoice-container">
        <div class="invoice-header">
          <div class="header-cell">Waktu Pesan</div>
          <div class="header-cell">Aksi</div>
        </div>
        <div class="invoice-content">
          <div class="time-cell">{{ formatDateTime(order.created_at) }}</div>
          <div class="action-cell">
            <button class="accept-btn" @click="acceptOrder(order)">Pesan</button>
            <button class="delete-btn" @click="deleteOrder(order.id)">Hapus</button>
            <button class="save-img-btn" @click="saveInvoiceAsImage(order)">Download Struk</button>
          </div>
        </div>
        <div v-if="order.invoice_url" class="pdf-viewer-container">
          <iframe 
            :src="`http://localhost:3003${order.invoice_url}`"
            class="pdf-viewer"
            frameborder="0"
            type="application/pdf"
            @error="onPdfError"
          ></iframe>
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
      isSavingImage: false
    };
  },
  computed: {
    filteredOrders() {
      const user = JSON.parse(localStorage.getItem("user-info")) || { Nama: this.guestId };
      return this.orders.filter((order) => order.user === user.Nama || order.user === this.guestId);
    },
  },
  async mounted() {
    await this.fetchOrders();
    await this.fetchUserData();
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get("http://localhost:3003/orders");
        this.orders = response.data.map(order => {
          if (!order.order_items) {
            order.order_items = [];
          } else if (!Array.isArray(order.order_items)) {
            order.order_items = [order.order_items];
          }
          return order;
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    },
    async fetchUserData() {
      try {
        const response = await axios.get("http://localhost:3001/users");
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
      alert("Terjadi kesalahan saat memuat PDF.");
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
        // Load pdfjs-dist from CDN dynamically
        const pdfjsLib = await this.loadPdfJs();
        
        // Fetch the PDF
        const response = await axios.get(`http://localhost:3003${order.invoice_url}`, {
          responseType: 'arraybuffer'
        });

        // Convert PDF to image
        const loadingTask = pdfjsLib.getDocument({ data: response.data });
        const pdf = await loadingTask.promise;
        
        // Get the first page
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert canvas to image and download
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
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
        script.onload = () => {
          // Set worker path
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
      Nama: this.guestId, 
      Alamat: order.alamat || "Unknown" 
    };
    
    const transactionData = {
      user: user.Nama,
      total: order.total,
      catatan: order.catatan,
      alamat: order.alamat,
      pemesan: order.pemesan, // Add the original order user as pemesan
      order_items: order.order_items,
      invoice_url: order.invoice_url
    };

    await axios.post("http://localhost:3005/transactions", { 
      order: transactionData,
      invoice_url: order.invoice_url
    });
    
    await axios.delete(`http://localhost:3003/orders/${order.id}/complete`);
    
    this.orders = this.orders.filter(o => o.id !== order.id);
    
    alert("Order accepted successfully!");
  } catch (error) {
    console.error("Error accepting order:", error);
    alert("Failed to accept order. Please try again.");
  }
},
    async deleteOrder(orderId) {
      try {
        const order = this.orders.find(order => order.id === orderId);
        if (!order) throw new Error("Order not found");

        const refundResponse = await axios.post(
          `http://localhost:3003/orders/${orderId}/refund`
        );

        if (refundResponse.status === 200) {
          this.orders = this.orders.filter(order => order.id !== orderId);
          alert("Order deleted and stock refunded successfully!");
        } else {
          throw new Error("Failed to process refund.");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order. Please try again.");
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
/* Styles remain the same as previous version */
.invoice-container {
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.invoice-header {
  display: flex;
  background-color: #f2f2f2;
  border-bottom: 1px solid #ddd;
}

.header-cell {
  padding: 8px;
  font-weight: bold;
  flex: 1;
}

.invoice-content {
  display: flex;
  padding: 8px;
}

.time-cell, .action-cell {
  flex: 1;
  padding: 8px;
}

.action-cell button {
  margin-right: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-weight: bold;
}

.accept-btn {
  background-color: #4CAF50; /* Green */
}

.accept-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  background-color: #f44336; /* Red */
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.save-img-btn {
  background-color: #2196F3; /* Blue */
}

.save-img-btn:hover {
  background-color: #0b7dda;
}

.pdf-viewer-container {
  width: 100%;
  height: 500px;
  border-top: 1px solid #ddd;
}

.pdf-viewer {
  width: 65%;
  height: 100%;
}

.pdf-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #555;
}
</style>