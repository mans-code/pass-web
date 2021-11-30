import * as React from "react";
import { HotKeys } from "react-keyboard";
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from "@material-ui/core/styles";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useTranslation } from "react-i18next";
import { BioKitManager } from "../BioKitManager";
import { Toast } from "../Alerts";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
  useUserToken,
  useUserStore,
  useUserDispatch,
  ACTIONS,
} from "store/user-store";
import useShortcuts from "hooks/useShortcuts";

const SIDEBAR_WIDTH = 200;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      minHeight: "100vh",
      flexDirection: "column",
      overflowX: "hidden",
      textAlign: "left",
      letterSpacing: "0px !important",
    },
    header: {
      [theme.breakpoints.up("md")]: {
        marginLeft: SIDEBAR_WIDTH,
      },
    },
    content: {
      textAlign: "left",
      flexGrow: 1,
      padding: theme.spacing(2),
      display: "flex",
      flexDirection: "column",
      "& > div": { flexGrow: 1 },
      [theme.breakpoints.up("md")]: {
        padding: theme.spacing(3),
        marginLeft: SIDEBAR_WIDTH,
      },
    },
  })
);

type Props = {
  children: React.ReactNode;
};

export default function Root({ children }: Props) {
  const classes = useStyles();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const userStore = useUserStore();
  const userDispatch = useUserDispatch();
  const { keyHandlers, keyMap } = useShortcuts();

  /** Custom hook to manage user token refresh */
  useUserToken();

  /** Show inactive alert if user is idle & token will expire */
  React.useEffect(() => {
    if (userStore.tokenWillExpire) {
      setSnackbarText(t("common->timeout"));
      setSnackbarOpen(true);
      userDispatch({
        type: ACTIONS.SET_TOKEN_WILL_EXPIRE,
      });
    }
  }, [userStore.tokenWillExpire]);

  /** Close/Open side menu when screen is resized to desktop */
  React.useEffect(() => {
    setMenuOpen(desktop);
  }, [desktop]);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleMenuOpen = React.useCallback(
    () => setMenuOpen((prev) => !prev),
    []
  );

  return (
    <BioKitManager>
      <HotKeys keyMap={keyMap} handlers={keyHandlers}>
        <div className={classes.root}>
          <div className={classes.header}>
            <Header handleMenuOpen={handleMenuOpen}></Header>
          </div>
          <Sidebar open={menuOpen} handleMenuOpen={handleMenuOpen}></Sidebar>
          <main className={classes.content}>{children}</main>
          <Toast
            open={snackbarOpen}
            onClose={handleSnackbarClose}
            text={snackbarText}
          />
        </div>
      </HotKeys>
    </BioKitManager>
  );
}
