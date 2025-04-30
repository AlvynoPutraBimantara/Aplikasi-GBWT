import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faHome,
  faShoppingCart,
  faReceipt,
  faCircleInfo,
  faCircleDollarToSlot,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

library.add(
  faHome, 
  faShoppingCart, 
  faWhatsapp, 
  faReceipt, 
  faCircleInfo, 
  faCircleDollarToSlot,
  faEye,
  faEyeSlash
);

export default FontAwesomeIcon;