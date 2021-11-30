import React from "react";
import { useTranslation } from "react-i18next";
import { useQueryCache } from "react-query";
import JsonViewer from "react-json-view";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Hidden from "@material-ui/core/Hidden";
import Chip from "@material-ui/core/Chip";
import CircularProgress from "@material-ui/core/CircularProgress";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Alert from "@material-ui/lab/Alert";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import GamesOutlinedIcon from "@material-ui/icons/GamesOutlined";
import CodeIcon from "@material-ui/icons/Code";
import { TextBox } from "../../../components/Text";
import { Button } from "../../../components/Buttons";
import { deletePolicy } from "./actions";
import {
  Condition as ICondition,
  PolicyProps,
  ConditionProps,
  CaseProps,
  Case,
  ValuesCondition,
  BooleanCondition,
} from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    policy: {
      margin: "1rem auto",
      borderRadius: "8px !important",
      backgroundColor: "#FEFEFE",
      boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
      transition: "box-shadow .22s ease-out",
      overflow: "hidden",
      "&:before": {
        content: "none",
      },
      "& .policy-header": {
        padding: "8px 1rem",
        "&.Mui-focused": {
          backgroundColor: "#e5f3f7",
        },
      },
      "& .policy-body": {
        padding: "1rem",
        backgroundColor: "#fcfcfc",
        borderTop: "1px solid #f1f1f1",
        "& .policy-body-text": {
          marginBottom: "1rem",
          fontSize: "14px",
          fontWeight: 600,
          color: theme.palette.primary.main,
        },
      },
      "& .textLabel": {
        color: "#B0B0B0",
        fontSize: ".75rem",
        fontWeight: 600,
      },
      "& .textValue": {
        color: "#444",
        fontSize: "1rem",
        fontWeight: 400,
      },
    },
    condition: {
      backgroundColor: "#f9f9f9",
      margin: "1rem auto",
      padding: "8px 1rem 1rem",
      borderRadius: "8px",
      border: "1px solid #f1f1f1",
      "& .condition-text": {
        fontSize: "15px",
        fontWeight: 600,
        color: "#777",
      },
      "& .condition-actions": {
        color: "#666",
      },
    },
    allCases: {
      position: "relative",
      "& .logical-operator": {
        marginLeft: "24px",
        borderRadius: "4px",
        color: theme.palette.primary.light,
        borderColor: theme.palette.primary.light,
        fontWeight: 600,
        fontSize: "14px",
        backgroundColor: "#f9f9f9",
        position: "relative",
        zIndex: 1,
      },
      "& .connection-line": {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "40px",
        backgroundColor: "#d0d0d0",
        width: "1px",
      },
    },
    conditionsConnector: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      "& .line": {
        position: "absolute",
        top: "-1rem",
        bottom: "-1rem",
        left: "32px",
        width: "10px",
        borderLeft: "1px dashed #d0d0d0",
      },
      "& .logical-operator": {
        marginLeft: "16px",
        borderRadius: "4px",
        color: theme.palette.primary.light,
        borderStyle: "dashed",
        borderColor: theme.palette.primary.light,
        fontWeight: 600,
        fontSize: "14px",
        backgroundColor: "#fcfcfc",
        position: "relative",
        zIndex: 1,
      },
    },
    case: {
      position: "relative",
      zIndex: 1,
      "& .chip": {
        backgroundColor: "rgba(72,195,226,.16)",
      },
    },
    note: {
      margin: "4px 0",
      color: theme.palette.secondary.main,
      fontSize: "0.9rem",
    },
    dialogPaper: {
      direction: "ltr",
    },
    direction: { direction: "ltr" },
  })
);

const isBooleanCase = (c: Case) => c.hasOwnProperty("compiled_value");

function ConditionCase(props: CaseProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  // check if it is boolean case

  return (
    <Box
      px={2}
      pt={props.noTopGutter ? 0 : 2}
      pb={props.noBottomGutter ? 0 : 2}
      className={classes.case}
    >
      {isBooleanCase(props.case) ? (
        <Box>
          <TextBox label={t("Condition value")} value={t("Always true")} />
          <Typography className={classes.note}>
            *
            {t(
              "In this case, the policy is always applied regardless of other conditions"
            )}
          </Typography>
        </Box>
      ) : (
        <Box>
          <Grid container>
            <Grid item xs={12} md={3}>
              <Box
                height="100%"
                px={1 / 2}
                pt={props.noTopGutter ? 0 : 1 / 2}
                pb={props.noBottomGutter ? 0 : 1 / 2}
              >
                <TextBox
                  label={t("enums:Attribute")}
                  value={(props.case as ValuesCondition).attributes
                    .map((a) => t(`enums:Attribute.${a}`))
                    .join(" / ")}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box
                height="100%"
                px={1 / 2}
                pt={props.noTopGutter ? 0 : 1 / 2}
                pb={props.noBottomGutter ? 0 : 1 / 2}
              >
                <TextBox
                  label={t("enums:AggregationOperator")}
                  value={
                    (props.case as ValuesCondition).aggregation_operator
                      ? t(
                          `enums:AggregationOperator.${
                            (props.case as ValuesCondition).aggregation_operator
                          }`
                        )
                      : t("Unset")
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                height="100%"
                px={1 / 2}
                pt={props.noTopGutter ? 0 : 1 / 2}
                pb={props.noBottomGutter ? 0 : 1 / 2}
              >
                <TextBox
                  label={t("enums:ComparisonOperator")}
                  value={t(
                    `enums:ComparisonOperator.${
                      (props.case as ValuesCondition).comparison_operator
                    }`
                  )}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                height="100%"
                px={1 / 2}
                pt={props.noTopGutter ? 0 : 1 / 2}
                pb={props.noBottomGutter ? 0 : 1 / 2}
              >
                <TextBox label={t("Values")} multiple>
                  <Box display="flex">
                    {(props.case as ValuesCondition).values.map((v) => (
                      <Box m={1 / 2} key={v}>
                        <Chip className="chip" size="small" label={v} />
                      </Box>
                    ))}
                  </Box>
                </TextBox>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

const SIMULATION_INITIAL_STATE: {
  formValidation: string | null;
  validationResult: null | {
    matched: string;
    error_code: string;
    reason: string;
  };
} = {
  formValidation: null,
  validationResult: null,
};

function ConditionSimulation({
  condition,
  open,
  onClose,
}: {
  condition: ICondition;
  open: boolean;
  onClose: () => void;
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [state, setState] = React.useState(
    (condition.condition as ValuesCondition[]).reduce<{
      [key: string]: string;
    }>((acc, item) => {
      acc[item.attributes.join(",")] = "";
      return acc;
    }, {})
  );
  const [inputValidation, setInputValidation] = React.useState(
    SIMULATION_INITIAL_STATE
  );

  const handleChange = (values: string, key: string) => {
    setState((prev) => ({
      ...prev,
      [key]: JSON.stringify(values.split("\n")),
    }));
    inputValidation.formValidation &&
      setInputValidation(SIMULATION_INITIAL_STATE);
  };

  const handleSimulation = async () => {
    if (
      Object.values(state).filter((values) => values.length > 0).length === 0
    ) {
      setInputValidation((prev) => ({
        ...prev,
        formValidation: t("Fill all fields"),
      }));
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL ?? ""}/pass/api/admin/policy/condition/simulation/v1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP ?? "",
          },
          body: JSON.stringify({
            condition: JSON.stringify(condition.condition),
            context_data: state,
          }),
        }
      );

      const data: any = await res.json();

      if (res.ok) {
        setInputValidation((prev) => ({
          ...prev,
          formValidation: null,
          validationResult: {
            matched: data.matched ? "Simulation Success" : "Simulation Failed",
            error_code: "",
            reason: "",
          },
        }));
      } else {
        setInputValidation((prev) => ({
          ...prev,
          formValidation: null,
          validationResult: {
            matched: "",
            error_code: data.error_code,
            reason: t(`errors:${data.reason}`),
          },
        }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const resultColor: { [key: string]: "primary" | "secondary" | "default" } = {
    "Simulation Success": "primary",
    "Simulation Failed": "secondary",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2">{`${t(
            "Simulate Condition"
          )} - ${condition.id}`}</Typography>
          {inputValidation.validationResult?.matched ? (
            <Chip
              label={t(inputValidation.validationResult?.matched)}
              color={resultColor[inputValidation.validationResult?.matched]}
            />
          ) : null}
        </Box>
      </DialogTitle>
      <DialogContent>
        {inputValidation.formValidation ? (
          <Box mb={2}>
            <Alert severity="error">{inputValidation.formValidation}</Alert>
          </Box>
        ) : null}
        <Box>
          {(condition.condition as ValuesCondition[]).map(
            (item, index: number) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={t(`enums:Attribute`)}
                    variant="outlined"
                    defaultValue={item.attributes
                      .map((a) => t(`enums:Attribute.${a}`))
                      .join()}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={t("Add Values")}
                    variant="outlined"
                    multiline
                    rowsMax={4}
                    value={state[index]}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(
                        event.target.value,
                        item.attributes.join(",")
                      )
                    }
                  />
                </Grid>
              </Grid>
            )
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSimulation} color="primary">
          {t("Simulate")}
        </Button>
        <Button onClick={onClose}>{t("Cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
}

function Condition({ condition, index }: ConditionProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const queryCache = useQueryCache();
  const [state, setState] = React.useState<{
    isDeleting: boolean;
  }>({
    isDeleting: false,
  });
  const [simulationDialog, setSimulationDialog] = React.useState(false);
  const [showRaw, setShowRaw] = React.useState(false);

  const onDelete = () => {
    setState((prev) => ({
      ...prev,
      isDeleting: true,
    }));
    deletePolicy(condition.id)
      .then((data) => {
        queryCache.invalidateQueries("active_policies");
        queryCache.invalidateQueries("deleted_policies");
        setState((prev) => ({
          ...prev,
          isDeleting: false,
        }));
      })
      .catch((e) => {
        console.log(e.message);
        setState((prev) => ({
          ...prev,
          isDeleting: false,
        }));
      });
  };

  const onSimuate = () => setSimulationDialog((prev) => !prev);

  const onShowRaw = () => setShowRaw((prev) => !prev);

  const isDeleted = condition.deletion_datetime !== undefined;

  const cases = condition.condition as Case[];
  const compiledCaseOnly =
    (cases as BooleanCondition[]).filter((item: BooleanCondition) =>
      item.hasOwnProperty("compiled_value")
    ).length === cases.length;

  return (
    <Box className={classes.condition}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <Typography className="condition-text">{`${t("Condition")} #${
          index + 1
        }`}</Typography>
        <Box>
          <TextBox
            label={t("Created At")}
            value={`${condition.creation_datetime.hijri_date} ${t("H")}`}
            transparent
          />
        </Box>
        {isDeleted ? (
          <Box>
            <TextBox
              label={t("Deleted At")}
              value={`${condition.deletion_datetime?.hijri_date} ${t("H")}`}
              transparent
            />
          </Box>
        ) : null}
        {isDeleted ? null : (
          <Box className="condition-actions">
            <Button
              disabled={state.isDeleting || compiledCaseOnly}
              onClick={onSimuate}
              startIcon={<GamesOutlinedIcon />}
            >
              {t("Simulate")}
            </Button>
            <Button
              disabled={state.isDeleting}
              onClick={onShowRaw}
              startIcon={<CodeIcon />}
            >
              {t("Show Raw")}
            </Button>
            <Button
              disabled={state.isDeleting}
              color="secondary"
              onClick={onDelete}
              startIcon={
                state.isDeleting ? (
                  <CircularProgress size={16} color="secondary" />
                ) : (
                  <DeleteOutlineOutlinedIcon />
                )
              }
            >
              {t("Delete")}
            </Button>
          </Box>
        )}
      </Box>
      <Box className={classes.allCases}>
        {cases.map((c: Case, index: number) => {
          if (index === 0)
            return <ConditionCase key={index} case={c} noTopGutter />;

          return (
            <React.Fragment key={index}>
              <Chip
                label="AND"
                className="logical-operator"
                variant="outlined"
                color="primary"
              />
              <ConditionCase
                key={index}
                case={c}
                noBottomGutter={index === cases.length - 1}
              />
            </React.Fragment>
          );
        })}
        {cases.length > 1 ? <span className="connection-line"></span> : null}
      </Box>
      <Dialog onClose={onShowRaw} open={showRaw} fullWidth maxWidth="sm">
        <DialogTitle className={classes.direction}>
          {t("Condition JSON")}
        </DialogTitle>
        <DialogContent>
          <JsonViewer src={condition.condition as Case[]} />
        </DialogContent>
      </Dialog>
      {simulationDialog ? (
        <ConditionSimulation
          condition={condition}
          open={simulationDialog}
          onClose={onSimuate}
        />
      ) : null}
    </Box>
  );
}

export default function Policy({ policy, open, onOpen, onClose }: PolicyProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleAccordionOpen = () => (open ? onClose() : onOpen());

  return (
    <Accordion
      expanded={open}
      onChange={handleAccordionOpen}
      className={classes.policy}
    >
      <AccordionSummary className="policy-header">
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box width="75%">
            <Typography variant="overline" className="textLabel">
              {t(`Policy Type`)}
            </Typography>
            <Typography variant="h5" className="textValue">
              {t(`policies:${policy.policy_name}`)}
            </Typography>
          </Box>
          <Box width="25%" textAlign="right">
            <Hidden smDown>
              <Button
                color="primary"
                onClick={handleAccordionOpen}
                endIcon={
                  <ExpandMoreIcon
                    color="inherit"
                    style={{
                      transform: open ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform .25s ease-out",
                    }}
                  />
                }
              >
                {t("Show Conditions")}
              </Button>
            </Hidden>
            <Hidden mdUp>
              <IconButton color="primary" onClick={handleAccordionOpen}>
                <ExpandMoreIcon
                  style={{
                    transform: open ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform .25s ease-out",
                  }}
                />
              </IconButton>
            </Hidden>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails className="policy-body">
        <Box width="100%">
          <Typography className="policy-body-text">
            {t(
              "Policy is applied when any of the following conditions is matched"
            )}
          </Typography>
          <Box>
            {policy.conditions.map((condition: ICondition, index: number) => {
              if (index === 0)
                return (
                  <Condition
                    key={condition.id}
                    condition={condition}
                    index={index}
                  />
                );

              return (
                <React.Fragment key={index}>
                  <Box className={classes.conditionsConnector}>
                    <span className="line"></span>
                    <Chip
                      label="OR"
                      className="logical-operator"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                  <Condition condition={condition} index={index} />
                </React.Fragment>
              );
            })}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
