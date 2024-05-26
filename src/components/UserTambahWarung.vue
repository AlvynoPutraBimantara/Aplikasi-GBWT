// UserTambahWarung.vue

<template>
  <Header />
  <h1>Tambah Warung</h1>
  <form class="tambah">
    <input
      type="text"
      name="Nama"
      placeholder="Masukan Nama"
      v-model="DataWarung.Nama"
    />
    <input
      type="text"
      name="Telp"
      placeholder="Masukan No. Telp"
      v-model="DataWarung.Telp"
    />
    <input
      type="text"
      name="Alamat"
      placeholder="Masukan Alamat"
      v-model="DataWarung.Alamat"
    />
    <button type="button" v-on:click="TambahWarung">Tambah Warung</button>
  </form>
</template>
<script>
import Header from "./Header.vue";
import axios from "axios";
export default {
  name: "Tambah",
  components: {
    Header,
  },
  data() {
    return {
      DataWarung: {
        Nama: "",
        Telp: "",
        Alamat: "",
      },
    };
  },
  methods: {
    async TambahWarung() {
      console.warn(this.DataWarung);
      const result = await axios.post("http://localhost:3000/DataWarung", {
        Nama: this.DataWarung.Nama,
        Telp: this.DataWarung.Telp,
        Alamat: this.DataWarung.Alamat,
      });
      if (result.status == 201) {
        this.$router.push({ name: "DataWarung" });
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
