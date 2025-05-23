<template>
  <div>
    <!-- Section for main products -->
    <div
      class="product"
      v-for="(product, index) in products"
      :key="index"
      @click="handleMainProductClick(product.name)"
      :style="{
        backgroundImage: `url(${require(`@/assets/images/${product.name.toLowerCase()}.jpg`)})`,
      }"
    >
      <h3>{{ product.name }}</h3>
    </div>

    <!-- Section for new products (added within last 3 days) -->
    <section class="section-new" v-if="newProducts.length > 0">
      <h4 class="section-title">Produk Baru</h4>
      <div class="carousel-container">
        <!-- Single product display -->
        <div v-if="newProducts.length === 1" class="single-product-container">
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
          ref="carousel"
          @mouseenter="pauseAutoScroll"
          @mouseleave="resumeAutoScroll"
          @scroll="handleScroll"
        >
          <div class="carousel">
            <div
              class="card"
              v-for="(product, index) in getCarouselItems()"
              :key="`${index}-${product.id}`"
              @click="goToProductPage(product.id)"
              :data-index="index % newProducts.length"
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
        
        <!-- Navigation buttons (only show when more than 1 product) -->
        <button 
          v-if="newProducts.length > 1"
          class="carousel-button prev" 
          @click="scroll(-1)"
        >❮</button>
        <button 
          v-if="newProducts.length > 1"
          class="carousel-button next" 
          @click="scroll(1)"
        >❯</button>
      </div>
    </section>

    <!-- Section for popular products -->
    <section class="section-popular" v-if="popularProducts.length > 0">
      <h4 class="section-title">Produk Populer</h4>
      <div class="products-container">
        <div
          class="card"
          v-for="(product, index) in popularProducts"
          :key="index"
          @click="goToProductPage(product.id)"
          style="width: 15rem; cursor: pointer; margin: 10px"
        >
          <div class="card-body">
            <img
              :src="product.imageUrl"
              alt="Product Image"
              style="width: 100%; height: auto"
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
    </section>

    <!-- Section for previous purchases -->
    <section class="section-previous">
      <h6 class="section-title">Produk yang anda beli sebelumnya</h6>
      <div class="products-container">
        <div
          class="card"
          v-for="(product, index) in previousProducts"
          :key="index"
          @click="goToProductPage(product.id)"
          style="width: 15rem; cursor: pointer; margin: 10px"
        >
          <div class="card-body">
            <img
              :src="product.imageUrl"
              alt="Product Image"
              style="width: 100%; height: auto"
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
      currentIndex: 0,
      autoScrollInterval: null,
      scrollAmount: 300,
      isScrolling: false,
    };
  },
  methods: {
    getCarouselItems() {
      // Only duplicate items if we have more than 1 but less than 4 products
      return this.newProducts.length > 1 && this.newProducts.length < 4 
        ? [...this.newProducts, ...this.newProducts] 
        : this.newProducts;
    },
    handleMainProductClick(productName) {
      switch(productName) {
        case 'WARUNG':
          this.$router.push('/Warung');
          break;
        case 'PRODUK':
          this.$router.push('/Produk');
          break;
        case 'KATEGORI':
          this.$router.push('/Kategori');
          break;
        default:
          // eslint-disable-next-line no-undef
          this.goToProductPage(product.id);
      }
    },
    goToProductPage(productId) {
      this.$router.push(`/DetilProduk/${productId}`);
    },
async fetchProducts(productIds) {
  const fetchedProducts = [];
  for (const id of productIds) {
    try {
      const response = await axios.get(`http://localhost:3002/products/${id}`);
      fetchedProducts.push({
        ...response.data,
        // Always construct the URL using the product's ID
        imageUrl: `http://localhost:3002/images/${response.data.id}`,
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
        
        const response = await axios.get('http://localhost:3002/products', {
          params: { newSince: formattedDate }
        });
        
        this.newProducts = response.data.map(product => ({
          ...product,
          imageUrl: product.imageUrl || 'default-image.jpg'
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
    const response = await axios.get("http://localhost:3005/transactions-history", {
      params: {
        description: "Lunas" // Add this parameter to filter by "Lunas"
      }
    });
    const transactions = response.data;

    const transactionsWithItems = await Promise.all(
      transactions.map(async (transaction) => {
        const itemsResponse = await axios.get(
          `http://localhost:3005/transactions-history-items/${transaction.id}`
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

      // Additional check for "Lunas" status (though the API should already filter this)
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
        const response = await axios.get("http://localhost:3005/transactions-history-items");
        const items = response.data;

        const productCountMap = items.reduce((acc, item) => {
          acc[item.itemid] = (acc[item.itemid] || 0) + 1;
          return acc;
        }, {});

        const popularProductIds = Object.keys(productCountMap).filter(
          (productId) => productCountMap[productId] > 3
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
    setupAutoScroll() {
      if (this.newProducts.length <= 1) return;
      
      this.autoScrollInterval = setInterval(() => {
        if (!this.isScrolling) {
          this.scroll(1);
        }
      }, 3000);
    },
    pauseAutoScroll() {
      if (this.autoScrollInterval) {
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
      }
    },
    resumeAutoScroll() {
      if (!this.autoScrollInterval && this.newProducts.length > 1) {
        this.setupAutoScroll();
      }
    },
    handleScroll() {
      if (this.newProducts.length <= 1) return;
      
      const carousel = this.$refs.carousel;
      if (!carousel) return;

      const scrollWidth = carousel.scrollWidth / 2;
      const scrollLeft = carousel.scrollLeft;

      if (scrollLeft < scrollWidth / 2) {
        this.isScrolling = true;
        carousel.scrollTo({
          left: scrollLeft + scrollWidth,
          behavior: 'auto'
        });
        this.isScrolling = false;
      }
      else if (scrollLeft > scrollWidth + scrollWidth / 2) {
        this.isScrolling = true;
        carousel.scrollTo({
          left: scrollLeft - scrollWidth,
          behavior: 'auto'
        });
        this.isScrolling = false;
      }

      const cardWidth = this.scrollAmount;
      this.currentIndex = Math.round((scrollLeft % scrollWidth) / cardWidth) % this.newProducts.length;
    },
    scroll(direction) {
      if (this.newProducts.length <= 1) return;
      
      const carousel = this.$refs.carousel;
      if (carousel && !this.isScrolling) {
        this.isScrolling = true;
        
        let newScrollLeft = carousel.scrollLeft + (direction * this.scrollAmount);
        const scrollWidth = carousel.scrollWidth / 2;
        
        if (direction === 1 && newScrollLeft >= scrollWidth * 1.5) {
          newScrollLeft = scrollWidth / 2 + (newScrollLeft - scrollWidth * 1.5);
          carousel.scrollTo({
            left: scrollWidth * 1.5,
            behavior: 'auto'
          });
        }
        else if (direction === -1 && newScrollLeft <= scrollWidth / 2) {
          newScrollLeft = scrollWidth * 1.5 - (scrollWidth / 2 - newScrollLeft);
          carousel.scrollTo({
            left: scrollWidth / 2,
            behavior: 'auto'
          });
        }
        
        carousel.scrollTo({
          left: newScrollLeft,
          behavior: 'smooth'
        });
        
        this.currentIndex = (this.currentIndex + direction + this.newProducts.length) % this.newProducts.length;
        
        setTimeout(() => {
          this.isScrolling = false;
        }, 500);
      }
    },
  },
  mounted() {
    this.fetchPopularProducts();
    this.fetchPreviousProducts();
    this.fetchNewProducts().then(() => {
      if (this.newProducts.length > 0) {
        this.$nextTick(() => {
          const carousel = this.$refs.carousel;
          if (carousel) {
            carousel.scrollLeft = carousel.scrollWidth / 4;
          }
        });
        if (this.newProducts.length > 1) {
          this.setupAutoScroll();
        }
      }
    });
  },
  beforeUnmount() {
    this.pauseAutoScroll();
  },
};
</script>

<style scoped>
/* Your existing styles remain exactly the same */
.products-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
}

.card {
  border: 1px solid #ccc;
  padding: 0;
  margin: 10px;
  width: 200px;
  display: inline-block;
  cursor: pointer;
}

.card:hover {
  box-shadow: 1px 1px 1px black;
}

.card-body {
  padding: 10px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.card-text {
  margin: 5px 0;
}

.strikethrough {
  text-decoration: line-through;
  color: gray;
}

.discount-price {
  color: red;
  font-weight: bold;
}

.card img {
  width: 100%;
  height: auto;
}

.product {
  border: 3px solid black;
  padding: 20px;
  margin: 40px;
  width: 300px;
  height: 300px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
  background-size: cover;
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);
}

.product h3 {
  font-size: 50px;
  font-weight: bold;
  margin: 0;
  color: white;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.5);
}

.section-new {
  margin: 30px 0;
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
  flex-wrap: nowrap;
  padding: 20px 0;
}

.card {
  flex: 0 0 auto;
  width: 15rem;
  margin: 0 10px;
  scroll-snap-align: start;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.05);
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
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
  background: rgba(0, 0, 0, 0.8);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
}

.single-product-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.single-product-container .card {
  margin: 0 auto;
}
</style>