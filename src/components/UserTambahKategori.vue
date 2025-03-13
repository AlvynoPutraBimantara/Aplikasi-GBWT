<template>

  <h1>Tambah Kategori</h1>
  <form class="tambah">
    <input
      type="text"
      name="Kategori"
      placeholder="Masukan Nama Kategori"
      v-model="datakategori"
    />
    <button type="button" v-on:click="TambahKategori">Tambah Kategori</button>
  </form>
</template>

<script>

import axios from "axios";

export default {
  name: "TambahKategori",
  components: {
   
  },
  data() {
    return {
      datakategori: "",
    };
  },
  methods: {
    async TambahKategori() {
      console.warn(this.datakategori);
      const result = await axios.post("http://localhost:3000/DataKategori", {
        Kategori: this.datakategori,
      });
      if (result.status == 201) {
        this.$router.push({ name: "DataKategori" });
      }
      console.warn("result", result);
    },
  },
  mounted() {
    let user = localStorage.getItem("user-info");
    if (!user) {
      this.$router.push({ name: "SignUp" });
    }
  },
};
</script>

<style>
.tambah input {
  display: block;
  margin-bottom: 10px;
}
</style>
