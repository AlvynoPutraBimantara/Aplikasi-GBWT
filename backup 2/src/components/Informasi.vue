<template>
  <div>
    <div class="warung-details">
      <h1>Versi aplikasi : Masih Dikembangkan</h1>

      <div class="button-container">
        <button @click="goToWhatsApp" class="whatsapp-button">
          Kontak Admin
          <font-awesome-icon icon="fa-brands fa-whatsapp" />
        </button>
      </div>
      <p>
        Dengan aplikasi GBWT pedagang cukup mengupload barang dagangannya
        beserta informasi relevan dalam aplikasi sekali saja dan update mengenai
        dagangan cukup tentang ketersediaan stok, menghapus atau menambahkan
        produk baru, perubahan harga atau mungkin promo. Untuk pemesanan produk
        konsumen dapat memilih produk yang akan dibeli beserta jumlahnya,
        kemudian akan diarahkan pada keranjang (cart) untuk mengevaluasi kembali
        produk yang akan dipesan, kemudian setelah verifikasi pesanan konsumen
        akan mendapat struk pesanan yang akan tersampaikan kepada pedagang
        melalui sistem atau dengan memanfaatkan fitur “Click to Chat” WhatsApp
        maka penjual dapat menerima pesanan dan berkomunikasi dengan konsumen
        melalui Private Message WhatsApp.
      </p>
    </div>
  </div>
</template>

<script>

export default {
  components: {

  },
  data() {
    return {};
  },
  methods: {
    goToWhatsApp() {
      const whatsappUrl = `https://wa.me/6285156707346`;
      window.open(whatsappUrl, "_blank");
    },
  },
};
</script>

<style scoped>
.warung-details {
  padding: 20px;
  text-align: center; /* Center contents */
}

.button-container {
  display: flex;
  justify-content: center; /* Center button horizontally */
}

.whatsapp-button {
  display: inline-flex;
  align-items: center;
  background-color: #25d366; /* WhatsApp green */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.whatsapp-button font-awesome-icon {
  margin-left: 10px; /* Space between text and icon */
  font-size: 24px; /* Larger icon size */
}

.whatsapp-button:hover {
  background-color: #1ebe57; /* Darker green on hover */
}

.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px;
}

.search-container {
  flex: 1;
  text-align: left;
}

.search-container input {
  padding: 10px;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.select-container {
  padding: 10px;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.products-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
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

.card img {
  width: 100%;
  height: auto;
}
</style>
