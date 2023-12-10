import AuthEndpoint from "../api/General-APIs/AuthenticationEndpoint.js";

const GeneralRootRoute = (app) => {
  app.use(AuthEndpoint);
};
export default GeneralRootRoute;
