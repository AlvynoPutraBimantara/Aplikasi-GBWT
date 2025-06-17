<template>
  <div>
    <h1>Riwayat Transaksi</h1>
    
    <div class="table-controls">
      <div class="left-controls">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari transaksi..."
            @input="handleSearch"
            class="search-input"
          />
        </div>
      </div>
      
      <div class="right-controls">
        <div class="sort-controls">
          <label for="sort-order" class="sort-label">Urutkan:</label>
          <select 
            id="sort-order" 
            v-model="sortOrder" 
            @change="handleSortChange"
            class="sort-select"
          >
            <option value="desc">Terbaru ke Terlama</option>
            <option value="asc">Terlama ke Terbaru</option>
          </select>
        </div>
      </div>
    </div>

    <div class="transactions-container">
      <template v-for="(group, date) in groupedTransactions" :key="date">
        <div class="date-header">{{ formatDateHeader(date) }}</div>
        <div class="transaction-group">
          <div v-for="transaction in group" :key="transaction.id" class="transaction-item">
            <div class="transaction-header">
              <span class="transaction-id">ID: {{ transaction.id }}</span>
              <span class="transaction-time">{{ formatDateTime(transaction.created_at) }}</span>
            </div>
            <div class="transaction-details">
              <div><strong>Total:</strong> {{ formatPrice(transaction.total) }}</div>
              <div><strong>Pemesan:</strong> {{ transaction.pemesan || transaction.user }}</div>
              <div><strong>Alamat:</strong> {{ transaction.alamat || getUserAddress(transaction.user) }}</div>
              <div><strong>Keterangan:</strong> {{ transaction.description }}</div>
              <div><strong>Catatan:</strong> {{ transaction.catatan }}</div>
            </div>
            <div class="transaction-products">
              <strong>Produk:</strong>
              <ul>
                <li v-for="item in transaction.items" :key="item.id">
                  {{ item.name }} - {{ item.quantity }} ({{ formatPrice(item.price) }})
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
      <div v-if="filteredRiwayatTransaksi.length === 0" class="no-results">
        Tidak ada transaksi yang ditemukan
      </div>
    </div>

    <table class="bordered-table desktop-only">
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
        </tr>
      </thead>
      <tbody>
        <template v-for="(group, date) in groupedTransactions" :key="date">
          <tr class="date-header">
            <td colspan="8">{{ formatDateHeader(date) }}</td>
          </tr>
          <tr v-for="transaction in group" :key="transaction.id">
            <td>{{ transaction.id }}</td>
            <td>{{ formatPrice(transaction.total) }}</td>
            <td>{{ transaction.pemesan || transaction.user }}</td>
            <td>{{ transaction.alamat || getUserAddress(transaction.user) }}</td>
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
          </tr>
        </template>
        <tr v-if="filteredRiwayatTransaksi.length === 0">
          <td colspan="8" class="no-results">Tidak ada transaksi yang ditemukan</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";

export default {
  name: "RiwayatTransaksi",
  data() {
    return {
      userData: {},
      riwayatTransaksi: [],
      searchQuery: "",
      sortOrder: "desc",
      debouncedSearch: null,
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
    filteredRiwayatTransaksi() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      let transactions = this.riwayatTransaksi.filter((transaction) =>
        transaction.items.some((item) => item.pedagang === user.NamaWarung)
      );

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        transactions = transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.created_at);
          const dayName = transactionDate.toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase();
          const monthName = transactionDate.toLocaleDateString('id-ID', { month: 'long' }).toLowerCase();
          
          const standardMatch = 
            transaction.id.toString().includes(query) ||
            transaction.user.toLowerCase().includes(query) ||
            (transaction.alamat && transaction.alamat.toLowerCase().includes(query)) ||
            transaction.items.some((item) => item.name.toLowerCase().includes(query)) ||
            transaction.description.toLowerCase().includes(query);
          
          const dateMatch = 
            dayName.includes(query) || 
            monthName.includes(query) ||
            (this.dayNames[query] && dayName.includes(this.dayNames[query].toLowerCase())) ||
            (this.monthNames[query] && monthName.includes(this.monthNames[query].toLowerCase()));

          return standardMatch || dateMatch;
        });
      }

      transactions = _.orderBy(
        transactions,
        [(t) => new Date(t.created_at)],
        [this.sortOrder]
      );

      return transactions;
    },
    groupedTransactions() {
      const groups = {};
      this.filteredRiwayatTransaksi.forEach((transaction) => {
        const date = new Date(transaction.created_at).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
      });
      
      const sortedGroups = {};
      Object.keys(groups)
        .sort((a, b) => {
          return this.sortOrder === "desc"
            ? new Date(b) - new Date(a)
            : new Date(a) - new Date(b);
        })
        .forEach((key) => {
          sortedGroups[key] = groups[key];
        });
      
      return sortedGroups;
    },
  },
  created() {
    this.fetchUserData();
    this.fetchRiwayatTransaksi();
    this.debouncedSearch = _.debounce(this.handleSearch, 300);
  },
  methods: {
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
    async fetchUserData() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_USER_SERVICE_URL}/users`);
        this.userData = response.data.reduce((acc, user) => {
          acc[user.Nama] = user.Alamat;
          return acc;
        }, {});
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    async fetchRiwayatTransaksi() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history`);
        const transactions = response.data;

        const transactionsWithItems = await Promise.all(
          transactions.map(async (transaction) => {
            const itemsResponse = await axios.get(
              `${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history-items/${transaction.id}`
            );
            return {
              ...transaction,
              items: itemsResponse.data,
            };
          })
        );

        this.riwayatTransaksi = _.orderBy(
          transactionsWithItems,
          [(t) => new Date(t.created_at)],
          ["desc"]
        );
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      }
    },
    getUserAddress(userName) {
      return this.userData[userName] || "Unknown Address";
    },
    handleSearch() {
      this.debouncedSearch();
    },
    handleSortChange() {
      // The computed properties will automatically update when sortOrder changes
    },
  },
};
</script>

<style scoped>
/* Base styles (mobile-first) */
.transactions-container {
  display: block;
}

.desktop-only {
  display: none;
}

.transaction-group {
  margin-bottom: 1rem;
}

.transaction-item {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: lightblue;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}

.transaction-details > div,
.transaction-products {
  margin-bottom: 0.3rem;
}

.transaction-products ul {
  margin: 0.3rem 0 0 1rem;
  padding-left: 1rem;
}

.transaction-products li {
  margin-bottom: 0.2rem;
}

.date-header {
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  padding: 0.5rem;
  background-color: #f0f0f0;
  border-radius: 4px;
}

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

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Desktop styles */
@media (min-width: 768px) {
  .transactions-container {
    display: none;
  }
  
  .desktop-only {
    display: table;
  }
  
  .bordered-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    border: 1px solid #333;
  }

  .bordered-table th,
  .bordered-table td {
    padding: 12px 15px;
    text-align: left;
    border: 1px solid #333;
  }

  .bordered-table th {
    background-color: #f8f8f8;
    font-weight: bold;
    border-bottom: 1px solid #333;
  }

  .date-header {
    background-color: #f0f0f0;
    font-weight: bold;
    font-size: 1.1em;
  }

  .date-header td {
    padding: 8px;
    border: 1px solid #333;
  }

  .bordered-table tr {
    border: 1px solid #333;
  }

  .bordered-table tr:hover {
    background-color: #f5f5f5;
  }

  .no-results {
    text-align: center;
    padding: 20px;
    color: #666;
    border: 1px solid #333;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
  }
  
  .table-controls {
    flex-direction: row;
  }
}

/* Mobile-specific adjustments */
@media (max-width: 767px) {
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
}
</style>