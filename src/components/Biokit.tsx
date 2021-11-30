import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Theme,
  createStyles,
  Box,
  Button,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      marginTop: theme.spacing(1),
    },
    instructionsBox: {
      marginTop: theme.spacing(5),
      marginBottom: theme.spacing(5),
    },
    buttonsBox: {
      "& > *": {
        margin: theme.spacing(1),
      },
    },
    firstInstruction: {
      marginBottom: theme.spacing(5),
    },
  })
);

export default function Biokit() {
  const classes = useStyles();
  const { t } = useTranslation();

  // const handleDownloadBiokitClick = () => {
  // 	window.location.href = `${process.env.REACT_APP_API_URL}/bio/client/biokit/APPLICATION.JNLP`;
  // };

  return (
    <div className={classes.root}>
      <div className={classes.instructionsBox}>
        <Typography
          variant="h6"
          align="center"
          color="primary"
          className={classes.firstInstruction}
        >
          {t("biokit->autoConnection")}
        </Typography>
        <Typography align="center">{t("biokit->timeoutGuide")}</Typography>
      </div>
      <Box
        display="flex"
        justifyContent="center"
        className={classes.buttonsBox}
      >
        <Button
          variant="contained"
          href={`${process.env.REACT_APP_API_URL ?? ""}/bio/client/biokit/APPLICATION.JNLP`}
        >
          {t("biokit->download")}
        </Button>
        {/* <Button variant="contained">Default</Button>
				<Button variant="contained">Default</Button> */}
      </Box>
    </div>
  );
}
