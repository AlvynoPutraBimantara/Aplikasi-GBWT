
<template>

  <h1>Update Warung</h1>
  <form class="tambah">
    <input
      type="text"
      name="Nama"
      placeholder="Ubah Nama"
      v-model="DataWarung.Nama"
    />
    <input
      type="text"
      name="Telp"
      placeholder="Ubah No. Telp"
      v-model="DataWarung.Telp"
    />
    <input
      type="text"
      name="Alamat"
      placeholder="Ubah Alamat"
      v-model="DataWarung.Alamat"
    />
    <button type="button" v-on:click="UpdateWarung">Update Data Warung</button>
  </form>
</template>
<script>

import axios from "axios";
export default {
  name: "Update",
  components: {
 
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
    async UpdateWarung() {
      console.warn(this.DataWarung);
      const result = await axios.put(
        "http://localhost:3000/DataWarung/" + this.$route.params.id,
        {
          Nama: this.DataWarung.Nama,
          Telp: this.DataWarung.Telp,
          Alamat: this.DataWarung.Alamat,
        }
      );
      if (result.status == 200) {
        this.$router.push({ name: "DataWarung" });
      }
      console.warn("result", result);
    },
  },
  async mounted() {
    let user = localStorage.getItem("user-info");
    if (!user) {
      this.$router.push({ name: "SignUp" });
    }
    const result = await axios.get(
      "http://localhost:3000/DataWarung/" + this.$route.params.id
    );
    console.warn(result.data);
    this.DataWarung = result.data;
  },
};
</script>
