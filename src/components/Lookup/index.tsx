import React from "react";
import { TextField, CircularProgress } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useTranslation } from "react-i18next";
import { useGet } from "hooks/useApi";
import { LookupItem, Props } from "./lookup.interface";
import useStyles from "./styles";

export default function Lookup({
  lookupKey,
  label,
  onChange,
  disabled = false,
  multiple = false,
  size = "small",
  value,
}: Props) {
  const classes = useStyles();
  const {
    data = [],
    isLoading,
    refetch,
  } = useGet<LookupItem[]>({
    key: lookupKey,
    url: `/pass/api/lookups/values/v1/?key=${lookupKey}`,
    queryOptions: {
      staleTime: Infinity,
    },
  });
  const { t } = useTranslation();

  const selected = React.useMemo(
    () => data.find((i) => i.code == value),
    [value, data]
  );

  return (
    <Autocomplete
      autoHighlight
      multiple={multiple}
      size={size}
      disabled={disabled}
      className={classes.root}
      disableListWrap
      classes={{
        listbox: classes.listbox,
        popper: classes.popper,
      }}
      noOptionsText="بانتظار البيانات.." // TODO: Add to i18n
      options={data}
      value={selected || null}
      getOptionLabel={(option: LookupItem) =>
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
                {isLoading ? (
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

export * from "./lookup.interface";
