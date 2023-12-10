import AuthenticationEndpoint from "../api/Admin-APIs/Authentication/AuthenticationEndpoints.js";
import ProductRoute from "../api/Admin-APIs/Product/ProductEndpoint.js";
import SellerEndpoint from "../api/Admin-APIs/Seller/SellerEndpoint.js";
import TransactionEndpoint from "../api/Admin-APIs/Transaction/TransactionEndpoint.js";
import UserRoute from "../api/Admin-APIs/User/UserEndpoint.js";

const AdminRootRoute = (app) => {
  app.use(AuthenticationEndpoint);
  app.use(UserRoute);
  app.use(ProductRoute);
  app.use(TransactionEndpoint);
  app.use(SellerEndpoint);
};
export default AdminRootRoute;
