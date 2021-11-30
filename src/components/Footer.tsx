import * as React from "react";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Logo from "../img/logo-h.svg";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: "auto",
      marginLeft: 240,
      backgroundColor: "#e0e0e0",
      padding: theme.spacing(3),
    },
    logo: {
      width: "100px",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
    },
    text: {
      marginTop: theme.spacing(1),
      color: "#757575",
    },
  })
);

const Footer: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <footer className={classes.root}>
      <div>
        <img className={classes.logo} src={Logo} alt="Logo" />
        <Typography align="center" className={classes.text}>
          {t("common->developedByNIC")}
        </Typography>
      </div>
    </footer>
  );
};

export default Footer;
