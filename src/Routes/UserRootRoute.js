import AuthenticationRoute from "../api/User-APIs/Authentication/AuthenticationEndpoints.js";
import SellerRoute from "../api/User-APIs/Seller/SellerEndpoints.js";
import ProductRoute from "../api/User-APIs/Product/ProductEndpoints.js";
import CartRoute from "../api/User-APIs/Cart/CartEndpoints.js";
import BargainRoute from "../api/User-APIs/Bargain/BargainEndpoints.js";
import SavedItemsRoute from "../api/User-APIs/SavedItems/SavedItemsEndpoints.js";

const UserRootRoute = (app) => {
  app.use(AuthenticationRoute);
  app.use(SellerRoute);
  app.use(ProductRoute);
  app.use(CartRoute);
  app.use(BargainRoute);
  app.use(SavedItemsRoute);
};
export default UserRootRoute;
