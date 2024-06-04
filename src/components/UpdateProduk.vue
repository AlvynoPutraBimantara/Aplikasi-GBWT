<template>
  <div>
    <Header />
    <h1>Update Produk</h1>
    <form class="update" @submit.prevent="updateProduk">
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
      <input type="file" @change="onImageChange" />
      <button type="submit">Update Data Produk</button>
    </form>
    <form class="delete">
      <button class="delete-btn" @click="deleteProduk">Hapus Produk</button>
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
        id: "",
        Nama: "",
        Harga: "",
        Kategori: "",
        Keterangan: "",
        Pedagang: "",
        Stok: "",
        imageUrl: "",
      },
      kategoriList: [],
      warungList: [],
      imageFile: null,
    };
  },
  methods: {
    async updateProduk() {
      try {
        if (this.imageFile) {
          const formData = new FormData();
          formData.append("image", this.imageFile);
          const response = await axios.post(
            "http://localhost:3001/uploads",
            formData
          );
          this.DataProduk.imageUrl = `http://localhost:3001${response.data.imageUrl}`;
        }
        const result = await axios.put(
          `http://localhost:3000/DataProduk/${this.DataProduk.id}`,
          this.DataProduk
        );
        if (result.status === 200) {
          this.$router.push({ name: "Dagangan" });
        }
      } catch (error) {
        console.error("Error updating product:", error);
        alert(
          "An error occurred while updating the product. Please try again later."
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
    async fetchWarung() {
      try {
        const response = await axios.get("http://localhost:3000/User");
        this.warungList = response.data;
      } catch (error) {
        console.error("Error fetching warungs:", error);
      }
    },
    async fetchProduct() {
      try {
        const productId = this.$route.params.id;
        const response = await axios.get(
          `http://localhost:3000/DataProduk/${productId}`
        );
        this.DataProduk = response.data;
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    },
    onImageChange(event) {
      this.imageFile = event.target.files[0];
    },
    async deleteProduk() {
      try {
        const result = await axios.delete(
          `http://localhost:3000/DataProduk/${this.DataProduk.id}`
        );
        if (result.status === 204) {
          this.$router.push({ name: "Dagangan" });
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(
          "An error occurred while deleting the product. Please try again later."
        );
      }
    },
  },
  mounted() {
    this.fetchKategori();
    this.fetchWarung();
    this.fetchProduct();
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
  width: 400px;
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

.delete {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.delete-btn {
  background-color: red;
  display: block;
  padding: 10px;
  width: 400px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.delete-btn:hover {
  background-color: #c82333;
}
</style>
