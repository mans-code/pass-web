import React, { Dispatch, SetStateAction } from "react";
import { TextField, CircularProgress, makeStyles } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useTranslation } from "react-i18next";
import { useGet } from "hooks/useApi";
import { Lookup } from "types";

const useStyles = makeStyles({
  autoComplete: {
    width: "100%",
    margin: 0,
  },
  popper: {
    direction: "ltr",
  },
});

type AsyncComboBoxProps = {
  lookup: "airlines" | "countries" | "ship_companies";
  setTransporter: Dispatch<SetStateAction<string>>;
  setTransporterName: Dispatch<SetStateAction<string>>;
  setDestination: Dispatch<SetStateAction<string>>;
  setDestinationName: Dispatch<SetStateAction<string>>;
  selectedTransporter: any;
  setSelectedTransporter: Dispatch<SetStateAction<any>>;
  selectedDestination: any;
  setSelectedDestination: Dispatch<SetStateAction<any>>;
  travelDirection: string;
};

export default function AsyncComboBox({
  lookup,
  setTransporter,
  setTransporterName,
  setDestination,
  setDestinationName,
  selectedTransporter,
  setSelectedTransporter,
  selectedDestination,
  setSelectedDestination,
  travelDirection,
}: AsyncComboBoxProps) {
  const classes = useStyles();
  const { t } = useTranslation("errors");
  const [open, setOpen] = React.useState(false);
  const {
    data: options = [],
    isSuccess,
    isLoading,
    isError,
    error,
  } = useGet<Lookup[]>({
    key: lookup,
    url: `/pass/api/lookups/values/v1/?key=${lookup}`,
  });

  const loading = open && isLoading;

  return (
    <Autocomplete
      autoHighlight
      openOnFocus
      multiple={false}
      className={classes.autoComplete}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionSelected={(option: Lookup, value: Lookup) =>
        option.code === value.code
      }
      getOptionLabel={(option) => `${option.arabic_label} -- ${option.code}`}
      options={options.filter((option) => {
        if (lookup === "countries" && !option.code) {
          return false;
        }
        return true;
      })}
      loading={loading}
      noOptionsText={t("common->none")}
      classes={{
        popper: classes.popper,
      }}
      value={lookup === "countries" ? selectedDestination : selectedTransporter}
      onChange={(event: any, option: any | null) => {
        if (lookup === "countries") {
          setSelectedDestination(option);
          setDestination(String(option?.code) ?? "");
          setDestinationName(option?.arabic_label ?? "");
        } else {
          setSelectedTransporter(option);
          setTransporter(String(option?.code) ?? "");
          setTransporterName(option?.arabic_label ?? "");
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={
            lookup === "countries"
              ? t(`travel->${travelDirection}`)
              : t(`travel->transporter`)
          }
          variant="outlined"
          margin="dense"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
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
