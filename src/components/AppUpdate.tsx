import React from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";

type Props = {
  updateAvailable: boolean;
  rtl: boolean;
};

export default function AppUpdate({ updateAvailable, rtl }: Props) {
  const { t } = useTranslation();
  const [notificationOpen, setNotificationOpen] = React.useState(false);

  React.useEffect(() => {
    if (updateAvailable && !notificationOpen) setNotificationOpen(true);
  }, [updateAvailable]);

  const handleClose = () => setNotificationOpen(false);

  const handleUpdate = () => window.location.reload();

  return (
    <Snackbar
      style={{
        direction: rtl ? "rtl" : "ltr",
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={notificationOpen}
    >
      <Alert
        elevation={1}
        onClose={handleClose}
        severity="info"
        style={{ display: "flex", padding: "8px", alignItems: "center" }}
      >
        <Box
          display="flex"
          flexDirection="column"
          style={{ margin: "0 1.5rem" }}
        >
          <Typography variant="body1">{t("New Update Available")}</Typography>
          <Button
            color="primary"
            onClick={handleUpdate}
            style={{ padding: "0", marginTop: "4px", fontSize: "14px" }}
          >
            {t("reload the page or press here to update")}
          </Button>
        </Box>
      </Alert>
    </Snackbar>
  );
}
