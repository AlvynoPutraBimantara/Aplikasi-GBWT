// src/fontawesome.js
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faUtensils,
  faGlassMartiniAlt,
  faTshirt,
  faCarrot,
} from "@fortawesome/free-solid-svg-icons";

library.add(faUtensils, faGlassMartiniAlt, faTshirt, faCarrot);

export { FontAwesomeIcon };
