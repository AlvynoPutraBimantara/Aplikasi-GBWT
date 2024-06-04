<template>
  <div class="sidebar">
    <ul class="list-unstyled">
      <li>
        <router-link to="/Dashboard">Dashboard</router-link>
      </li>
      <li>
        <router-link to="/Produk">Produk</router-link>
      </li>
      <li>
        <router-link to="/Kategori">Kategori</router-link>
      </li>
      <li>
        <router-link to="/Warung">Warung</router-link>
      </li>
      <li>
        <router-link to="/Cart">Cart</router-link>
      </li>
      <li>
        <button @click="$emit('logout')">Logout</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "GuestSidebar",
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  padding: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin: 10px 0;
}

.sidebar a {
  text-decoration: none;
  color: #333;
}

.sidebar button {
  background-color: darkblue;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.sidebar button:hover {
  background-color: navy;
}
</style>
