import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Language from "@material-ui/icons/Language";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  useAppStore,
  useChangeLanguage,
  useSetTerminalIP,
} from "../store/root-store";
import { validateIPv4 } from "../utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: "1rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "cetner",
      color: "#fff",
      [theme.breakpoints.up("sm")]: {
        marginTop: 0,
        flexDirection: "row",
        justifyContent: "flex-end",
      },
    },
    terminal: {
      display: "flex",
      alignItems: "center",
      margin: "0 1rem",
    },
    button: {
      color: "#fff",
    },
    inlineButton: {
      color: "#fff",
      margin: "0 .5rem",
    },
  })
);

const TerminalInfo = () => {
  const classes = useStyles();
  const appStore = useAppStore();
  const { t } = useTranslation();
  const setTerminalIP = useSetTerminalIP();
  const [open, setOpen] = React.useState(false);
  const [ip, setIP] = React.useState("");
  const [error, setError] = React.useState("");

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIP(e.target.value);
    if (error.length) setError("");
  };

  const handleChangeTerminal = () => {
    if (!validateIPv4(ip)) {
      setError(t("common->invalidTerminalIP"));
      return;
    }

    setTerminalIP(ip);
    handleClose();
  };

  if (!appStore.terminal) return null;

  return (
    <div className={classes.terminal}>
      <LocationOnIcon />
      <Typography>
        {appStore.language === "ar"
          ? `${appStore.terminal.terminal_info.terminal_arabic_name} (${appStore.terminal.terminal_info.terminal_id})`
          : `${appStore.terminal.terminal_info.terminal_english_name} (${appStore.terminal.terminal_info.terminal_id})`}
      </Typography>
      {appStore.environment !== "production" ? (
        <Button
          size="small"
          onClick={handleOpen}
          className={classes.inlineButton}
        >
          {t("common->changeTerminalIP")}
        </Button>
      ) : null}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-change-terminal"
      >
        <DialogTitle id="form-change-terminal">
          {t("common->changeTerminalIP")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            value={ip}
            onChange={handleInput}
            label={t("common->terminalIP")}
            type="text"
            fullWidth
            error={error.length > 0}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("common->cancel")}</Button>
          <Button onClick={handleChangeTerminal} color="primary">
            {t("common->verify")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const Topbar = () => {
  const classes = useStyles();
  const appStore = useAppStore();
  const changeLanguage = useChangeLanguage();
  const { t } = useTranslation();

  return (
    <AppBar position="static" elevation={0} color="transparent">
      <Toolbar className={classes.root}>
        <TerminalInfo />
        <Button
          onClick={changeLanguage}
          startIcon={<Language />}
          className={classes.button}
        >
          {t(`languages->${appStore.language === "ar" ? "en" : "ar"}`)}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
