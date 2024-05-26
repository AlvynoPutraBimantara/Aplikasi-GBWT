// Profil.vue
<template>
  <Header />
  <h1>Profil</h1>
  <form class="update">
    <input
      type="text"
      name="NamaWarung"
      placeholder="Ubah Nama Warung"
      v-model="User.NamaWarung"
    />
    <input
      type="text"
      name="Nama"
      placeholder="Ubah Nama"
      v-model="User.Nama"
    />
    <input
      type="text"
      name="Telp"
      placeholder="Ubah No. Telp"
      v-model="User.Telp"
    />
    <input
      type="text"
      name="Alamat"
      placeholder="Ubah Alamat"
      v-model="User.Alamat"
    />
    <input
      type="text"
      name="Password"
      placeholder="Ubah Password"
      v-model="User.Password"
    />
    <button type="button" v-on:click="UpdateProfil">Update Data Profil</button>
  </form>
</template>

<script>
import Header from "./Header.vue";
import axios from "axios";

export default {
  name: "Profil",
  components: {
    Header,
  },
  data() {
    return {
      User: {
        NamaWarung: "",
        Nama: "",
        Telp: "",
        Alamat: "",
        Password: "",
      },
    };
  },
  methods: {
    async UpdateProfil() {
      console.warn(this.User);
      const result = await axios.put(
        "http://localhost:3000/User/" + this.$route.params.id,
        {
          NamaWarung: this.User.NamaWarung,
          Nama: this.User.Nama,
          Telp: this.User.Telp,
          Alamat: this.User.Alamat,
          Password: this.User.Password,
        }
      );
      if (result.status === 200) {
        this.$router.push({ name: "Dashboard" });
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
      "http://localhost:3000/User/" + this.$route.params.id
    );
    console.warn(result.data);
    this.User = result.data;
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
