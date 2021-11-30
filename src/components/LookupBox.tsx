import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { fetchAPI } from "../utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    listbox: {
      boxSizing: "border-box",
      "& ul": {
        padding: 0,
        margin: 0,
      },
    },
    popper: {
      direction: "ltr",
    },
  })
);

interface IItem {
  code: string;
  arabic_label: string;
}

interface IState {
  data: IItem[];
  status: string;
  error: string;
}

interface IProps {
  lookup: string;
  label: string;
  onChange: (event: any, newValue: any, reason: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  defaultOption?: string;
  virtualized?: boolean;
  size?: "medium" | "small";
}

export default function Lookup({
  lookup,
  label,
  onChange,
  disabled = false,
  multiple = false,
  size = "small",
}: IProps) {
  const classes = useStyles();
  const [state, setState] = React.useState<IState>({
    data: [],
    status: "INITIAL",
    error: "",
  });

  React.useEffect(() => {
    setState((p) => ({ ...p, data: [], status: "LOADING" }));

    fetchAPI(`/pass/api/lookups/values/v1/?key=${lookup}`)
      .then(({ ok, data }) =>
        setState((p) => ({
          ...p,
          data,
          status: "SUCCESS",
        }))
      )
      .catch((e) =>
        setState((p) => ({ ...p, status: "ERROR", error: e.message }))
      );
  }, [lookup]);

  return (
    <Autocomplete
      multiple={multiple}
      size={size}
      disabled={disabled}
      className={classes.root}
      disableListWrap
      classes={{
        listbox: classes.listbox,
        popper: classes.popper,
      }}
      noOptionsText="بانتظار البيانات.." // TODO: translate this
      options={state.data}
      getOptionSelected={(option: IItem, value: IItem) =>
        option.code === value.code
      }
      getOptionLabel={(option: IItem) =>
        `${option.arabic_label} - ${option.code}`
      }
      onChange={onChange}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {state.status === "LOADING" ? (
                  <CircularProgress color="inherit" size={16} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
