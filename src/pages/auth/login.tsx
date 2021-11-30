import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useHistory, useLocation } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import { fetchAPI } from "utils/api";

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
    textField: {
      "& input": {
        flip: false,
        direction: "ltr",
      },
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
      alignSelf: "center",
      marginTop: theme.spacing(1),
    },
  })
);

const Login = () => {
  const { t } = useTranslation("errors");
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [state, setState] = useState({
    username: "",
    password: "",
  });

  const { username, password } = state;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(false);
    setErrorText("");
    setErrorCode("");

    if (username.length === 0 || password.length === 0) {
      setErrorText(t("forms->credentialsEmpty"));
      setError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetchAPI(`/pass/api/auth/login/v1`, {
        method: "POST",
        body: {
          username: username.trim(),
          password: password.trim(),
          password_changed: false,
        },
      });

      const { data } = response;
      if (response.ok) {
        sessionStorage.lastRefreshTokenTime = new Date();

        const operatorInfo = data.operator_info;

        sessionStorage.token = data.access_token;
        sessionStorage.tokenShortLifetimeMins =
          data.access_token_lifetime_minutes;
        sessionStorage.tokenRefreshLifetimeMins = data.session_lifetime_minutes;
        sessionStorage.operatorImg = data.face_photo_base64;
        sessionStorage.arabicFirstName = operatorInfo.arabic_first_name;
        sessionStorage.arabicOperatorName = `${
          operatorInfo.arabic_first_name
        } ${operatorInfo.arabic_father_name ?? ""} ${
          operatorInfo.arabic_family_name
        }`.trim();
        sessionStorage.englishOperatorName = `${
          operatorInfo.english_first_name
        } ${operatorInfo.english_father_name ?? ""} ${
          operatorInfo.english_family_name
        }`.trim();
        sessionStorage.loggedIn = "true";
        sessionStorage.applied_policies = JSON.stringify(data.applied_policies);
        sessionStorage.isSupervisor = Boolean(
          data.account_info?.roles.find((r: string) =>
            r.toLowerCase().includes("supervisor")
          )
        );

        setLoading(false);
        setErrorText("");
        setError(false);

        history.replace((location?.state as any)?.from?.pathname || "/");

        history.replace("/");
      } else {
        setErrorText(
          t(`${data.reason.length ? `${data.reason}` : "common.API_ERROR"}`)
        );
        setErrorCode(data.error_code);
        setError(true);
        sessionStorage.clear();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setErrorText(t("common->API_ERROR"));
      setError(true);
      sessionStorage.clear();
    }
  };

  const handlePasswordChangeClick = () => {
    setErrorText("");
    setError(false);
    setLoading(false);
    history.push("/reset-password");
  };

  return (
    <form className={classes.form} onSubmit={(e) => handleLogin(e)}>
      <Typography variant="h6" align="center" className={classes.title}>
        {t("forms->login")}
      </Typography>
      {error && (
        <Typography variant="body2" className={classes.errorText} color="error">
          {errorCode.length > 0 ? `${errorText} (${errorCode})` : errorText}
        </Typography>
      )}
      <TextField
        label={t("forms->username")}
        className={classes.textField}
        name="username"
        type="text"
        margin="normal"
        variant="outlined"
        value={username}
        onChange={handleInput}
        inputProps={{ maxLength: "100" }}
        fullWidth
        autoFocus
        autoComplete="off"
      />
      <TextField
        label={t("forms->password")}
        className={classes.textField}
        name="password"
        type="password"
        margin="normal"
        variant="outlined"
        value={password}
        onChange={handleInput}
        inputProps={{ maxLength: "100" }}
        fullWidth
        autoComplete="off"
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
            t("forms->loginButton")
          )}
        </Button>
        <Button
          disableRipple
          className={classes.changePasswordButton}
          onClick={handlePasswordChangeClick}
        >
          {t("forms->resetPassword")}
        </Button>
      </div>
    </form>
  );
};

export default Login;
