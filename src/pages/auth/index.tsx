import React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Box, Typography } from "@material-ui/core";
import ErrorOutlineIcon from "@material-ui/icons/Error";
import Topbar from "components/Topbar";
import { useAppStore } from "store/root-store";
import Logo from "img/logo-h.svg";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: "#339AB3",
      minHeight: "100vh",
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
    },
    body: {
      flexGrow: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    box: {
      width: "95%",
      maxWidth: "450px",
      margin: "0 auto",
      padding: "1rem",
      textAlign: "center",
      backgroundColor: "#fff",
      borderRadius: ".5rem",
      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
      [theme.breakpoints.up("sm")]: {
        width: "90%",
        padding: "2rem",
        borderRadius: "1rem",
        boxShadow: "0px 19px 38px rgba(0, 0, 0, 0.3)",
      },
    },
    logo: {
      width: "80%",
      maxWidth: "150px",
      marginBottom: "2rem",
      [theme.breakpoints.up("sm")]: {
        maxWidth: "200px",
      },
    },
    notAllowed: {
      marginTop: theme.spacing(2),
    },
    errorIcon: {
      color: "#b71c1c",
    },
  })
);

type Props = {
  children: React.ReactNode;
};

export default function AuthContainer(props: Props) {
  const classes = useStyles();
  const appStore = useAppStore();
  const { t } = useTranslation("errors");

  return (
    <div className={classes.root}>
      <Topbar />
      <div className={classes.body}>
        <Container maxWidth="sm">
          <Box className={classes.box}>
            <img
              className={classes.logo}
              src={Logo}
              alt={t("common->projectName")}
            />
            {appStore.terminal ? (
              props.children
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <ErrorOutlineIcon
                  fontSize="large"
                  className={classes.errorIcon}
                ></ErrorOutlineIcon>
                <Typography
                  className={classes.notAllowed}
                  variant="h5"
                  align="center"
                >
                  لا يوجد اتصال
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </div>
    </div>
  );
}
