import React from "react";
import { useTranslation } from "react-i18next";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Pagination from "@material-ui/lab/Pagination";
import Paper from "@material-ui/core/Paper";
import Snackbar from "@material-ui/core/Snackbar";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import { Button } from "../../../components/Buttons";
import { SectionLoader } from "../../../components/Loaders";
import { EmptyState } from "../../../components/UIStates";
import { useActivePolicies, useDeletedPolicies } from "./hooks";
import Policy from "./policy";
import AddPolicy from "./add-policy";
import { Policy as IPolicy, Condition as ICondition } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sectionTitle: {
      fontSize: "1.25rem",
      color: "#333",
      flexGrow: 1,
    },
    tab: {
      position: "relative",
      fontSize: "1rem",
      color: "#444",
      "&.active::after": {
        content: "''",
        width: "16px",
        height: "4px",
        backgroundColor: "#4acfa9",
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        borderRadius: "2px",
      },
    },
    searchBox: {
      padding: "4px 1rem",
      display: "flex",
      alignItems: "center",
      boxShadow: "0px 3px 5px rgba(0,0,0,.04)",
      color: "#ccc",
      "& .input": {
        flexGrow: 1,
      },
    },
    cardRoot: {
      display: "flex",
    },
    cardMedia: {
      width: "60px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#2cb980",
      "& > *": { color: "#fff" },
    },
    cardContent: {
      padding: "8px 16px",
      "& h5": {
        color: "#444",
        fontSize: "1.1rem",
      },
      "& p": {
        color: "#666",
        marginTop: "4px",
      },
    },
    cardActions: {
      justifyContent: "flex-end",
      padding: "0 8px 4px",
    },
  })
);

function PolicyList({
  policyList,
  searchTerm,
}: {
  policyList: any;
  searchTerm: string;
}) {
  const { t } = useTranslation();
  const [state, setState] = React.useState<number | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const pageLength = 8;
  const handlePolicyOpen = (index: number) => setState(index);
  const handlePolicyClose = () => setState(null);

  React.useEffect(() => {
    if (searchTerm.trim()) setPage(1);
  }, [searchTerm]);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const policies = Object.keys(policyList).map((k) => ({
    policy_name: k,
    conditions: policyList[k].map((c: ICondition) => ({
      ...c,
      condition: JSON.parse(c.condition as string),
    })),
  }));

  if (policies.length == 0)
    return <EmptyState primary={t("No data found in this list")} />;

  const filteredPolicies = searchTerm.trim()
    ? policies.filter(
        (p) =>
          p.policy_name.includes(searchTerm.toLocaleUpperCase()) ||
          t(`policies:${p.policy_name}`).includes(searchTerm)
      )
    : policies;

  if (filteredPolicies.length == 0)
    return <EmptyState primary={t("No data found for this search")} />;

  const paginatedPolicies = filteredPolicies.slice(
    page * pageLength - pageLength,
    page * pageLength
  );

  return (
    <Box mt={2}>
      {paginatedPolicies.map((p: IPolicy, index: number) => (
        <Policy
          key={index}
          policy={p}
          open={index === state}
          onOpen={() => handlePolicyOpen(index)}
          onClose={handlePolicyClose}
        />
      ))}
      <Box my={4} display="flex" justifyContent="center">
        {filteredPolicies.length > pageLength ? (
          <Pagination
            count={Math.round(filteredPolicies.length / pageLength)}
            color="primary"
            page={page}
            onChange={handleChange}
          />
        ) : null}
      </Box>
    </Box>
  );
}

export default function Policies() {
  const { t } = useTranslation();
  const classes = useStyles();
  const [activeTab, setActiveTab] = React.useState("Active");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [newPolicyOpen, setNewPolicyOpen] = React.useState(false);
  const [newPolicySuccess, setNewPolicyOpenSuccess] = React.useState<
    any | null
  >(null);
  const [snackBar, setSnackBar] = React.useState(false);
  const {
    isError: activePoliciesIsError,
    error: activePoliciesError,
    isLoading: activePoliciesIsLoading,
    data: activePolicies = {},
    isFetching,
  } = useActivePolicies();
  const {
    isError: deletedPoliciesIsError,
    error: deletedPoliciesError,
    isLoading: deletedPoliciesIsLoading,
    data: deletedPolicies = {},
  } = useDeletedPolicies();

  const isError = activePoliciesIsError || deletedPoliciesIsError;
  const isLoading =
    activePoliciesIsLoading || deletedPoliciesIsLoading || isFetching;

  const handleTabChange = (tab: string) => setActiveTab(tab);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(event.target.value);

  const handleNewPolicyOpen = () => setNewPolicyOpen((prev) => !prev);

  const handleNewPolicySuccess = (result: any) => {
    setNewPolicyOpenSuccess(result);
    setSnackBar(true);
  };

  const handleSnackbar = () => setSnackBar((prev) => !prev);

  return (
    <Box display="flex" flexDirection="column">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography className={classes.sectionTitle}>
          {t("Policy List")}
        </Typography>
        <Button
          color="primary"
          onClick={handleNewPolicyOpen}
          startIcon={<AddIcon color="primary" />}
        >
          {t("Add Policy")}
        </Button>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex">
          <Button
            className={`${classes.tab} ${
              activeTab === "Active" ? "active" : ""
            }`}
            onClick={() => handleTabChange("Active")}
          >
            {t("Active Policies")}
          </Button>
          <Button
            className={`${classes.tab} ${
              activeTab === "Deleted" ? "active" : ""
            }`}
            onClick={() => handleTabChange("Deleted")}
          >
            {t("Deleted Policies")}
          </Button>
        </Box>
        <Box>
          <Paper className={classes.searchBox}>
            <InputBase
              className="input"
              onChange={handleSearch}
              value={searchTerm}
              placeholder={t("Search policies")}
              inputProps={{ "aria-label": t("Search policies") }}
            />
            <SearchIcon color="inherit" />
          </Paper>
        </Box>
      </Box>
      <Box flexGrow={1} display="flex" flexDirection="column">
        {newPolicyOpen ? (
          <AddPolicy
            onClose={handleNewPolicyOpen}
            onSuccess={handleNewPolicySuccess}
          />
        ) : null}
        {isLoading ? (
          <SectionLoader />
        ) : (
          <PolicyList
            policyList={
              activeTab === "Active"
                ? activePolicies ?? {}
                : deletedPolicies ?? {}
            }
            searchTerm={searchTerm}
          />
        )}
      </Box>
      {newPolicySuccess ? (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={snackBar}
          autoHideDuration={10000}
          onClose={handleSnackbar}
          key={newPolicySuccess.id}
        >
          <Card className={classes.cardRoot}>
            <CardMedia className={classes.cardMedia}>
              <DoneAllIcon />
            </CardMedia>
            <div>
              <CardContent className={classes.cardContent}>
                <Typography variant="h5">
                  {t("New policy has been added successfully")}
                </Typography>
                <Typography variant="body2">
                  {t(`Sequence number`)}: {newPolicySuccess.id}
                </Typography>
              </CardContent>
              <CardActions className={classes.cardActions}>
                <Button onClick={handleSnackbar}>{t(`Dismiss`)}</Button>
              </CardActions>
            </div>
          </Card>
        </Snackbar>
      ) : null}
    </Box>
  );
}
