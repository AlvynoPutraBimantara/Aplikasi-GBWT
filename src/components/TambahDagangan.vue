<template>
  <div>
    <h1>Tambah Produk</h1>
    <div class="update-container">
      <form class="update" @submit.prevent="submitProduct">
        <input
          type="text"
          name="Nama"
          placeholder="Masukan Nama Produk"
          v-model="DataProduk.Nama"
        />
        <input
          type="text"
          name="Harga"
          placeholder="Masukan Harga Produk"
          v-model="DataProduk.Harga"
        />
        <select v-model="DataProduk.Kategori">
          <option disabled value="">Pilih Kategori</option>
          <option
            v-for="kategori in kategoriList"
            :key="kategori.id"
            :value="kategori.category"
          >
            {{ kategori.category }}
          </option>
        </select>
        <input
          type="text"
          name="Keterangan"
          placeholder="Masukan Keterangan Produk"
          v-model="DataProduk.Keterangan"
        />
        <input
          type="text"
          name="Stok"
          placeholder="Masukan Stok Produk"
          v-model="DataProduk.Stok"
        />
        <input type="file" @change="onImageChange" />
        <button type="submit">Tambah Produk</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TambahDagangan",
  data() {
    return {
      DataProduk: {
        Nama: "",
        Harga: "",
        Kategori: "",
        Keterangan: "",
        Pedagang: "", // To hold NamaWarung
        Stok: "",
      },
      kategoriList: [],
      imageFile: null,
    };
  },
  methods: {
    async submitProduct() {
      try {
        const formData = new FormData();
        formData.append("Nama", this.DataProduk.Nama);
        formData.append("Harga", this.DataProduk.Harga);
        formData.append("Kategori", this.DataProduk.Kategori);
        formData.append("Keterangan", this.DataProduk.Keterangan);
        formData.append("Pedagang", this.DataProduk.Pedagang);
        formData.append("Stok", this.DataProduk.Stok);
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        const response = await axios.post(
          "http://localhost:3002/products",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log(response.data.message);
        this.$router.push("/Dagangan");
      } catch (error) {
        console.error("Error submitting product:", error.response?.data || error.message);
      }
    },
    async fetchKategori() {
      try {
        const response = await axios.get("http://localhost:3006/categories");
        this.kategoriList = response.data.map((item) => ({
          id: item.id,
          category: item.category,
        }));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    onImageChange(event) {
      this.imageFile = event.target.files[0];
    },
  },
  created() {
    const userInfo = JSON.parse(localStorage.getItem("user-info"));
    this.DataProduk.Pedagang = userInfo?.NamaWarung || "Unknown";
  },
  mounted() {
    this.fetchKategori();
  },
};
</script>

<style scoped>
.update-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.update {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.update input,
.update select,
.update button {
  display: block;
  margin-bottom: 10px;
  padding: 10px;
  width: 400px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.update button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.update button:hover {
  background-color: #0056b3;
}
</style>
