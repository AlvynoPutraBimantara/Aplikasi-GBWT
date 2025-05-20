<template>
  <div>
    <h1>Penjualan</h1>
    
    <!-- Penjualan Section -->
    <div class="table-controls">
      <div class="left-controls">
        <div class="search-box">
          <input
            type="text"
            v-model="penjualanSearchQuery"
            placeholder="Cari penjualan..."
            @input="handlePenjualanSearch"
            class="search-input"
          />
         
        </div>
      </div>
      
      <div class="right-controls">
        <div class="sort-controls">
          <label for="penjualan-sort-order" class="sort-label">Urutkan:</label>
          <select 
            id="penjualan-sort-order" 
            v-model="penjualanSortOrder" 
            @change="handlePenjualanSortChange"
            class="sort-select"
          >
            <option value="desc">Terbaru ke Terlama</option>
            <option value="asc">Terlama ke Terbaru</option>
          </select>
        </div>
      </div>
    </div>

    <table class="bordered-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Struk</th>
      <th>Total</th>
      <th>Pemesan</th>
      <th>Alamat</th>
      <th>Produk</th>
      <th>Waktu Pesan</th>
      <th>Catatan</th>
      <th>Aksi</th>
    </tr>
  </thead>
  <tbody>
    <template v-for="(group, date) in groupedPenjualan" :key="date">
      <tr class="date-header">
        <td colspan="9">{{ formatDateHeader(date) }}</td>
      </tr>
      <tr v-for="transaction in group" :key="transaction.id">
        <td>{{ transaction.id }}</td>
        <td>
          <button 
            v-if="transaction.invoice_url" 
            @click="viewInvoice(transaction.invoice_url)"
            class="view-invoice-btn"
          >
            Lihat Invoice
          </button>
        </td>
        <td>{{ formatPrice(transaction.total) }}</td>
        <td>{{ transaction.pemesan || transaction.user }}</td> <!-- Updated this line -->
        <td>{{ transaction.alamat }}</td>
        <td>
          <ul>
            <li v-for="item in transaction.transaction_items" :key="item.id">
              {{ item.name }} <br />- {{ formatPrice(item.price) }}<br />
              - ({{ item.quantity }})
            </li>
          </ul>
        </td>
        <td>{{ formatDateTime(transaction.created_at) }}</td>
        <td>{{ transaction.catatan }}</td>
        <td>
          <button @click="deleteTransaction(transaction.id)" class="action-btn accept-btn">
            Terima Pesanan
          </button>
          <button @click="deleteTransactions(transaction.id)" class="action-btn kasbon-btn">
            Kasbon
          </button>
          <button @click="handleRefundTransaction(transaction)" class="action-btn refund-btn">
            Kembalikan
          </button>
        </td>
      </tr>
    </template>
    <tr v-if="filteredPenjualan.length === 0">
      <td colspan="9" class="no-results">Tidak ada transaksi penjualan yang ditemukan</td>
    </tr>
  </tbody>
</table>

    <!-- Kasbon Section -->
    <h2>Kasbon</h2>
    
    <div class="table-controls">
      <div class="left-controls">
        <div class="search-box">
          <input
            type="text"
            v-model="kasbonSearchQuery"
            placeholder="Cari kasbon..."
            @input="handleKasbonSearch"
            class="search-input"
          />
          
        </div>
      </div>
      
      <div class="right-controls">
        <div class="sort-controls">
          <label for="kasbon-sort-order" class="sort-label">Urutkan:</label>
          <select 
            id="kasbon-sort-order" 
            v-model="kasbonSortOrder" 
            @change="handleKasbonSortChange"
            class="sort-select"
          >
            <option value="desc">Terbaru ke Terlama</option>
            <option value="asc">Terlama ke Terbaru</option>
          </select>
        </div>
      </div>
    </div>

    <table class="bordered-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Total</th>
      <th>Pemesan</th>
      <th>Alamat</th>
      <th>Produk</th>
      <th>Waktu Pesan</th>
      <th>Catatan</th>
      <th>Keterangan</th>
      <th>Aksi</th>
    </tr>
  </thead>
  <tbody>
    <template v-for="(group, date) in groupedKasbon" :key="date">
      <tr class="date-header">
        <td colspan="9">{{ formatDateHeader(date) }}</td>
      </tr>
      <tr v-for="transaction in group" :key="transaction.id">
        <td>{{ transaction.id }}</td>
        <td>{{ formatPrice(transaction.total) }}</td>
        <td>{{ transaction.pemesan || transaction.user }}</td> <!-- Updated this line -->
        <td>{{ transaction.alamat }}</td>
        <td>
          <ul>
            <li v-for="item in transaction.items" :key="item.id">
              {{ item.name }}<br />
              - {{ item.quantity }}<br />
              - ({{ formatPrice(item.price) }})
            </li>
          </ul>
        </td>
        <td>{{ formatDateTime(transaction.created_at) }}</td>
        <td>{{ transaction.catatan }}</td>
        <td>{{ transaction.description }}</td>
        <td>
          <button @click="markAsPaid(transaction.id)" class="action-btn paid-btn">
            Lunas
          </button>
        </td>
      </tr>
    </template>
    <tr v-if="filteredKasbon.length === 0">
      <td colspan="9" class="no-results">Tidak ada transaksi kasbon yang ditemukan</td>
    </tr>
  </tbody>
</table>

    <!-- Fullscreen PDF Viewer Modal -->
    <div v-if="showPdfViewer" class="pdf-modal">
      <div class="pdf-modal-content">
        <span class="close-btn" @click="closePdfViewer">&times;</span>
        <iframe 
          v-if="currentPdfUrl" 
          :src="currentPdfUrl"
          class="pdf-viewer"
          frameborder="0"
          type="application/pdf"
          @error="onPdfError"
        ></iframe>
        <div v-else class="pdf-loading">
          Memuat invoice...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";

export default {
  name: "Penjualan",
  data() {
    return {
      transactions: [],
      kasbonTransactions: [],
      userData: {},
      showPdfViewer: false,
      currentPdfUrl: null,
      pdfLoading: false,
      isProcessing: false,
      
      // Penjualan search and sort
      penjualanSearchQuery: "",
      penjualanSortOrder: "desc",
      debouncedPenjualanSearch: null,
      
      // Kasbon search and sort
      kasbonSearchQuery: "",
      kasbonSortOrder: "desc",
      debouncedKasbonSearch: null,
      
      // Date search mappings
      dayNames: {
        'senin': 'Monday',
        'selasa': 'Tuesday',
        'rabu': 'Wednesday',
        'kamis': 'Thursday',
        'jumat': 'Friday',
        'sabtu': 'Saturday',
        'minggu': 'Sunday'
      },
      monthNames: {
        'januari': 'January',
        'februari': 'February',
        'maret': 'March',
        'april': 'April',
        'mei': 'May',
        'juni': 'June',
        'juli': 'July',
        'agustus': 'August',
        'september': 'September',
        'oktober': 'October',
        'november': 'November',
        'desember': 'December'
      }
    };
  },
  computed: {
    filteredPenjualan() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      let transactions = this.transactions.filter((transaction) =>
        transaction.transaction_items.some((item) => item.pedagang === user.NamaWarung)
      );

      // Apply search filter
      if (this.penjualanSearchQuery) {
        const query = this.penjualanSearchQuery.toLowerCase();
        transactions = transactions.filter((transaction) => {
          // Check if query matches day or month name
          const transactionDate = new Date(transaction.created_at);
          const dayName = transactionDate.toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase();
          const monthName = transactionDate.toLocaleDateString('id-ID', { month: 'long' }).toLowerCase();
          
          // Check standard fields
          const standardMatch = 
            transaction.id.toString().includes(query) ||
            transaction.user.toLowerCase().includes(query) ||
            (transaction.alamat && transaction.alamat.toLowerCase().includes(query)) ||
            transaction.transaction_items.some((item) => item.name.toLowerCase().includes(query)) ||
            transaction.catatan.toLowerCase().includes(query);
          
          // Check day/month name match
          const dateMatch = 
            dayName.includes(query) || 
            monthName.includes(query) ||
            (this.dayNames[query] && dayName.includes(this.dayNames[query].toLowerCase())) ||
            (this.monthNames[query] && monthName.includes(this.monthNames[query].toLowerCase()));

          return standardMatch || dateMatch;
        });
      }

      // Sort transactions
      transactions = _.orderBy(
        transactions,
        [(t) => new Date(t.created_at)],
        [this.penjualanSortOrder]
      );

      return transactions;
    },
    groupedPenjualan() {
      const groups = {};
      this.filteredPenjualan.forEach((transaction) => {
        const date = new Date(transaction.created_at).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
      });
      
      // Sort groups by date
      const sortedGroups = {};
      Object.keys(groups)
        .sort((a, b) => {
          return this.penjualanSortOrder === "desc"
            ? new Date(b) - new Date(a)
            : new Date(a) - new Date(b);
        })
        .forEach((key) => {
          sortedGroups[key] = groups[key];
        });
      
      return sortedGroups;
    },
    filteredKasbon() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      let transactions = this.kasbonTransactions.filter((transaction) =>
        transaction.items.some((item) => item.pedagang === user.NamaWarung)
      );

      // Apply search filter
      if (this.kasbonSearchQuery) {
        const query = this.kasbonSearchQuery.toLowerCase();
        transactions = transactions.filter((transaction) => {
          // Check if query matches day or month name
          const transactionDate = new Date(transaction.created_at);
          const dayName = transactionDate.toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase();
          const monthName = transactionDate.toLocaleDateString('id-ID', { month: 'long' }).toLowerCase();
          
          // Check standard fields
          const standardMatch = 
            transaction.id.toString().includes(query) ||
            transaction.user.toLowerCase().includes(query) ||
            (transaction.alamat && transaction.alamat.toLowerCase().includes(query)) ||
            transaction.items.some((item) => item.name.toLowerCase().includes(query)) ||
            transaction.description.toLowerCase().includes(query);
          
          // Check day/month name match
          const dateMatch = 
            dayName.includes(query) || 
            monthName.includes(query) ||
            (this.dayNames[query] && dayName.includes(this.dayNames[query].toLowerCase())) ||
            (this.monthNames[query] && monthName.includes(this.monthNames[query].toLowerCase()));

          return standardMatch || dateMatch;
        });
      }

      // Sort transactions
      transactions = _.orderBy(
        transactions,
        [(t) => new Date(t.created_at)],
        [this.kasbonSortOrder]
      );

      return transactions;
    },
    groupedKasbon() {
      const groups = {};
      this.filteredKasbon.forEach((transaction) => {
        const date = new Date(transaction.created_at).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
      });
      
      // Sort groups by date
      const sortedGroups = {};
      Object.keys(groups)
        .sort((a, b) => {
          return this.kasbonSortOrder === "desc"
            ? new Date(b) - new Date(a)
            : new Date(a) - new Date(b);
        })
        .forEach((key) => {
          sortedGroups[key] = groups[key];
        });
      
      return sortedGroups;
    }
  },
  async created() {
    await this.fetchTransactions();
    await this.fetchKasbonTransactions();
    this.debouncedPenjualanSearch = _.debounce(this.handlePenjualanSearch, 300);
    this.debouncedKasbonSearch = _.debounce(this.handleKasbonSearch, 300);
  },
  methods: {
    async fetchTransactions() {
      try {
        const response = await axios.get("http://localhost:3005/transactions");
        this.transactions = response.data;
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    },
    async fetchKasbonTransactions() {
      try {
        const response = await axios.get("http://localhost:3005/transactions-history");
        const kasbonTransactions = response.data.filter(
          (transaction) => transaction.description === "Kasbon"
        );

        const kasbonTransactionsWithItems = await Promise.all(
          kasbonTransactions.map(async (transaction) => {
            const itemsResponse = await axios.get(
              `http://localhost:3005/transactions-history-items/${transaction.id}`
            );
            return {
              ...transaction,
              items: itemsResponse.data,
            };
          })
        );

        this.kasbonTransactions = kasbonTransactionsWithItems;
      } catch (error) {
        console.error("Error fetching Kasbon transactions:", error);
      }
    },
    async viewInvoice(invoiceUrl) {
      try {
        this.pdfLoading = true;
        this.showPdfViewer = true;
        
        const fullUrl = invoiceUrl.startsWith('http') 
          ? invoiceUrl 
          : `http://localhost:3003${invoiceUrl}`;

        const response = await axios.get(fullUrl, {
          responseType: 'blob',
          headers: { 
            'Cache-Control': 'no-cache',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        if (this.currentPdfUrl && this.currentPdfUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.currentPdfUrl);
        }

        this.currentPdfUrl = blobUrl;
      } catch (error) {
        console.error("Error loading invoice:", error);
        alert("Gagal memuat invoice. Silakan coba lagi.");
        this.closePdfViewer();
      } finally {
        this.pdfLoading = false;
      }
    },
    onPdfError() {
      this.pdfLoading = false;
      alert("Terjadi kesalahan saat memuat PDF.");
      this.closePdfViewer();
    },
    closePdfViewer() {
      this.showPdfViewer = false;
      if (this.currentPdfUrl && this.currentPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.currentPdfUrl);
      }
      this.currentPdfUrl = null;
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    formatDateTime(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
    formatDateHeader(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    async deleteTransaction(transactionId) {
      try {
        const transaction = this.transactions.find(t => t.id === transactionId);
        
        await axios.post(`http://localhost:3005/transactions/${transactionId}/move-to-history`, {
          description: "Lunas",
          invoice_url: transaction.invoice_url
        });
        
        this.transactions = this.transactions.filter(
          (transaction) => transaction.id !== transactionId
        );
        alert("Pesanan diterima dan dipindahkan ke riwayat!");
      } catch (error) {
        console.error("Error accepting order:", error);
        alert("Gagal menerima pesanan. Silakan coba lagi.");
      }
    },
    async deleteTransactions(transactionId) {
      try {
        const transaction = this.transactions.find(t => t.id === transactionId);
        
        if (!transaction) {
          throw new Error(`Transaction with ID ${transactionId} not found in local state`);
        }

        if (!transaction.transaction_items || transaction.transaction_items.length === 0) {
          throw new Error("Transaction has no items");
        }

        this.isProcessing = true;

        const response = await axios.post(
          `http://localhost:3005/transactions/${transactionId}/move-to-history`,
          {
            description: "Kasbon",
            invoice_url: transaction.invoice_url || null
          },
          {
            timeout: 10000,
            validateStatus: (status) => status < 500,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.status === 200) {
          this.transactions = this.transactions.filter(t => t.id !== transactionId);
          alert('Kasbon berhasil diproses!');
          await this.fetchKasbonTransactions();
        } else {
          throw new Error(response.data?.error || `Server returned status ${response.status}`);
        }
      } catch (error) {
        console.error("Error processing Kasbon:", {
          message: error.message,
          transactionId,
          response: error.response?.data
        });
        alert(`Gagal memproses Kasbon: ${error.message}`);
      } finally {
        this.isProcessing = false;
      }
    },
    async handleRefundTransaction(transaction) {
  if (!confirm('Apakah Anda yakin ingin mengembalikan pesanan ini? Stok produk akan dikembalikan.')) {
    return;
  }

  try {
    const response = await axios.post(
      `http://localhost:3005/transactions/${transaction.id}/refund`, 
      {
        invoice_url: transaction.invoice_url
      }
    );
    
    this.transactions = this.transactions.filter(
      (t) => t.id !== transaction.id
    );
    
    let message = "Pesanan berhasil dikembalikan dan stok diperbarui!";
    if (response.data.invoiceDeleted) {
      message += " Invoice terkait telah dihapus.";
    }
    
    alert(message);
  } catch (error) {
    console.error("Error refunding transaction:", error);
    alert("Gagal mengembalikan pesanan. Silakan coba lagi.");
  }
},
    async markAsPaid(transactionId) {
      try {
        await axios.put(`http://localhost:3005/transactions-history/${transactionId}/mark-as-paid`);
        alert("Transaksi berhasil ditandai sebagai Sudah Dibayar!");
        await this.fetchKasbonTransactions();
      } catch (error) {
        console.error("Error marking transaction as paid:", error);
        alert("Gagal menandai transaksi sebagai Sudah Dibayar. Silakan coba lagi.");
      }
    },
    handlePenjualanSearch() {
      this.debouncedPenjualanSearch();
    },
    handlePenjualanSortChange() {
      // Computed properties will update automatically
    },
    handleKasbonSearch() {
      this.debouncedKasbonSearch();
    },
    handleKasbonSortChange() {
      // Computed properties will update automatically
    },
  },
};
</script>

<style scoped>
/* Table controls */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.left-controls {
  flex: 1;
  margin-right: 20px;
}

.right-controls {
  flex-shrink: 0;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-input {
  padding: 10px 15px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.sort-controls {
  display: flex;
  align-items: center;
}

.sort-label {
  margin-right: 8px;
  font-size: 14px;
  color: #555;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.sort-select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* Bordered table styles */
.bordered-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border: 1px solid black;
}

.bordered-table th,
.bordered-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid black;
  border-right: 1px solid black;
}

.bordered-table th:last-child,
.bordered-table td:last-child {
  border-right: 1px solid black;
}

.bordered-table th {
  background-color: #f8f8f8;
  font-weight: bold;
  border-bottom: 1px solid black;
}

.bordered-table tr:hover {
  background-color: #f5f5f5;
}

/* Date header row */
.date-header {
  background-color: #f0f0f0;
  font-weight: bold;
  font-size: 1.1em;
}

.date-header td {
  padding: 8px;
  border-right: none;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
}

ul {
  margin: 0;
  padding-left: 20px;
}

li {
  margin-bottom: 5px;
}

/* Action buttons */
.action-btn {
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  margin: 2px;
  cursor: pointer;
  font-size: 13px;
  color: white;
  transition: all 0.2s;
}

.accept-btn {
  background-color: #4CAF50;
}

.accept-btn:hover {
  background-color: #45a049;
}

.kasbon-btn {
  background-color: #2196F3;
}

.kasbon-btn:hover {
  background-color: #0b7dda;
}

.refund-btn {
  background-color: #f44336;
}

.refund-btn:hover {
  background-color: #da190b;
}

.paid-btn {
  background-color: #4CAF50;
  width: 100%;
}

.paid-btn:hover {
  background-color: #45a049;
}

.view-invoice-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-invoice-btn:hover {
  background-color: #45a049;
}

/* PDF Viewer Modal */
.pdf-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.pdf-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  height: 80%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 28px;
  font-weight: bold;
  color: #aaa;
  cursor: pointer;
}

.close-btn:hover {
  color: black;
}

.pdf-viewer {
  width: 100%;
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

@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .left-controls, .right-controls {
    width: 100%;
    margin-right: 0;
  }
  
  .search-box {
    max-width: 100%;
    margin-bottom: 15px;
  }
  
  .sort-controls {
    justify-content: space-between;
  }
  
  .bordered-table {
    display: block;
    overflow-x: auto;
  }
  
  .action-btn {
    display: block;
    width: 100%;
    margin: 5px 0;
  }
}
</style>