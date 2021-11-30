import * as React from "react";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import {
  Typography,
  Avatar,
  Box,
  FormControlLabel,
  Switch,
  Hidden,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import { FiberManualRecord, Refresh } from "@material-ui/icons";
import { useBiokit } from "../BioKitManager";
import { decodeB64 } from "utils";
import { useAppStore, useToggleBiokit } from "store/root-store";

const drawerWidth = 200;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      flexShrink: 0,
    },
    drawerPaper: {
      width: "75%",
      maxWidth: "280px",
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
      padding: theme.spacing(2),
      [theme.breakpoints.up("md")]: {
        width: drawerWidth,
      },
    },
    faceImg: {
      height: theme.spacing(8),
      width: theme.spacing(8),
      boxShadow: "1px 1px 4px 0px rgba(0, 0, 0, 0.75)",
      marginBottom: theme.spacing(1),
      // border: "1px solid #fff",
    },
    text: {
      marginBottom: theme.spacing(0.3),
    },
    terminal: {
      marginTop: theme.spacing(1),
    },
    biokitControls: {
      // height: "100%",
      marginTop: theme.spacing(1.5),
    },
    biokitStatusText: {
      marginTop: theme.spacing(1),
    },
  })
);

const DrawerContent = () => {
  const appStore = useAppStore();
  const toggleBiokit = useToggleBiokit();
  const classes = useStyles();
  const { i18n, t } = useTranslation();
  const biokit = useBiokit();

  const name =
    i18n.language === "ar"
      ? sessionStorage.arabicOperatorName
      : sessionStorage.englishOperatorName;

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        mb={1}
      >
        <Avatar
          alt={`${name}`}
          src={`data:image/png;base64, ${decodeB64(
            sessionStorage.operatorImg
          )}`}
          className={classes.faceImg}
        />
        <Typography variant="subtitle2" align="center">
          {t("Welcome back,")}
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          className={classes.text}
          style={{ fontWeight: "bold" }}
        >
          {name}
        </Typography>
      </Box>
      <Divider variant="middle" />
      {appStore.terminal ? (
        <div className={classes.terminal}>
          <Typography
            variant="subtitle2"
            align="center"
            className={classes.text}
          >{`${appStore.terminal.terminal_info.terminal_arabic_name} (${appStore.terminal.terminal_info.terminal_id})`}</Typography>
        </div>
      ) : null}
      <Box
        display="flex"
        flexGrow="1"
        justifyContent="flex-end"
        alignItems="center"
        flexDirection="column"
        width={"100%"}
      >
        {!biokit.connected && (
          <>
            <Typography align="center" className={classes.biokitControls}>
              {t("biokit->instructions")}
            </Typography>
          </>
        )}
        <Divider
          style={{ width: "100%", backgroundColor: "#fff" }}
          className={classes.biokitControls}
        />
        <Typography
          align="center"
          style={{ fontWeight: "bold" }}
          className={classes.biokitControls}
        >
          {t("biokit->controlPanel")}
        </Typography>
        <Typography align="center" className={classes.biokitStatusText}>
          <FiberManualRecord
            style={{
              verticalAlign: "bottom",
              color: biokit.connected ? "#00c853" : "#dd2c00",
            }}
          ></FiberManualRecord>{" "}
          {biokit.connected
            ? `${t("biokit->connected")}`
            : `${t("biokit->disconnected")}`}
        </Typography>
        <Button
          onClick={biokit.disconnect}
          color="inherit"
          className={classes.biokitControls}
          variant="outlined"
          fullWidth
          size="small"
          disabled={!biokit.connected}
        >
          {t("biokit->reconnect")}
        </Button>
        <Button
          onClick={() => biokit.shutdown(biokit.connected)}
          color="inherit"
          className={classes.biokitControls}
          variant="outlined"
          fullWidth
          size="small"
        >
          {biokit.connected
            ? `${t("biokit->restart")}`
            : `${t("biokit->download")}`}
        </Button>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          style={{ width: "100%" }}
        >
          <Typography align="center" className={classes.biokitControls}>
            <FiberManualRecord
              style={{
                verticalAlign: "bottom",
                color: biokit.deviceName === "" ? "#dd2c00" : "#00c853",
              }}
            ></FiberManualRecord>{" "}
            {t("biokit->fingerprintReader")}
          </Typography>
          <Tooltip title={`${t("biokit->reinitialize")}`}>
            <IconButton
              onClick={biokit.deinitializeDevice}
              className={classes.biokitControls}
              color="inherit"
              size="small"
            >
              <Refresh></Refresh>
            </IconButton>
          </Tooltip>
        </Box>
        {appStore.environment !== "production" && (
          <FormControlLabel
            control={
              <Switch
                checked={appStore.biokit.enabled}
                onChange={toggleBiokit}
              />
            }
            label="Biokit"
            labelPlacement="bottom"
            className={classes.biokitControls}
          />
        )}
      </Box>
    </>
  );
};

type Props = {
  open: boolean;
  handleMenuOpen: () => void;
};

export default function Sidebar({ open, handleMenuOpen }: Props) {
  const classes = useStyles();

  return (
    <>
      <Hidden mdUp>
        <Drawer
          variant="temporary"
          anchor="left"
          open={open}
          onClose={handleMenuOpen}
          className={classes.drawer}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <DrawerContent />
        </Drawer>
      </Hidden>
      <Hidden smDown>
        <Drawer
          variant="permanent"
          anchor="left"
          open
          className={classes.drawer}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <DrawerContent />
        </Drawer>
      </Hidden>
    </>
  );
}
