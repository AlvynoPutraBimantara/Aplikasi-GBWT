<template>
  <div class="dashboard-container">
    <!-- Main products section - square and centered -->
    <div class="main-products-container">
      <div
        class="main-product"
        v-for="(product, index) in products"
        :key="index"
        @click="handleMainProductClick(product.name)"
      >
        <div class="main-product-content">
          <img
            :src="require(`@/assets/images/${product.name.toLowerCase()}.jpg`)"
            alt="Product Image"
            class="main-product-image"
          />
          <h3 class="main-product-title">{{ product.name }}</h3>
        </div>
      </div>
    </div>

    <!-- Section for new products (added within last 3 days) -->
    <section class="section-new" v-if="newProducts.length > 0">
      <h4 class="section-title">Produk Baru</h4>
      <div class="carousel-container">
        <!-- Single product display - always centered -->
        <div class="single-product-container" v-if="shouldShowSingleProduct('new')">
          <div 
            class="card"
            v-for="(product, index) in newProducts"
            :key="index"
            @click="goToProductPage(product.id)"
          >
            <div class="card-body">
              <img
                :src="product.imageUrl"
                alt="Product Image"
                class="product-image"
              />
              <h5 class="card-title">{{ product.Nama }}</h5>
              <p class="card-text" :class="{ 'strikethrough': product.Harga_diskon }">
                Harga: {{ formatPrice(product.Harga) }}
              </p>
              <p v-if="product.Harga_diskon" class="card-text discount-price">
                Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
              </p>
              <p class="card-text">
                {{ product.Stok > 0 ? '(Tersedia)' : '(Kosong)' }}
              </p>
              <p class="card-text new-badge" v-if="isNewProduct(product.created_at)">
                Baru!
              </p>
            </div>
          </div>
        </div>
        
        <!-- Carousel display for multiple products -->
        <div 
          v-else
          class="carousel-wrapper"
          ref="newCarousel"
          @mouseenter="pauseAutoScroll('new')"
          @mouseleave="resumeAutoScroll('new')"
          @scroll="handleScroll('new')"
        >
          <div class="carousel">
            <div
              class="card"
              v-for="(product, index) in newProducts"
              :key="product.id"
              @click="goToProductPage(product.id)"
              :class="{ 'active': currentIndexes.new === index }"
            >
              <div class="card-body">
                <img
                  :src="product.imageUrl"
                  alt="Product Image"
                  class="product-image"
                />
                <h5 class="card-title">{{ product.Nama }}</h5>
                <p class="card-text" :class="{ 'strikethrough': product.Harga_diskon }">
                  Harga: {{ formatPrice(product.Harga) }}
                </p>
                <p v-if="product.Harga_diskon" class="card-text discount-price">
                  Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
                </p>
                <p class="card-text">
                  {{ product.Stok > 0 ? '(Tersedia)' : '(Kosong)' }}
                </p>
                <p class="card-text new-badge" v-if="isNewProduct(product.created_at)">
                  Baru!
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Navigation buttons (only show when more than threshold) -->
        <button 
          v-if="shouldShowNavigation('new')"
          class="carousel-button prev" 
          @click="scroll('new', -1)"
        >❮</button>
        <button 
          v-if="shouldShowNavigation('new')"
          class="carousel-button next" 
          @click="scroll('new', 1)"
        >❯</button>
      </div>
    </section>

    <!-- Section for popular products -->
    <section class="section-popular" v-if="popularProducts.length > 0">
      <h4 class="section-title">Produk Populer</h4>
      <div class="carousel-container">
        <!-- Single product display - always centered -->
        <div class="single-product-container" v-if="shouldShowSingleProduct('popular')">
          <div 
            class="card"
            v-for="(product, index) in popularProducts"
            :key="index"
            @click="goToProductPage(product.id)"
          >
            <div class="card-body">
              <img
                :src="product.imageUrl"
                alt="Product Image"
                class="product-image"
              />
              <h5 class="card-title">{{ product.Nama }}</h5>
              <p class="card-text" :class="{ 'strikethrough': product.Harga_diskon }">
                Harga: {{ formatPrice(product.Harga) }}
              </p>
              <p v-if="product.Harga_diskon" class="card-text discount-price">
                Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
              </p>
              <p class="card-text">
                {{ product.Stok > 0 ? '(Tersedia)' : '(Kosong)' }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Carousel display for multiple products -->
        <div 
          v-else
          class="carousel-wrapper"
          ref="popularCarousel"
          @mouseenter="pauseAutoScroll('popular')"
          @mouseleave="resumeAutoScroll('popular')"
          @scroll="handleScroll('popular')"
        >
          <div class="carousel">
            <div
              class="card"
              v-for="(product, index) in popularProducts"
              :key="product.id"
              @click="goToProductPage(product.id)"
              :class="{ 'active': currentIndexes.popular === index }"
            >
              <div class="card-body">
                <img
                  :src="product.imageUrl"
                  alt="Product Image"
                  class="product-image"
                />
                <h5 class="card-title">{{ product.Nama }}</h5>
                <p class="card-text" :class="{ 'strikethrough': product.Harga_diskon }">
                  Harga: {{ formatPrice(product.Harga) }}
                </p>
                <p v-if="product.Harga_diskon" class="card-text discount-price">
                  Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
                </p>
                <p class="card-text">
                  {{ product.Stok > 0 ? '(Tersedia)' : '(Kosong)' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Navigation buttons (only show when more than threshold) -->
        <button 
          v-if="shouldShowNavigation('popular')"
          class="carousel-button prev" 
          @click="scroll('popular', -1)"
        >❮</button>
        <button 
          v-if="shouldShowNavigation('popular')"
          class="carousel-button next" 
          @click="scroll('popular', 1)"
        >❯</button>
      </div>
    </section>

    <!-- Section for previous purchases -->
    <section class="section-previous" v-if="previousProducts.length > 0">
      <h6 class="section-title">Produk yang anda beli sebelumnya</h6>
      <div class="carousel-container">
        <!-- Single product display - always centered -->
        <div class="single-product-container" v-if="shouldShowSingleProduct('previous')">
          <div 
            class="card"
            v-for="(product, index) in previousProducts"
            :key="index"
            @click="goToProductPage(product.id)"
          >
            <div class="card-body">
              <img
                :src="product.imageUrl"
                alt="Product Image"
                class="product-image"
              />
              <h5 class="card-title">{{ product.Nama }}</h5>
              <p class="card-text" :class="{ 'strikethrough': product.Harga_diskon }">
                Harga: {{ formatPrice(product.Harga) }}
              </p>
              <p v-if="product.Harga_diskon" class="card-text discount-price">
                Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
              </p>
              <p class="card-text">
                {{ product.Stok > 0 ? '(Tersedia)' : '(Kosong)' }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Carousel display for multiple products -->
        <div 
          v-else
          class="carousel-wrapper"
          ref="previousCarousel"
          @mouseenter="pauseAutoScroll('previous')"
          @mouseleave="resumeAutoScroll('previous')"
          @scroll="handleScroll('previous')"
        >
          <div class="carousel">
            <div
              class="card"
              v-for="(product, index) in previousProducts"
              :key="product.id"
              @click="goToProductPage(product.id)"
              :class="{ 'active': currentIndexes.previous === index }"
            >
              <div class="card-body">
                <img
                  :src="product.imageUrl"
                  alt="Product Image"
                  class="product-image"
                />
                <h5 class="card-title">{{ product.Nama }}</h5>
                <p class="card-text" :class="{ 'strikethrough': product.Harga_diskon }">
                  Harga: {{ formatPrice(product.Harga) }}
                </p>
                <p v-if="product.Harga_diskon" class="card-text discount-price">
                  Harga Diskon: {{ formatPrice(product.Harga_diskon) }}
                </p>
                <p class="card-text">
                  {{ product.Stok > 0 ? '(Tersedia)' : '(Kosong)' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Navigation buttons (only show when more than threshold) -->
        <button 
          v-if="shouldShowNavigation('previous')"
          class="carousel-button prev" 
          @click="scroll('previous', -1)"
        >❮</button>
        <button 
          v-if="shouldShowNavigation('previous')"
          class="carousel-button next" 
          @click="scroll('previous', 1)"
        >❯</button>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      products: [
        { id: 1, name: "WARUNG" },
        { id: 2, name: "PRODUK" },
        { id: 3, name: "KATEGORI" },
      ],
      previousProducts: [],
      popularProducts: [],
      newProducts: [],
      currentIndexes: {
        new: 0,
        popular: 0,
        previous: 0
      },
      autoScrollIntervals: {
        new: null,
        popular: null,
        previous: null
      },
      scrollAmount: 300,
      isScrolling: {
        new: false,
        popular: false,
        previous: false
      },
      isMobile: window.innerWidth <= 768
    };
  },
  methods: {
    handleMainProductClick(productName) {
      const routes = {
        'WARUNG': '/Warung',
        'PRODUK': '/Produk',
        'KATEGORI': '/Kategori'
      };
      this.$router.push(routes[productName] || `/DetilProduk/${productName.id}`);
    },
    goToProductPage(productId) {
      this.$router.push(`/DetilProduk/${productId}`);
    },
    async fetchProducts(productIds) {
      const fetchedProducts = [];
      for (const id of productIds) {
        try {
          const response = await axios.get(
            `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/products/${id}`
          );
          fetchedProducts.push({
            ...response.data,
            imageUrl: `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/images/${response.data.id}`,
          });
        } catch (error) {
          console.warn(`Product ID ${id} could not be fetched: ${error.message}`);
        }
      }
      return fetchedProducts;
    },
    async fetchNewProducts() {
      try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const formattedDate = threeDaysAgo.toISOString().slice(0, 19).replace('T', ' ');
        
        const response = await axios.get(`${process.env.VUE_APP_PRODUCT_SERVICE_URL}/products`, {
          params: { newSince: formattedDate }
        });
        
        this.newProducts = response.data.map(product => ({
          ...product,
          imageUrl: product.imageUrl || `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/images/${product.id}`
        }));
      } catch (error) {
        console.error("Error fetching new products:", error);
      }
    },
    isNewProduct(createdAt) {
      if (!createdAt) return false;
      const productDate = new Date(createdAt);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return productDate > threeDaysAgo;
    },
    async fetchRiwayatTransaksi() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history`, {
          params: {
            description: "Lunas"
          }
        });
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

        return transactionsWithItems;
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        return [];
      }
    },
    async fetchPreviousProducts() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      if (user && user.id) {
        try {
          const transactions = await this.fetchRiwayatTransaksi();
          const userTransactions = transactions.filter(
            (transaction) => transaction.user === user.id
          );

          const lunasTransactions = userTransactions.filter(
            (transaction) => transaction.description === "Lunas"
          );

          const productIds = [
            ...new Set(
              lunasTransactions.flatMap((transaction) =>
                transaction.items.map((item) => item.itemid)
              )
            ),
          ];

          this.previousProducts = await this.fetchProducts(productIds);
        } catch (error) {
          console.error("Error fetching previous products:", error);
        }
      }
    },
    async fetchPopularProducts() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_TRANSACTIONS_SERVICE_URL}/transactions-history-items`
        );
        const items = response.data;

        const productCountMap = items.reduce((acc, item) => {
          acc[item.itemid] = (acc[item.itemid] || 0) + 1;
          return acc;
        }, {});

        const popularProductIds = Object.keys(productCountMap).filter(
          (productId) => productCountMap[productId] > 5
        );

        this.popularProducts = await this.fetchProducts(popularProductIds);
      } catch (error) {
        console.error("Error fetching popular products:", error);
      }
    },
    formatPrice(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(value);
    },
    setupAutoScroll(section) {
      const products = this[`${section}Products`];
      if (products.length <= this.getThreshold()) return;
      
      this.autoScrollIntervals[section] = setInterval(() => {
        if (!this.isScrolling[section]) {
          this.scroll(section, 1);
        }
      }, 3000);
    },
    pauseAutoScroll(section) {
      if (this.autoScrollIntervals[section]) {
        clearInterval(this.autoScrollIntervals[section]);
        this.autoScrollIntervals[section] = null;
      }
    },
    resumeAutoScroll(section) {
      if (!this.autoScrollIntervals[section] && this[`${section}Products`].length > this.getThreshold()) {
        this.setupAutoScroll(section);
      }
    },
    handleScroll(section) {
      const products = this[`${section}Products`];
      if (products.length <= this.getThreshold()) return;
      
      const carousel = this.$refs[`${section}Carousel`];
      if (!carousel) return;

      const cardWidth = this.scrollAmount;
      const scrollPosition = carousel.scrollLeft;
      this.currentIndexes[section] = Math.round(scrollPosition / cardWidth) % products.length;
    },
    scroll(section, direction) {
      const products = this[`${section}Products`];
      if (products.length <= this.getThreshold()) return;
      
      const carousel = this.$refs[`${section}Carousel`];
      if (carousel && !this.isScrolling[section]) {
        this.isScrolling[section] = true;
        
        const newIndex = (this.currentIndexes[section] + direction + products.length) % products.length;
        this.currentIndexes[section] = newIndex;
        
        carousel.scrollTo({
          left: newIndex * this.scrollAmount,
          behavior: 'smooth'
        });
        
        setTimeout(() => {
          this.isScrolling[section] = false;
        }, 500);
      }
    },
    shouldShowNavigation(section) {
      const products = this[`${section}Products`];
      return products.length > this.getThreshold();
    },
    shouldShowSingleProduct(section) {
      const products = this[`${section}Products`];
      return products.length <= this.getThreshold();
    },
    getThreshold() {
      return this.isMobile ? 3 : 5;
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    
    this.fetchPopularProducts().then(() => {
      if (this.popularProducts.length > this.getThreshold()) {
        this.$nextTick(() => {
          const carousel = this.$refs.popularCarousel;
          if (carousel) {
            carousel.scrollLeft = 0;
          }
          this.setupAutoScroll('popular');
        });
      }
    });
    
    this.fetchPreviousProducts().then(() => {
      if (this.previousProducts.length > this.getThreshold()) {
        this.$nextTick(() => {
          const carousel = this.$refs.previousCarousel;
          if (carousel) {
            carousel.scrollLeft = 0;
          }
          this.setupAutoScroll('previous');
        });
      }
    });
    
    this.fetchNewProducts().then(() => {
      if (this.newProducts.length > this.getThreshold()) {
        this.$nextTick(() => {
          const carousel = this.$refs.newCarousel;
          if (carousel) {
            carousel.scrollLeft = 0;
          }
          this.setupAutoScroll('new');
        });
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    ['new', 'popular', 'previous'].forEach(section => {
      this.pauseAutoScroll(section);
    });
  },
};
</script>

<style scoped>
.dashboard-container {
  padding: 0.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Mobile styles */
@media (max-width: 768px) {
  .main-products-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
    justify-items: center;
  }

  .main-product {
    aspect-ratio: 1/1;
    position: relative;
    width: 100%;
  }

  .main-product-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  .main-product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }

  .main-product-title {
    position: relative;
    z-index: 1;
    background: rgba(0,0,0,0.6);
    color: white;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    margin: 0;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    width: 90%;
  }

  /* Carousel styles */
  .carousel-container {
    position: relative;
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
  }

  .carousel-wrapper {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .carousel-wrapper::-webkit-scrollbar {
    display: none;
  }

  .carousel {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .card {
    flex: 0 0 auto;
    width: 120px;
    scroll-snap-align: start;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }

  .card-body {
    padding: 0.5rem;
    text-align: center;
  }

  .card-title {
    font-size: 11px;
    font-weight: bold;
    margin: 0.25rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -moz-box;
    -moz-box-orient: vertical;
    -moz-line-clamp: 2;
    display: box;
    line-clamp: 2;
    box-orient: vertical;
    overflow: hidden;
    min-height: 2.4em;
    line-height: 1.2;
  }

  .card-text {
    font-size: 10px;
    margin: 0.1rem 0;
    line-height: 1.2;
  }

  .product-image {
    width: 100%;
    height: 80px;
    object-fit: cover;
  }

  .carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 12px;
    cursor: pointer;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-button.prev {
    left: 5px;
  }

  .carousel-button.next {
    right: 5px;
  }

  .section-title {
    text-align: center;
    font-size: 16px;
    margin: 0.75rem 0;
  }

  .new-badge {
    background-color: #4CAF50;
    color: white;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: bold;
    display: inline-block;
  }

  .strikethrough {
    text-decoration: line-through;
    color: gray;
  }

  .discount-price {
    color: red;
    font-weight: bold;
  }

  /* Center single product */
  .single-product-container {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
  }
}

/* Desktop styles */
@media (min-width: 769px) {
  .dashboard-container {
    padding: 30px;
  }

  .main-products-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 1rem 2rem 2rem 2rem;
    margin: 1rem 0 2rem 0;
    justify-items: center;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }

  .main-product {
    aspect-ratio: 1/1;
    position: relative;
    width: 100%;
    max-width: 280px;
    cursor: pointer;
    transition: transform 0.2s ease;
    margin: 0.5rem;
  }

  .main-product:hover {
    transform: scale(1.05);
  }

  .main-product-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  .main-product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }

  .main-product-title {
    position: relative;
    z-index: 1;
    background: rgba(0,0,0,0.6);
    color: white;
    font-size: 18px;
    padding: 8px 12px;
    border-radius: 6px;
    margin: 0;
    text-align: center;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
    width: 90%;
  }

  .section-title {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    margin: 30px 0;
  }

  .carousel-container {
    position: relative;
    width: 100%;
    margin: 30px auto;
    overflow: hidden;
  }

  .carousel-wrapper {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .carousel-wrapper::-webkit-scrollbar {
    display: none;
  }

  .carousel {
    display: flex;
    gap: 2rem;
    padding: 1.5rem;
  }

  .card {
    flex: 0 0 auto;
    width: 220px;
    margin: 0.5rem;
    scroll-snap-align: start;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }

  .card:hover {
    transform: scale(1.05);
  }

  .card-body {
    padding: 1rem;
  }

  .card-title {
    font-size: 16px;
    font-weight: bold;
    margin: 0.5rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -moz-box;
    -moz-box-orient: vertical;
    -moz-line-clamp: 2;
    display: box;
    line-clamp: 2;
    box-orient: vertical;
    overflow: hidden;
  }

  .card-text {
    font-size: 14px;
    margin: 0.25rem 0;
  }

  .product-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  .carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 20px;
    cursor: pointer;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel-button.prev {
    left: 10px;
  }

  .carousel-button.next {
    right: 10px;
  }

  .carousel-button:hover {
    background: rgba(0,0,0,0.8);
  }

  .new-badge {
    background-color: #4CAF50;
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    display: inline-block;
  }

  .strikethrough {
    text-decoration: line-through;
    color: gray;
  }

  .discount-price {
    color: red;
    font-weight: bold;
  }

  .section-new, .section-popular, .section-previous {
    margin: 40px 0;
  }

  /* Center single product */
  .single-product-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }
}
</style>