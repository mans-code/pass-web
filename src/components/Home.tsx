import * as React from "react";
import { Link } from "react-router-dom";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Paper } from "@material-ui/core";
import FlightLand from "@material-ui/icons/FlightLand";
import FlightTakeoff from "@material-ui/icons/FlightTakeoff";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import { validateUserPolicy } from "../utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    welcom: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      color: theme.palette.primary.dark,
      "& span:first-child": {
        color: theme.palette.primary.main,
        fontSize: "2rem",
      },
      "& span:last-child": {
        fontSize: "1.2rem",
        fontWeight: "bold",
        marginTop: ".5rem",
      },
    },
    gridContainer: {
      paddingTop: theme.spacing(5),
      paddingBottom: theme.spacing(5),
    },
    paper: {
      padding: theme.spacing(4),
      textAlign: "center",
      width: "250px",
      cursor: "pointer",
      color: "#333",
      borderRadius: "8px",
      transition: "all .32s ease-in-out",
      "&:hover": {
        borderColor: theme.palette.primary.dark,
        "& svg": {
          color: theme.palette.primary.dark,
        },
      },
    },
    link: {
      textDecoration: "none",
      color: "inherit",
      "&:focus > div": {
        borderColor: theme.palette.primary.dark,
        "& svg": {
          color: theme.palette.primary.dark,
        },
      },
    },
    menuIcon: {
      fontSize: "90px",
      marginBottom: theme.spacing(1),
      transition: "all .32s ease-in-out",
    },
  })
);

const Home = () => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  const items = [
    {
      title: t("travel->travellerDeparture"),
      icon: () => (
        <FlightTakeoff className={classes.menuIcon} color="primary" />
      ),
      link: "/departure",
      show: validateUserPolicy("SHOW_MENU_DEPARTURE"),
    },
    {
      title: t("travel->travellerArrival"),
      icon: () => <FlightLand className={classes.menuIcon} color="primary" />,
      link: "/arrival",
      show: validateUserPolicy("SHOW_MENU_ARRIVAL"),
    },
    {
      title: t("common->adminPage"),
      icon: () => (
        <SupervisorAccountIcon className={classes.menuIcon} color="primary" />
      ),
      link: "/admin",
      show: sessionStorage.isSupervisor !== "false",
    },
  ];

  return (
    <>
      <Typography align="center" variant="h4" className={classes.welcom}>
        <span>{t("common->welcome")}</span>
        <span>
          {i18n.language === "ar"
            ? sessionStorage.arabicOperatorName
            : sessionStorage.englishOperatorName}
        </span>
      </Typography>
      <Grid
        container
        direction="row"
        justify="center"
        alignContent="flex-start"
        spacing={4}
        className={classes.gridContainer}
      >
        {items.map(
          (item, index) =>
            item.show && (
              <Grid key={index} item>
                <Link to={item.link} className={classes.link}>
                  <Paper className={classes.paper} variant="outlined">
                    {item.icon()}
                    <Typography variant="h5" align="center">
                      {item.title}
                    </Typography>
                  </Paper>
                </Link>
              </Grid>
            )
        )}
      </Grid>
    </>
  );
};

export default Home;
