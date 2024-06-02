<template>
  <UserHeader />
  <h1>Tambah Produk</h1>
  <form class="tambah" @submit.prevent="submitProduct">
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
    <input
      type="text"
      name="Stok"
      placeholder="Masukan Stok Produk"
      v-model="DataProduk.Stok"
    />
    <input type="file" @change="onImageChange" />
    <button type="submit">Tambah Produk</button>
  </form>
</template>

<script>
import UserHeader from "./UserHeader.vue";
import axios from "axios";

export default {
  name: "TambahDagangan",
  components: {
    UserHeader,
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
      imageFile: null,
    };
  },
  methods: {
    async submitProduct() {
      try {
        let user = JSON.parse(localStorage.getItem("user-info"));
        if (user && user.NamaWarung) {
          this.DataProduk.Pedagang = user.NamaWarung;
          if (this.imageFile) {
            const formData = new FormData();
            formData.append("image", this.imageFile);
            const response = await axios.post(
              "http://localhost:3001/uploads",
              formData
            );
            this.DataProduk.imageUrl = `http://localhost:3001${response.data.imageUrl}`;
          }
          const result = await axios.post(
            "http://localhost:3000/DataProduk",
            this.DataProduk
          );
          if (result.status === 201) {
            this.$router.push({ name: "Dagangan" });
          }
        } else {
          this.$router.push({ name: "Login" });
        }
      } catch (error) {
        console.error("Error adding product:", error);
        alert(
          "An error occurred while adding the product. Please try again later."
        );
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
    onImageChange(event) {
      this.imageFile = event.target.files[0];
    },
  },
  mounted() {
    this.fetchKategori();
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

.tambah button:hover {
  background-color: #0056b3;
}
</style>
