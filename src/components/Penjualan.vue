<!-- eslint-disable no-useless-escape -->
<template>
  <div class="penjualan-container">
    <h1>Penjualan</h1>
    
    <!-- Penjualan Section -->
    <div class="search-container">
      <input
        type="text"
        v-model="penjualanSearchQuery"
        placeholder="Cari penjualan..."
        @input="handlePenjualanSearch"
        class="search-input"
      />
    </div>

    <div class="table-controls">
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

    <!-- Desktop Table -->
    <table class="bordered-table desktop-table">
      <thead>
        <tr>
          <th>Kode pesanan</th>
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
            <td>{{ transaction.pemesan || transaction.user }}</td>
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

    <!-- Mobile Cards -->
    <div class="mobile-cards">
      <template v-for="(group, date) in groupedPenjualan" :key="date">
        <div class="date-header-mobile">{{ formatDateHeader(date) }}</div>
        <div v-for="transaction in group" :key="transaction.id" class="transaction-card">
          <div class="card-row">
            <span class="card-label">ID:</span>
            <span>{{ transaction.id }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Pemesan:</span>
            <span>{{ transaction.pemesan || transaction.user }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Total:</span>
            <span>{{ formatPrice(transaction.total) }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Waktu:</span>
            <span>{{ formatDateTime(transaction.created_at) }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Produk:</span>
            <ul class="product-list">
              <li v-for="item in transaction.transaction_items" :key="item.id">
                {{ item.quantity }}x {{ item.name }} ({{ formatPrice(item.price) }})
              </li>
            </ul>
          </div>
          <div class="card-actions">
            <button 
              v-if="transaction.invoice_url" 
              @click="viewInvoice(transaction.invoice_url)"
              class="view-invoice-btn"
            >
             STRUK
            </button>
            <button @click="deleteTransaction(transaction.id)" class="action-btn accept-btn">
              Terima
            </button>
            <button @click="deleteTransactions(transaction.id)" class="action-btn kasbon-btn">
              Kasbon
            </button>
            <button @click="handleRefundTransaction(transaction)" class="action-btn refund-btn">
              Kembali
            </button>
          </div>
        </div>
      </template>
      <div v-if="filteredPenjualan.length === 0" class="no-results-mobile">
        Tidak ada transaksi penjualan yang ditemukan
      </div>
    </div>

    <!-- Kasbon Section -->
    <h2>Kasbon</h2>
    
    <div class="search-container">
      <input
        type="text"
        v-model="kasbonSearchQuery"
        placeholder="Cari kasbon..."
        @input="handleKasbonSearch"
        class="search-input"
      />
    </div>

    <div class="table-controls">
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

    <!-- Desktop Table -->
    <table class="bordered-table desktop-table">
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
            <td>{{ transaction.pemesan || transaction.user }}</td>
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

    <!-- Mobile Cards -->
    <div class="mobile-cards">
      <template v-for="(group, date) in groupedKasbon" :key="date">
        <div class="date-header-mobile">{{ formatDateHeader(date) }}</div>
        <div v-for="transaction in group" :key="transaction.id" class="transaction-card">
          <div class="card-row">
            <span class="card-label">ID:</span>
            <span>{{ transaction.id }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Pemesan:</span>
            <span>{{ transaction.pemesan || transaction.user }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Total:</span>
            <span>{{ formatPrice(transaction.total) }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Waktu:</span>
            <span>{{ formatDateTime(transaction.created_at) }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Produk:</span>
            <ul class="product-list">
              <li v-for="item in transaction.items" :key="item.id">
                {{ item.quantity }}x {{ item.name }} ({{ formatPrice(item.price) }})
              </li>
            </ul>
          </div>
          <div class="card-row">
            <span class="card-label">Keterangan:</span>
            <span>{{ transaction.description }}</span>
          </div>
          <div class="card-actions">
            <button @click="markAsPaid(transaction.id)" class="action-btn paid-btn">
              Lunas
            </button>
          </div>
        </div>
      </template>
      <div v-if="filteredKasbon.length === 0" class="no-results-mobile">
        Tidak ada transaksi kasbon yang ditemukan
      </div>
    </div>

    <!-- Updated PDF Viewer Modal -->
    <div v-if="showPdfViewer" class="pdf-modal">
      <div class="pdf-modal-content">
        <span class="close-btn" @click="closePdfViewer">&times;</span>
        <div class="pdfjs-container" ref="pdfContainer"></div>
        <div v-if="pdfLoading" class="pdf-loading">
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
      currentInvoiceUrl: null,
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
        const response = await axios.get(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.transactions = response.data;
      } catch (error) {
        console.error("Error fetching transactions:", error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    async fetchKasbonTransactions() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history`, {
          params: { description: "Kasbon" },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const kasbonTransactionsWithItems = await Promise.all(
          response.data.map(async (transaction) => {
            const itemsResponse = await axios.get(
              `${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history-items/${transaction.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
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
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    async viewInvoice(invoiceUrl) {
      try {
        this.showPdfViewer = true;
        this.currentInvoiceUrl = invoiceUrl;
        this.pdfLoading = true;
        
        // Wait for modal to render
        await this.$nextTick();
        this.renderWithPdfJs();
      } catch (error) {
        console.error("Error loading invoice:", error);
        alert("Gagal memuat invoice. Silakan coba lagi.");
        this.closePdfViewer();
      }
    },

    async renderWithPdfJs() {
      try {
        const pdfjsLib = await this.loadPdfJs();
        const container = this.$refs.pdfContainer;
        
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        const response = await axios.get(this.getPdfUrl(this.currentInvoiceUrl), {
          responseType: 'arraybuffer',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const loadingTask = pdfjsLib.getDocument({ data: response.data });
        const pdf = await loadingTask.promise;
        
        // Adjust scale based on screen size
        const scale = window.innerWidth <= 768 ? 0.8 : 1.5;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Add space between pages
          if (i > 1) {
            const spacer = document.createElement('div');
            spacer.style.height = '10px';
            container.appendChild(spacer);
          }
          
          container.appendChild(canvas);
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
        }
        
        this.pdfLoading = false;
      } catch (error) {
        console.error('PDF.js rendering failed:', error);
        this.pdfLoading = false;
        alert('Gagal memuat invoice. Silakan coba lagi.');
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

    getPdfUrl(invoiceUrl) {
      if (!invoiceUrl) return '';
      if (invoiceUrl.startsWith('http')) {
        return invoiceUrl;
      }
      
      // Extract order ID from URL
      // eslint-disable-next-line no-useless-escape
      const orderIdMatch = invoiceUrl.match(/\/invoices\/([^\/]+)\//);
      const orderId = orderIdMatch ? orderIdMatch[1] : null;
      
      let fullUrl;
      
      if (orderId) {
        // Reconstruct URL using order ID
        const filename = invoiceUrl.split('/').pop() || `invoice_${orderId}.pdf`;
        fullUrl = `${process.env.VUE_APP_ORDERS_SERVICE_URL}/invoices/${orderId}/${filename}`;
      } else {
        // Fallback to direct URL
        fullUrl = `${process.env.VUE_APP_ORDERS_SERVICE_URL}${invoiceUrl}`;
      }

      // Add timestamp to prevent caching
      return fullUrl + (fullUrl.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
    },

    closePdfViewer() {
      this.showPdfViewer = false;
      this.currentInvoiceUrl = null;
      this.pdfLoading = false;
      const container = this.$refs.pdfContainer;
      if (container) {
        container.innerHTML = '';
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
        
        await axios.post(
          `${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions/${transactionId}/move-to-history`, 
          {
            description: "Lunas",
            invoice_url: transaction.invoice_url
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        this.transactions = this.transactions.filter(
          (transaction) => transaction.id !== transactionId
        );
        alert("Pesanan diterima dan dipindahkan ke riwayat!");
      } catch (error) {
        console.error("Error accepting order:", error);
        alert("Gagal menerima pesanan. Silakan coba lagi.");
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
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
          `${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions/${transactionId}/move-to-history`,
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
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
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
          `${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions/${transaction.id}/refund`, 
          {
            invoice_url: transaction.invoice_url
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },
    async markAsPaid(transactionId) {
      try {
        await axios.put(
          `${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history/${transactionId}/mark-as-paid`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        alert("Transaksi berhasil ditandai sebagai Sudah Dibayar!");
        await this.fetchKasbonTransactions();
      } catch (error) {
        console.error("Error marking transaction as paid:", error);
        alert("Gagal menandai transaksi sebagai Sudah Dibayar. Silakan coba lagi.");
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
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
  }
};
</script>

<style scoped>
/* Base styles (mobile first) */
.penjualan-container {
  padding: 0.5rem;
}

.search-container {
  margin: 10px 0;
  text-align: left;
}

.search-input {
  padding: 10px;
  font-size: 16px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Table controls */
.table-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}

.left-controls, .right-controls {
  width: 100%;
}

.search-box {
  width: 60%;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
}

/* Mobile cards */
.mobile-cards {
  display: block;
}

.desktop-table {
  display: none;
}

.transaction-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background-color: #f9f9f9;
}

.date-header-mobile {
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  padding: 0.5rem;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.card-row {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.card-label {
  font-weight: bold;
  min-width: 80px;
  display: inline-block;
}

.product-list {
  margin: 0;
  padding-left: 1rem;
}

.product-list li {
  margin-bottom: 0.25rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  color: white;
  cursor: pointer;
}

.accept-btn {
  background-color: #4CAF50;
}

.kasbon-btn {
  background-color: #2196F3;
}

.refund-btn {
  background-color: #f44336;
}

.paid-btn {
  background-color: #4CAF50;
}

.view-invoice-btn {
  background-color: #FF9800;
}

.no-results-mobile {
  text-align: center;
  padding: 1rem;
  color: #666;
}

/* Updated PDF Viewer Styles */
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
  width: 90%;
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
  z-index: 10;
}

.close-btn:hover {
  color: black;
}

.pdfjs-container {
  width: 100%;
  height: 100%;
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
}

/* Desktop styles */
@media (min-width: 768px) {
  .mobile-cards {
    display: none;
  }
  
  .desktop-table {
    display: table;
  }
  
  .table-controls {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .left-controls {
    width: auto;
    flex-grow: 1;
    margin-right: 1rem;
  }
  
  .right-controls {
    width: auto;
  }

  .search-container {
    margin: 20px 0;
  }
  
  .search-input {
    max-width: 300px;
    padding: 12px;
  }
  
  /* Keep existing desktop table styles */
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
}

/* Mobile PDF Viewer Height Adjustment */
@media (max-width: 768px) {
  .pdf-modal-content {
    height: 85%;
    width: 95%;
    padding: 10px;
  }
  
  .pdfjs-container {
    padding: 5px;
  }
}
</style>