import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./components/Dashboard.vue";
import SignUp from "./components/SignUp.vue";
import Login from "./components/Login.vue";
import TambahWarung from "./components/TambahWarung.vue";
import UpdateWarung from "./components/UpdateWarung.vue";
import DataProduk from "./components/DataProduk.vue";
import TambahProduk from "./components/TambahProduk.vue";
import UpdateProduk from "./components/UpdateProduk.vue";
import DataKategori from "./components/DataKategori.vue";
import TambahKategori from "./components/TambahKategori.vue";
import UpdateKategori from "./components/UpdateKategori.vue";
import DataUser from "./components/DataUser.vue";
import UserTambahProduk from "./components/UserTambahProduk.vue";
import UserHeader from "./components/UserHeader.vue";
import Warung from "./components/Warung.vue";
import Produk from "./components/Produk.vue";
import Kategori from "./components/Kategori.vue";
import Profil from "./components/Profil.vue";
import DetilProduk from "./components/DetilProduk.vue";
import DetilWarung from "./components/DetilWarung.vue";
import DetilKategori from "./components/DetilKategori.vue";

const routes = [
  {
    name: "Dashboard",
    component: Dashboard,
    path: "/Dashboard",
  },
  {
    name: "DataUser",
    component: DataUser,
    path: "/DataUser",
    meta: { requiresAdmin: true },
  },
  {
    name: "SignUp",
    component: SignUp,
    path: "/sign-up",
  },
  {
    name: "Login",
    component: Login,
    path: "/login",
  },
  {
    name: "TambahWarung",
    component: TambahWarung,
    path: "/TambahWarung",
  },
  {
    name: "UpdateWarung",
    component: UpdateWarung,
    path: "/UpdateWarung/:id",
  },
  {
    name: "DataProduk",
    component: DataProduk,
    path: "/DataProduk",
    meta: { requiresAdmin: true },
  },
  {
    name: "TambahProduk",
    component: TambahProduk,
    path: "/TambahProduk",
  },
  {
    name: "UpdateProduk",
    component: UpdateProduk,
    path: "/UpdateProduk/:id",
    meta: { requiresAdmin: true },
  },
  {
    name: "DataKategori",
    component: DataKategori,
    path: "/DataKategori",
    meta: { requiresAdmin: true },
  },
  {
    name: "TambahKategori",
    component: TambahKategori,
    path: "/TambahKategori",
    meta: { requiresAdmin: true },
  },
  {
    name: "UpdateKategori",
    component: UpdateKategori,
    path: "/UpdateKategori/:id",
    meta: { requiresAdmin: true },
  },
  {
    name: "UserTambahProduk",
    component: UserTambahProduk,
    path: "/UserTambahProduk",
  },
  {
    name: "Warung",
    component: Warung,
    path: "/Warung",
  },
  {
    name: "Produk",
    component: Produk,
    path: "/Produk",
  },
  {
    name: "Kategori",
    component: Kategori,
    path: "/Kategori",
  },
  {
    name: "Profil",
    component: Profil,
    path: "/Profil/:id",
  },
  {
    name: "DetilProduk",
    component: DetilProduk,
    path: "/DetilProduk/:id",
  },
  {
    name: "DetilWarung",
    component: DetilWarung,
    path: "/DetilWarung/:id",
  },
  {
    name: "DetilKategori",
    component: DetilKategori,
    path: "/DetilKategori/:id",
  },
  {
    name: "UserHeader",
    component: UserHeader,
    path: "/UserHeader",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user-info"));
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (user && user.role === "admin") {
      next();
    } else {
      next({ name: "Dashboard" });
    }
  } else {
    next();
  }
});

export default router;
