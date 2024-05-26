<template>
  <Header />
  <h1>Tambah Produk</h1>
  <form class="tambah">
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
        :value="kategori.Kategori"
      >
        {{ kategori.Kategori }}
      </option>
    </select>

    <input
      type="text"
      name="Keterangan"
      placeholder="Masukan Keterangan Produk"
      v-model="DataProduk.Keterangan"
    />

    <select v-model="DataProduk.Pedagang">
      <option disabled value="">Pilih Warung</option>
      <option
        v-for="warung in warungList"
        :key="warung.id"
        :value="warung.NamaWarung"
      >
        {{ warung.NamaWarung }}
      </option>
    </select>

    <input
      type="text"
      name="Stok"
      placeholder="Masukan Stok Produk"
      v-model="DataProduk.Stok"
    />

    <button type="button" v-on:click="TambahProduk">Tambah Produk</button>
  </form>
</template>

<script>
import Header from "./Header.vue";
import axios from "axios";

export default {
  name: "TambahProduk",
  components: {
    Header,
  },
  data() {
    return {
      DataProduk: {
        Nama: "",
        Harga: "",
        Kategori: "",
        Keterangan: "",
        Pedagang: "",
        Stok: "",
      },
      kategoriList: [],
      warungList: [],
    };
  },
  methods: {
    async TambahProduk() {
      try {
        const result = await axios.post(
          "http://localhost:3000/DataProduk",
          this.DataProduk
        );
        if (result.status === 201) {
          this.$router.push({ name: "DataProduk" });
        }
      } catch (error) {
        console.error("Error adding product:", error);
      }
    },
    async fetchKategori() {
      try {
        const response = await axios.get("http://localhost:3000/DataKategori");
        this.kategoriList = response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    async fetchWarung() {
      try {
        const response = await axios.get("http://localhost:3000/User");
        this.warungList = response.data;
      } catch (error) {
        console.error("Error fetching warungs:", error);
      }
    },
  },
  mounted() {
    let user = localStorage.getItem("user-info");
    if (!user) {
      this.$router.push({ name: "SignUp" });
    } else {
      this.fetchKategori();
      this.fetchWarung();
    }
  },
};
</script>

<style scoped>
.tambah {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.tambah input,
.tambah select,
.tambah button {
  display: block;
  margin-bottom: 10px;
  padding: 10px;
  width: 300px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.tambah input::placeholder,
.tambah select::placeholder {
  color: #aaa;
}

.tambah button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.update button:hover {
  background-color: #0056b3;
}
</style>
