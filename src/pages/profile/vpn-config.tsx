import React from "react";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Error";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useGet } from "../../hooks/useApi";
import { decodeB64 } from "../../utils";
import { Typography, Box } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pageContainer: {
      maxWidth: "900px",
      margin: "0 auto",
    },
    number: {
      marginBottom: "8px",
      padding: "8px",
      backgroundColor: "#fafafa",
      fontSize: "1.2rem",
      borderRadius: "50%",
      width: "48px",
      height: "48px",
      textAlign: "center",
    },
    image: {
      width: "80vw",
      maxWidth: "250px",
    },
    card: {
      backgroundColor: "#fefefe",
      borderRadius: "5px",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
    },
  })
);

type VPNConfig = {
  [key: string]: string;
};

function VpnConfigQR() {
  const classes = useStyles();

  const { isLoading, data, error, isError } = useGet<VPNConfig>({
    key: "vpnConfig",
    url: `/pass/api/operator/mobile/vpn/qr-code/v1?width_pixels=500&height_pixels=500&on_color=ff339ab3&off_color=00ffffff`,
  });

  return (
    <Box display="flex" flexWrap="wrap" marginTop={3}>
      {!isError && !isLoading && data
        ? Object.keys(data).map((key) => (
            <Box
              key={key}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              flexGrow={1}
              margin={2}
              padding={2}
              className={classes.card}
            >
              <Typography variant="caption" className={classes.number}>
                {key}
              </Typography>
              <img
                src={`data:image/png;base64, ${decodeB64(data[key])}`}
                className={classes.image}
              />
            </Box>
          ))
        : null}
    </Box>
  );
}

export default () => {
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      marginTop={2}
    >
      <Typography variant="body1" style={{ textAlign: "center" }}>
        {t("Steps to install open vpn configuration")}
      </Typography>
      <VpnConfigQR />
    </Box>
  );
};
