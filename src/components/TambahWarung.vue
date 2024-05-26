// TambahWarung.vue

<template>
  <Header />
  <h1>Tambah Warung</h1>
  <form class="tambah">
    <input
      type="text"
      name="Nama"
      placeholder="Masukan Nama"
      v-model="DataUser.Nama"
    />
    <input
      type="text"
      name="Telp"
      placeholder="Masukan No. Telp"
      v-model="DataUser.Telp"
    />
    <input
      type="text"
      name="Alamat"
      placeholder="Masukan Alamat"
      v-model="DataUser.Alamat"
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
      DataUser: {
        Nama: "",
        Telp: "",
        Alamat: "",
      },
    };
  },
  methods: {
    async TambahWarung() {
      console.warn(this.DataUser);
      const result = await axios.post("http://localhost:3000/User", {
        Nama: this.DataUser.Nama,
        Telp: this.DataUser.Telp,
        Alamat: this.DataUser.Alamat,
      });
      if (result.status == 201) {
        this.$router.push({ name: "DataUser" });
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
