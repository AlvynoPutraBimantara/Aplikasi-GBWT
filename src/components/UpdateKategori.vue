<template>
  <div>
    <Header />
    <h1>Update Kategori</h1>
    <div class="update-container">
      <img
        v-if="DataKategori.imageUrl"
        :src="DataKategori.imageUrl"
        alt="Category Image"
        class="category-image"
      />
      <form class="update" @submit.prevent="updateKategori">
        <input
          type="text"
          name="Kategori"
          placeholder="Ubah Nama Kategori"
          v-model="DataKategori.Kategori"
        />
        <input type="file" @change="onImageChange" />
        <button type="submit">Update Data Kategori</button>
      </form>
    </div>
  </div>
</template>

<script>
import Header from "./Header.vue";
import axios from "axios";

export default {
  name: "UpdateKategori",
  components: {
    Header,
  },
  data() {
    return {
      DataKategori: {
        Kategori: "",
        imageUrl: "",
      },
      imageFile: null,
    };
  },
  methods: {
    onImageChange(event) {
      this.imageFile = event.target.files[0];
    },
    async updateKategori() {
      try {
        if (this.imageFile) {
          const formData = new FormData();
          formData.append("image", this.imageFile);
          const response = await axios.post(
            "http://localhost:3001/uploads",
            formData
          );
          this.DataKategori.imageUrl = `http://localhost:3001${response.data.imageUrl}`;
        }
        const result = await axios.put(
          `http://localhost:3000/DataKategori/${this.$route.params.id}`,
          this.DataKategori
        );
        if (result.status === 200) {
          this.$router.push({ name: "DataKategori" });
        }
      } catch (error) {
        console.error("Error updating category:", error);
      }
    },
  },
  async mounted() {
    let user = localStorage.getItem("user-info");
    if (!user) {
      this.$router.push({ name: "SignUp" });
    } else {
      try {
        const result = await axios.get(
          `http://localhost:3000/DataKategori/${this.$route.params.id}`
        );
        this.DataKategori = result.data;
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    }
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

.category-image {
  width: 50%;
  height: auto;
  margin-bottom: 20px;
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
