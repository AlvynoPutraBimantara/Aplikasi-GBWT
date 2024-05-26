<template>
  <Header />
  <h1>Update Kategori</h1>
  <form class="update">
    <input
      type="text"
      name="Kategori"
      placeholder="Ubah Nama Kategori"
      v-model="datakategori"
    />
    <button type="button" @click="updateKategori">Update Data Kategori</button>
  </form>
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
      datakategori: "",
    };
  },
  methods: {
    async updateKategori() {
      try {
        const result = await axios.put(
          `http://localhost:3000/DataKategori/${this.$route.params.id}`,
          {
            Kategori: this.datakategori,
          }
        );
        if (result.status === 200) {
          this.$router.push({ name: "DataKategori" });
        }
      } catch (error) {
        console.error("Error updating kategori:", error);
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
        this.datakategori = result.data.Kategori;
      } catch (error) {
        console.error("Error fetching kategori data:", error);
      }
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
