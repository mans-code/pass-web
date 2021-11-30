import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
/** Layout Components */
import Home from "components/Home";
import Layout from "./components/Layout";
/** Pages Components */
import AuthContainer from "pages/auth";
import Login from "pages/auth/login";
import ResetPassword from "pages/auth/reset-password";
import CitizenCrossing from "pages/crossing";
import Admin from "pages/admin";
import Profile from "pages/profile";
import Policies from "pages/admin/policies";
import Translations from "pages/admin/translations";
import QrCode from "pages/profile/qr-code";
import VpnConfig from "pages/profile/vpn-config";
/** User Store */
import { UserStore } from "store/user-store";

type PageRoute = {
  path: string;
  name: string;
  Component: React.FunctionComponent;
  auth?: boolean;
  exact?: boolean;
};

export const routes: PageRoute[] = [
  {
    path: "/login",
    name: "Login",
    Component: Login,
    exact: true,
  },
  {
    path: "/reset-password",
    name: "Reset Password",
    Component: ResetPassword,
    exact: true,
  },
  {
    path: "/",
    name: "Homepage",
    Component: Home,
    auth: true,
    exact: true,
  },
  {
    path: "/departure",
    name: "Departure",
    Component: CitizenCrossing,
    auth: true,
  },
  {
    path: "/arrival",
    name: "Arrival",
    Component: CitizenCrossing,
    auth: true,
  },
  {
    path: "/admin",
    name: "Admin",
    Component: Admin,
    auth: true,
    exact: true,
  },
  {
    path: "/admin/policies",
    name: "Policies",
    Component: Policies,
    auth: true,
    exact: true,
  },
  {
    path: "/admin/translations",
    name: "Translations",
    Component: Translations,
    auth: true,
    exact: true,
  },
  {
    path: "/profile",
    name: "Profile",
    Component: Profile,
    auth: true,
    exact: true,
  },
  {
    path: "/profile/qr-code",
    name: "QR Code",
    Component: QrCode,
    auth: true,
    exact: true,
  },
  {
    path: "/profile/install-ovpn-config",
    name: "VPN Config",
    Component: VpnConfig,
    auth: true,
    exact: true,
  },
];

const buildRoutes = (r: PageRoute[]) =>
  r.map(({ path, exact, Component, name }) => (
    <Route key={path} path={path} exact={exact} component={Component} />
  ));

const loginRoutes = () => buildRoutes(routes.filter((route) => !route.auth));
const authRoutes = () => buildRoutes(routes.filter((route) => route.auth));

// TODO: Refactor isAuthenticated
const isAuthenticated = () => sessionStorage.loggedIn === "true";

const PrivateRoute = () => {
  return isAuthenticated() ? (
    <UserStore>
      <Layout>{authRoutes()}</Layout>
    </UserStore>
  ) : (
    <Redirect to="/login" />
  );
};

// TODO: create auth pages and move this component there
const AuthRoutes = () => <AuthContainer>{loginRoutes()}</AuthContainer>;

export default function AppRouter() {
  return (
    <Router basename="/pass/web">
      <Switch>
        <Route path="/:path(login|reset-password)">
          <AuthRoutes />
        </Route>
        <PrivateRoute />
      </Switch>
    </Router>
  );
}
