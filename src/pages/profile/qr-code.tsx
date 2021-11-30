import React from "react";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import RefreshIcon from "@material-ui/icons/Refresh";
import ErrorIcon from "@material-ui/icons/Error";
import CircularProgress from "@material-ui/core/CircularProgress";
import { decodeB64 } from "../../utils";
import { useQuery, useQueryCache } from "react-query";
import { Typography, Box, Grid } from "@material-ui/core";
import { useGet } from "../../hooks/useApi";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pageContainer: {
      maxWidth: "900px",
      margin: "0 auto",
    },
    qrCodeContainer: {
      position: "relative",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    guide: {
      "& h5": {
        color: "#333",
        fontSize: "24px",
        fontWeight: "200",
        marginBottom: theme.spacing(3),
      },
      "& p": {
        color: "#777",
        fontSize: "1.05rem",
        marginBottom: theme.spacing(1),
      },
    },
    image: {
      width: "80vw",
      height: "80vw",
      maxWidth: "280px",
      maxHeight: "280px",
    },
    overlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      textTransform: "uppercase",
    },
    overlayActive: {
      opacity: "0.2",
    },
    loading: {
      fontSize: "1.3rem",
    },
    expired: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "12px",
      width: "150px",
      height: "150px",
      padding: "0 30px",
      borderRadius: "50%",
      backgroundColor: "#444",
      color: "#fafafa",
    },
    error: {
      backgroundColor: "#c73d3d",
    },
    icon: {
      fontSize: "1.8rem",
    },
  })
);

type State = {
  counting: boolean;
  expired: boolean;
};

type QRCode = {
  qr_code_png_image_base64: string;
  qr_code_lifetime_minutes: number;
};

function QrCode() {
  const classes = useStyles();
  const queryCache = useQueryCache();
  const [state, setState] = React.useState<State>({
    counting: false,
    expired: false,
  });

  const { isLoading, isError, data } = useGet<QRCode>({
    url: `/pass/api/operator/mobile/token/qr-code/v1?width_pixels=500&height_pixels=500&on_color=ff339ab3&off_color=00ffffff`,
    key: "qrCode",
  });

  const qrCode = data?.qr_code_png_image_base64;
  const expireDuration = data?.qr_code_lifetime_minutes;

  React.useEffect(() => {
    if (expireDuration && !state.counting) {
      setState({
        counting: true,
        expired: false,
      });

      setTimeout(() => {
        // Ask user to refresh qr code
        setState({
          counting: false,
          expired: true,
        });
      }, expireDuration * 60000);
    }
    if (isError) {
      setState({
        counting: false,
        expired: false,
      });
    }
  }, [expireDuration]);

  const handleRefresh = () => {
    setState({
      counting: false,
      expired: false,
    });
    queryCache.invalidateQueries("qrCode");
  };

  return (
    <div className={classes.qrCodeContainer}>
      {qrCode ? (
        <img
          src={`data:image/png;base64, ${decodeB64(qrCode)}`}
          className={`${classes.image} ${
            isError || isLoading || state.expired ? classes.overlayActive : ""
          }`}
        />
      ) : null}
      <div className={classes.overlay}>
        {isLoading ? (
          <span className={classes.loading}>
            <CircularProgress />
          </span>
        ) : null}
        {state.expired ? (
          <span className={classes.expired} onClick={handleRefresh}>
            <RefreshIcon className={classes.icon} />
            <p>Refresh QR Code</p>
          </span>
        ) : null}
        {isError ? (
          <span className={`${classes.expired} ${classes.error}`}>
            <ErrorIcon className={classes.icon} />
            <p>Error getting code</p>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} className={classes.pageContainer}>
      <Grid item xs={12} sm={6}>
        <Box display="flex" justifyContent="center">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            height="100%"
            className={classes.guide}
          >
            <Typography variant="h5">
              {t("Steps to enroll in mobile app")}
            </Typography>
            <Typography variant="body1">
              1. {t("Open pass app on your mobile")}
            </Typography>
            <Typography variant="body1">
              2. {t("Press on `ENROLL` button")}
            </Typography>
            <Typography variant="body1">
              3. {t("Scan the code on this screen")}
            </Typography>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6}>
        <QrCode />
      </Grid>
    </Grid>
  );
};
