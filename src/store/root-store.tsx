import React from "react";
import { useTranslation } from "react-i18next";
import { useQueryCache } from "react-query";
import makeStore from "../utils/make-store";
import { Terminal, ClientInfo } from "../types";
import { useGet } from "../hooks/useApi";

type Biokit = {
  enabled: boolean;
};

type InitialState = {
  terminal_IP: string;
  terminal: Terminal | null;
  language: "ar" | "en";
  appVersion: string | null;
  updateAvailable: boolean;
  environment: string | null;
  biokit: Biokit;
};

export enum ACTIONS {
  TOGGLE_BIOKIT = "TOGGLE_BIOKIT",
  CHANGE_LANGUAGE = "CHANGE_LANGUAGE",
  CHANGE_TERMINAL = "CHANGE_TERMINAL",
  SET_APP_VERSION = "SET_APP_VERSION",
  TOGGLE_UPDATE_AVAILABLE = "TOGGLE_UPDATE_AVAILABLE",
  SET_APP_ENVIRONMENT = "SET_APP_ENVIRONMENT",
  SET_TERMINAL_IP = "SET_TERMINAL_IP",
}

type Actions =
  | {
      type: ACTIONS.CHANGE_LANGUAGE;
    }
  | {
      type: ACTIONS.CHANGE_TERMINAL;
      payload: Terminal;
    }
  | {
      type: ACTIONS.SET_APP_VERSION;
      payload: string;
    }
  | {
      type: ACTIONS.TOGGLE_BIOKIT;
    }
  | {
      type: ACTIONS.TOGGLE_UPDATE_AVAILABLE;
    }
  | {
      type: ACTIONS.SET_APP_ENVIRONMENT;
      payload: string | null;
    }
  | {
      type: ACTIONS.SET_TERMINAL_IP;
      payload: string;
    };

const currentLanguage = localStorage.getItem("lang") as "ar" | "en";

const initialState: InitialState = {
  terminal_IP: process.env.REACT_APP_TERMINAL_IP ?? "",
  biokit: {
    enabled: process.env.NODE_ENV !== "development",
  },
  terminal: null,
  language: currentLanguage || "ar",
  appVersion: null,
  updateAvailable: false,
  environment: null,
};

function reducer(state: InitialState, action: Actions): InitialState {
  switch (action.type) {
    case ACTIONS.TOGGLE_BIOKIT:
      return {
        ...state,
        biokit: {
          ...state.biokit,
          enabled: !state.biokit.enabled,
        },
      };
    case ACTIONS.CHANGE_LANGUAGE:
      const language = state.language === "ar" ? "en" : "ar";
      localStorage.setItem("lang", language);
      return {
        ...state,
        language,
      };
    case ACTIONS.CHANGE_TERMINAL:
      return {
        ...state,
        terminal: action.payload,
      };
    case ACTIONS.SET_APP_VERSION:
      return {
        ...state,
        appVersion: action.payload,
      };
    case ACTIONS.TOGGLE_UPDATE_AVAILABLE:
      return {
        ...state,
        updateAvailable: !state.updateAvailable,
      };
    case ACTIONS.SET_APP_ENVIRONMENT:
      return {
        ...state,
        environment: action.payload,
      };
    case ACTIONS.SET_TERMINAL_IP:
      return {
        ...state,
        terminal_IP: action.payload,
      };
    default:
      return state;
  }
}

const [AppStore, useAppStore, useAppDispatch] = makeStore<
  InitialState,
  Actions
>(reducer, initialState);

const useSetTerminal = () => {
  const key = "terminal";
  const queryCache = useQueryCache();
  const appDispatch = useAppDispatch();
  const appStore = useAppStore();
  const { data, isSuccess } = useGet<Terminal>({
    key,
    url: `/pass/api/terminal/v1`,
    headers: {
      "x-overridden-client-ip": appStore.terminal_IP,
    },
  });

  React.useEffect(() => {
    if (appStore.terminal) {
      queryCache.invalidateQueries(key);
    }
  }, [appStore.terminal_IP]);

  React.useEffect(() => {
    if (isSuccess)
      appDispatch({
        type: ACTIONS.CHANGE_TERMINAL,
        payload: data,
      });
  }, [isSuccess]);
};

const useSetTerminalIP = () => {
  const appDispatch = useAppDispatch();

  return (ip: string) => {
    appDispatch({
      type: ACTIONS.SET_TERMINAL_IP,
      payload: ip,
    });
  };
};

const useClientInfo = () => {
  const key = "client-info";
  const appStore = useAppStore();
  const appDispatch = useAppDispatch();
  const { data, headers } = useGet<ClientInfo>({
    key,
    url: `/pass/api/lookups/client/web/info/v1`,
  });
  const queryCache = useQueryCache();
  const environment = headers ? headers["x-environment"] : "production";

  const refetchData = () => queryCache.invalidateQueries(key);

  React.useEffect(() => {
    const updateCron = setInterval(refetchData, 300000);
    return () => clearInterval(updateCron);
  }, []);

  React.useEffect(() => {
    if (!data) return;

    if (!appStore.appVersion) {
      appDispatch({
        type: ACTIONS.SET_APP_VERSION,
        payload: data.version,
      });
      appDispatch({
        type: ACTIONS.SET_APP_ENVIRONMENT,
        payload: environment,
      });
    } else if (
      appStore.appVersion != data.version &&
      !appStore.updateAvailable
    ) {
      appDispatch({
        type: ACTIONS.TOGGLE_UPDATE_AVAILABLE,
      });
    }
  }, [data?.version]);
};

const useChangeLanguage = () => {
  const { i18n } = useTranslation();
  const appStore = useAppStore();
  const appDispatch = useAppDispatch();

  React.useLayoutEffect(() => {
    i18n.changeLanguage(appStore.language);
  }, [appStore.language]);

  return () => {
    appDispatch({
      type: ACTIONS.CHANGE_LANGUAGE,
    });
  };
};

const useToggleBiokit = () => {
  const appDispatch = useAppDispatch();

  return () => {
    appDispatch({
      type: ACTIONS.TOGGLE_BIOKIT,
    });
  };
};

export {
  AppStore,
  useAppStore,
  useAppDispatch,
  useSetTerminal,
  useClientInfo,
  useChangeLanguage,
  useSetTerminalIP,
  useToggleBiokit,
};
