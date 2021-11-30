import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
    },
    title: {
      alignSelf: "center",
      color: "#333",
    },
    buttonGroup: {
      width: "100%",
      marginTop: "1rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      [theme.breakpoints.up("sm")]: {
        marginTop: "2rem",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      },
    },
    button: {
      fontWeight: "bold",
      padding: ".5rem 1.5rem",
      background:
        "linear-gradient(258.51deg, #3590C4 15.2%, rgba(41, 184, 126, 0.988882) 89.35%)",
      marginBottom: "1rem",
      [theme.breakpoints.up("sm")]: {
        marginBottom: 0,
      },
    },
    loader: {
      color: "#fff",
    },
    changePasswordButton: {
      color: "#444",
    },
    errorText: {
      marginTop: theme.spacing(1),
      alignSelf: "center",
    },
  })
);

const ResetPassword = () => {
  const { t } = useTranslation("errors");
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [state, setState] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
  });

  const { username, oldPassword, newPassword } = state;

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(false);
    setErrorText("");
    setErrorCode("");

    if (username.length === 0) {
      setErrorText(t("forms->usernameIsEmpty"));
      setError(true);
      return;
    }

    if (oldPassword.length === 0) {
      setErrorText(t("forms->oldPasswordIsEmpty"));
      setError(true);
      return;
    }

    if (newPassword.length === 0) {
      setErrorText(t("forms->newPasswordIsEmpty"));
      setError(true);
      return;
    }

    if (oldPassword === newPassword) {
      setErrorText(t("forms->passwordsAreMatching"));
      setError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL ?? ""}/pass/api/auth/password/change/v1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            old_password: oldPassword.trim(),
            new_password: newPassword.trim(),
          }),
        }
      );

      if (response.ok) {
        setErrorText("");
        setError(false);
        setLoading(false);
        history.replace("/login");
      } else {
        const json = await response.json();
        setLoading(false);
        setErrorText(
          t(`${json.reason ? `errors:${json.reason}` : "common.API_ERROR"}`)
        );
        setError(true);
      }
    } catch (error) {
      setLoading(false);
      setErrorText(t("common->API_ERROR"));
      setError(true);
    }
  };

  const handleBackToLoginClick = () => {
    setErrorText("");
    setError(false);
    setLoading(false);
    history.goBack();
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form className={classes.form} onSubmit={(e) => handleChangePassword(e)}>
      <Typography variant="h6" align="center" className={classes.title}>
        {t("forms->resetPasswordForm")}
      </Typography>
      {error && (
        <Typography variant="body1" className={classes.errorText} color="error">
          {errorText} {errorCode || ""}
        </Typography>
      )}

      <TextField
        label={t("forms->username")}
        type="text"
        name="username"
        margin="normal"
        variant="outlined"
        value={username}
        onChange={handleInput}
        inputProps={{ maxLength: "100" }}
        fullWidth
        autoFocus
      />
      <TextField
        label={t("forms->oldPassword")}
        name="oldPassword"
        type="password"
        margin="normal"
        variant="outlined"
        value={oldPassword}
        onChange={handleInput}
        inputProps={{ maxLength: "100" }}
        fullWidth
      />
      <TextField
        label={t("forms->newPassword")}
        name="newPassword"
        type="password"
        margin="normal"
        variant="outlined"
        value={newPassword}
        onChange={handleInput}
        inputProps={{ maxLength: "100" }}
        fullWidth
      />
      <div className={classes.buttonGroup}>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          size="large"
          type="submit"
          disabled={loading ? true : false}
        >
          {loading ? (
            <CircularProgress size={24} className={classes.loader} />
          ) : (
            t("forms->resetPasswordForm")
          )}
        </Button>
        <Button
          color="secondary"
          disableRipple
          className={classes.changePasswordButton}
          onClick={handleBackToLoginClick}
        >
          {t("forms->backToLogin")}
        </Button>
      </div>
    </form>
  );
};

export default ResetPassword;
