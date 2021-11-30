import React from "react";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

const useSectionStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
    },
  })
);

export const SectionLoader = () => {
  const classes = useSectionStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.root}>
      <Box mb={2}>
        <CircularProgress size={40} />
      </Box>
      <Typography>{t("Loading..")}</Typography>
    </Box>
  );
};
