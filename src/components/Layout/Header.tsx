import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import MenuIcon from "@material-ui/icons/Menu";
import Home from "@material-ui/icons/Home";
import ExitToApp from "@material-ui/icons/ExitToApp";
import Language from "@material-ui/icons/Language";
import { useHistory } from "react-router-dom";
import Logo from "img/logo-h.svg";
import LogoEn from "img/logo-h-en.svg";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import { Hidden } from "@material-ui/core";
import { validateUserPolicy, takeScreenshot } from "utils";
import { useAppStore, useChangeLanguage } from "store/root-store";
import { useLogout } from "store/user-store";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topNotification: {
      width: "100%",
      padding: "4px",
      textAlign: "center",
      backgroundColor: "#b35945",
      color: "#fff",
    },
    appBar: {
      backgroundColor: "#f9f9f9",
      color: theme.palette.primary.dark,
      padding: ".5rem 1rem",
      boxShadow: "none",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
    },
    logo: {
      flexGrow: 1,
      "& img": {
        width: "100%",
        maxWidth: "120px",
      },
    },
    menuLink: {
      direction: "ltr",
    },
  })
);

const Header = ({ handleMenuOpen }: { handleMenuOpen: () => void }) => {
  const appStore = useAppStore();
  const changeLanguage = useChangeLanguage();
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const logout = useLogout();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleHomeClick = () => {
    history.push("/");
  };

  const handleLangClick = () => changeLanguage();

  const handleLogout = () => {
    sessionStorage.loggedIn = "false";
    logout();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuItem = (link: string) => {
    handleMenuClose();
    history.push(link);
  };

  const environment =
    appStore.environment && appStore.environment !== "production"
      ? t(appStore.environment)
      : null;

  const menuOptions = [
    {
      title: t("Enroll mobile device"),
      link: "/profile/qr-code",
      show: validateUserPolicy("SHOW_MENU_MOBILE_QR_CODE"),
    },
    {
      title: t("Install open vpn configuration"),
      link: "/profile/install-ovpn-config",
      show: validateUserPolicy("SHOW_MENU_MOBILE_QR_CODE"),
    },
  ];

  const filteredMenuOptions = menuOptions.filter((o) => o.show);

  return (
    <>
      {environment && (
        <div className={classes.topNotification}>
          <Typography variant="body1">{environment}</Typography>
        </div>
      )}
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar disableGutters>
          <Hidden mdUp>
            <IconButton
              edge="start"
              color="primary"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <div className={classes.logo}>
            <img
              src={appStore.language === "ar" ? Logo : LogoEn}
              alt={t("common->projectName")}
            />
          </div>
          <div>
            <Hidden smUp>
              <IconButton
                aria-label={t("common->homepage")}
                onClick={handleHomeClick}
              >
                <Home color="inherit" />
              </IconButton>
              <IconButton
                onClick={handleLangClick}
                aria-label={t(
                  `languages->${appStore.language === "ar" ? "en" : "ar"}`
                )}
              >
                <Language color="inherit" />
              </IconButton>
              <IconButton
                aria-label={t("common->logout")}
                onClick={handleLogout}
              >
                <ExitToApp color="secondary" />
              </IconButton>
            </Hidden>
            <Hidden xsDown>
              <Button
                color="inherit"
                onClick={handleHomeClick}
                startIcon={<Home></Home>}
              >
                {t("common->homepage")}
              </Button>
              <Button
                color="inherit"
                startIcon={<Language />}
                onClick={handleLangClick}
              >
                {t(`languages->${appStore.language === "ar" ? "en" : "ar"}`)}
              </Button>
              <IconButton onClick={takeScreenshot} aria-label="Screenshot">
                <AspectRatioIcon color="inherit" />
              </IconButton>
              <Button
                color="secondary"
                onClick={handleLogout}
                startIcon={<ExitToApp></ExitToApp>}
              >
                {t("common->logout")}
              </Button>
              {filteredMenuOptions.length ? (
                <IconButton
                  aria-label="more"
                  aria-controls="more-menu"
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                >
                  <MoreVertIcon />
                </IconButton>
              ) : null}
              <Menu
                id="more-menu"
                keepMounted
                getContentAnchorEl={null}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  style: {
                    width: "150px",
                  },
                }}
              >
                {filteredMenuOptions.map((option, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleMenuItem(option.link)}
                    className={classes.menuLink}
                  >
                    {option.title}
                  </MenuItem>
                ))}
              </Menu>
            </Hidden>
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
