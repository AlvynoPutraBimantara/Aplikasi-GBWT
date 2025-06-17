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
import Penjualan from "./components/Penjualan.vue";
import Dagangan from "./components/Dagangan.vue";
import TambahDagangan from "./components/TambahDagangan.vue";
import Cart from "./components/Cart.vue";
import Orders from "./components/Orders.vue";
import ProfilAdmin from "./components/ProfilAdmin.vue";
import Informasi from "./components/Informasi.vue";
import LandingPage from "./components/LandingPage.vue";
import GuestSidebar from "./components/GuestSidebar.vue";
import UserUpdateProduk from "./components/UserUpdateProduk.vue";
import RiwayatTransaksi from "./components/RiwayatTransaksi.vue";
import GuestDashboard from "./components/GuestDashboard.vue";
import ForgotPassword from "./components/ForgotPassword.vue";

const routes = [
  {
    path: "/",
    name: "LandingPage",
    component: LandingPage,
  },
  {
    name: "UserUpdateProduk",
    component: UserUpdateProduk,
    path: "/UserUpdateProduk/:id",
  },
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
    name: "ProfilAdmin",
    component: ProfilAdmin,
    path: "/ProfilAdmin/:id",
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
  {
    name: "Penjualan",
    component: Penjualan,
    path: "/Penjualan",
  },
  {
    name: "Dagangan",
    component: Dagangan,
    path: "/Dagangan",
  },
  {
    name: "TambahDagangan",
    component: TambahDagangan,
    path: "/TambahDagangan",
  },
  {
    name: "Cart",
    component: Cart,
    path: "/Cart",
  },
  {
    name: "Orders",
    component: Orders,
    path: "/Orders",
  },
  {
    name: "Informasi",
    component: Informasi,
    path: "/Informasi",
  },
  {
    name: "GuestSidebar",
    component: GuestSidebar,
    path: "/GuestSidebar",
  },
  {
    name: "RiwayatTransaksi",
    component: RiwayatTransaksi,
    path: "/RiwayatTransaksi",
  },
  {
    name: "GuestDashboard",
    component: GuestDashboard,
    path: "/GuestDashboard",
  },
 {
  name: "ForgotPassword",
  component: ForgotPassword,
  path: "/forgot-password"  // <- lowercase with hyphen
},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const userInfo = localStorage.getItem("user-info");
  const isGuest = localStorage.getItem("isGuest") === "true";
  
  const publicRoutes = ["LandingPage", "Login", "SignUp", "ForgotPassword"];
  const guestRoutes = ["GuestDashboard", "Warung", "Produk", "Kategori", "Cart", "Orders", "DetilProduk", "DetilKategori", "DetilWarung"];

  // Allow public routes
  if (publicRoutes.includes(to.name)) {
    return next();
  }

  // Special case: Allow Dashboard access right after signup
  if (to.name === "Dashboard" && userInfo && !token) {
    localStorage.setItem("token", "temp-auth-token"); // Set temporary token
    return next();
  }

  try {
    const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
    
    // Handle authenticated users
    if ((token || parsedUserInfo) && !isGuest) {
      if (to.meta.requiresAdmin && parsedUserInfo?.role !== "admin") {
        return next({ name: "Dashboard" });
      }
      return next();
    }

    // Handle guest users
    if (isGuest) {
      if (guestRoutes.includes(to.name)) {
        return next();
      }
      return next({ name: "GuestDashboard" });
    }

    // Redirect to login for all other cases
    next({ name: "Login" });
  } catch (error) {
    console.error("Error in router guard:", error);
    next({ name: "LandingPage" });
  }
});

export default router;
