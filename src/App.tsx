import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import RTL from "RTL";
import Router from "Routes";
import AppUpdate from "components/AppUpdate";
import Splash from "components/Splash";
import { arabicTheme, englishTheme } from "utils";
import { useAppStore, useSetTerminal, useClientInfo } from "store/root-store";

export default function App() {
  const appStore = useAppStore();
  const theme = React.useMemo(
    () => (appStore.language === "ar" ? arabicTheme : englishTheme),
    [appStore.language]
  );

  // Get & set terminal info
  useSetTerminal();
  // Get client version and init updater cron job
  useClientInfo();

  // TODO: move terminal success/error to here instead of AuthContainer

  return (
    <ThemeProvider theme={theme}>
      <React.Suspense fallback={<Splash />}>
        {appStore.language === "ar" ? (
          <RTL>
            <div dir="rtl">
              <Router />
            </div>
          </RTL>
        ) : (
          <div>
            <Router />
          </div>
        )}
        <AppUpdate
          updateAvailable={appStore.updateAvailable}
          rtl={appStore.language === "ar"}
        />
      </React.Suspense>
    </ThemeProvider>
  );
}
