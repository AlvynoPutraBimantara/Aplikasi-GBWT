// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUtensils,
  faGlassMartiniAlt,
  faTshirt,
  faCarrot,
} from "@fortawesome/free-solid-svg-icons";

library.add(faUtensils, faGlassMartiniAlt, faTshirt, faCarrot);

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(router).mount("#app");
