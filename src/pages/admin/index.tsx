import React from "react";
import { useRouteMatch, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Typography, Grid, Paper } from "@material-ui/core";
import PolicyIcon from "@material-ui/icons/PolicyRounded";
import TranslateIcon from "@material-ui/icons/TranslateRounded";

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

export default function Admin() {
  const { t, i18n } = useTranslation();
  const classes = useStyles();
  const { path } = useRouteMatch();

  const items = [
    {
      title: t("Policies"),
      icon: () => <PolicyIcon className={classes.menuIcon} color="primary" />,
      link: `${path}/policies`,
    },
    // {
    //   title: t("Translations"),
    //   icon: () => (
    //     <TranslateIcon className={classes.menuIcon} color="primary" />
    //   ),
    //   link: `${path}/translations`,
    // },
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
        spacing={4}
        className={classes.gridContainer}
      >
        {items.map((item, index) => (
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
        ))}
      </Grid>
    </>
  );
}
