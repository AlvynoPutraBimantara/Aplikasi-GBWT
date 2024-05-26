<template>
  <div>
    <Header />
    <h1>Update Produk</h1>
    <form class="update">
      <input
        type="text"
        name="Nama"
        placeholder="Ubah Nama Produk"
        v-model="DataProduk.Nama"
      />
      <input
        type="text"
        name="Harga"
        placeholder="Ubah Harga Produk"
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
        placeholder="Ubah Keterangan Produk"
        v-model="DataProduk.Keterangan"
      />
      <select v-model="DataProduk.Pedagang">
        <option disabled value="">Pilih Pedagang</option>
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
        placeholder="Ubah Stok Produk"
        v-model="DataProduk.Stok"
      />
      <button type="button" @click="UpdateProduk">Update Data Produk</button>
    </form>
  </div>
</template>

<script>
import Header from "./Header.vue";
import axios from "axios";

export default {
  name: "UpdateProduk",
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
    async UpdateProduk() {
      try {
        const result = await axios.put(
          `http://localhost:3000/DataProduk/${this.$route.params.id}`,
          this.DataProduk
        );
        if (result.status === 200) {
          this.$router.push({ name: "DataProduk" });
        }
      } catch (error) {
        console.error("Error updating product:", error);
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
  async mounted() {
    let user = localStorage.getItem("user-info");
    if (!user) {
      this.$router.push({ name: "SignUp" });
    } else {
      this.fetchKategori();
      this.fetchWarung();
      const result = await axios.get(
        `http://localhost:3000/DataProduk/${this.$route.params.id}`
      );
      this.DataProduk = result.data;
    }
  },
};
</script>

<style scoped>
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
  width: 300px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.update input::placeholder,
.update select::placeholder {
  color: #aaa;
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
