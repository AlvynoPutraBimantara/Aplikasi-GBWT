<template>
  <div>
    <UserHeader />
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Cari Warung..." />
    </div>
    <div
      class="warung"
      v-for="(user, index) in filteredUsers"
      :key="index"
      @click="goToWarungPage(user.id)"
    >
      <h3>{{ user.NamaWarung }}</h3>
    </div>
  </div>
</template>

<script>
import UserHeader from "./UserHeader.vue";
import axios from "axios";

export default {
  components: {
    UserHeader,
  },
  data() {
    return {
      users: [],
      searchQuery: "",
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter((user) =>
        user.NamaWarung.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    goToWarungPage(userId) {
      this.$router.push({ name: "DetilWarung", params: { id: userId } });
    },
    async loadUsers() {
      try {
        const response = await axios.get("http://localhost:3000/User");
        this.users = response.data;
      } catch (error) {
        console.error("Error loading users:", error);
      }
    },
  },
  mounted() {
    this.loadUsers();
  },
};
</script>

<style scoped>
.search-container {
  margin: 20px;
  text-align: left;
}
.search-container input {
  padding: 10px;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.warung {
  border: 1px solid #ccc;
  padding: 20px;
  margin: 10px;
  width: 200px;
  display: inline-block;
  cursor: pointer;
}
</style>
