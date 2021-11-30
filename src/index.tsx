import * as React from "react";
import ReactDOM from "react-dom";
import "index.css";
import App from "App";
import * as serviceWorker from "serviceWorker";
import "i18n";
import CssBaseline from "@material-ui/core/CssBaseline";
import { AppStore } from "store/root-store";

ReactDOM.render(
  <AppStore>
    <CssBaseline />
    <App />
  </AppStore>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
