import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pageHeader: {
      display: "flex",
      padding: "0.5rem 1rem 1rem",
      backgroundColor: "#fefefe",
      border: "1px solid #f1f1f1",
    },
    icon: {
      color: "#666",
    },
    title: {
      flexGrow: 1,
    },
    linkNode: {
      fontWeight: 200,
      fontSize: "0.85rem",
      color: theme.palette.primary.light,
    },
    activeNode: {
      fontWeight: 200,
      fontSize: "0.85rem",
      color: "#666",
    },
  })
);

type Props = {
  pageTitle: string;
  breadcrumb: {
    title: string;
    path: string;
  }[];
};

export default function PageHeader(props: Props) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Box className={classes.pageHeader}>
      <IconButton onClick={() => history.goBack()}>
        <ArrowForwardIosRoundedIcon className={classes.icon} />
        <Box className={classes.title}>
          <Typography>{props.pageTitle}</Typography>
          <Box>
            {props.breadcrumb.map((item, index: number) => (
              <span
                key={item.title}
                className={
                  index < props.breadcrumb.length - 1
                    ? classes.linkNode
                    : classes.activeNode
                }
              >
                <Link to={item.path}>{item.title}</Link>
                {index < props.breadcrumb.length - 1 ? (
                  <span style={{ color: "#666" }}>/</span>
                ) : null}
              </span>
            ))}
          </Box>
        </Box>
      </IconButton>
    </Box>
  );
}
