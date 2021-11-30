import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles({
  root: {
    width: "100vw",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#339AB3",
  },
  loader: {
    color: "#fff",
  },
});

const Splash = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress size={80} className={classes.loader} />
    </div>
  );
};

export default Splash;
