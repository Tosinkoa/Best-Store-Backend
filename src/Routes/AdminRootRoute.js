import UserRoute from "../api/Admin-APIs/User/UserEndpoint.js";
import ProductRoute from "../api/Admin-APIs/Product/ProductEndpoint.js";
import TransactionEndpoint from "../api/Admin-APIs/Transaction/TransactionEndpoint.js";
import SellerEndpoint from "../api/Admin-APIs/Seller/SellerEndpoint.js";

const AdminRootRoute = (app) => {
  app.use(UserRoute);
  app.use(ProductRoute);
  app.use(TransactionEndpoint);
  app.use(SellerEndpoint);
};
export default AdminRootRoute;
