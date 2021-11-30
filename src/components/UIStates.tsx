import React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import emptyVector from "../styles/vectors/empty.svg";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    empty: {
      height: "100%",
      width: "100%",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      "& .vector": {
        width: "45vw",
        maxWidth: "250px",
        marginBottom: "1rem",
      },
      "& .primary": {
        color: "#444",
        fontSize: "1.5rem",
        fontWeight: 200,
      },
    },
  })
);

export const EmptyState = ({
  primary,
  secondary,
}: {
  primary: string;
  secondary?: string;
}) => {
  const classes = useStyles();
  return (
    <Box className={classes.empty}>
      <img src={emptyVector} className="vector" />
      <Typography variant="h5" className="primary">
        {primary}
      </Typography>
      {secondary ? (
        <Typography variant="body2" className="secondary">
          {secondary}
        </Typography>
      ) : null}
    </Box>
  );
};

// TODO: Add Error State
// TODO: Add Warning State
// TODO: Add Loading State
// TODO: Add Info State
// TODO: Add No Connection State
