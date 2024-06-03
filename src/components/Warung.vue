<template>
  <div>
    <UserHeader />
    <div class="search-container">
      <input type="text" v-model="searchQuery" placeholder="Cari Warung..." />
    </div>
    <div class="categories-container">
      <div
        class="card"
        v-for="(user, index) in filteredUsers"
        :key="index"
        @click="goToWarungPage(user.id)"
        style="width: 15rem; cursor: pointer; margin: 10px"
      >
        <div class="card-body">
          <img
            :src="user.imageUrl"
            alt="Warung Image"
            style="width: 100%; height: auto"
          />
          <h5 class="card-title">{{ user.NamaWarung }}</h5>
        </div>
      </div>
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
      return this.users
        .filter((user) => user.role !== "admin")
        .filter((user) =>
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
        this.users = response.data.filter((user) => user.role !== "admin");
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

.categories-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 10px;
  cursor: pointer;
  width: 15rem;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 1px 1px 1px black;
}

.card-body {
  padding: 20px;
}

.card-title {
  padding-top: 20px;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}
</style>
