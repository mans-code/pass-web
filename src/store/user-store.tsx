import React from "react";
import { useMutation } from "react-query";
import { useHistory } from "react-router-dom";
import { differenceInMinutes } from "date-fns";
import makeStore from "../utils/make-store";
import { User } from "../types";
import useActivityDetector from "hooks/useActivityDetector";
import { fetcher, ApiError } from "hooks/useApi";
import useInterval from "hooks/useInterval";

export enum ACTIONS {
  SET_USER = "SET_USER",
  SET_TOKEN_WILL_EXPIRE = "SET_TOKEN_WILL_EXPIRE",
}

type Actions =
  | {
      type: ACTIONS.SET_USER;
      payload: User;
    }
  | {
      type: ACTIONS.SET_TOKEN_WILL_EXPIRE;
    };

type InitialState = {
  user: User | null;
  tokenWillExpire: boolean;
};

const initialState: InitialState = {
  user: null,
  tokenWillExpire: false,
};

function reducer(state: InitialState, action: Actions): InitialState {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case ACTIONS.SET_TOKEN_WILL_EXPIRE:
      return {
        ...state,
        tokenWillExpire: !state?.tokenWillExpire,
      };
    default:
      return state;
  }
}

const [UserStore, useUserStore, useUserDispatch] = makeStore<
  InitialState,
  Actions
>(reducer, initialState);

const mutator = (url: string) => fetcher(``, url, "POST");

const useRefreshToken = () => {
  const history = useHistory();
  const logout = useLogout();
  const [mutate] = useMutation(mutator, {
    onError: (error) => {
      if ((error as ApiError).status === 401) {
        logout();
        history.replace("/login");
      }
    },
    onSuccess: (data) => {
      sessionStorage.lastRefreshTokenTime = new Date();
      sessionStorage.token = data?.data.access_token;
      sessionStorage.tokenShortLifetimeMins =
        data?.data.access_token_lifetime_minutes;
    },
  });

  return React.useCallback(async () => {
    await mutate(`/pass/api/auth/token/refresh/v1`);
  }, []);
};

const useLogout = () => {
  const history = useHistory();
  const [mutate, { error }] = useMutation(mutator, {
    onError: () => {
      console.log(error);
    },
    onSuccess: () => {
      history.replace("/login");
      sessionStorage.clear();
    },
  });
  return async () => {
    await mutate(`/pass/api/auth/logout/v1`);
  };
};

const useUserToken = () => {
  const history = useHistory();
  const activityStatus = useActivityDetector();
  const refreshToken = useRefreshToken();
  const logout = useLogout();
  const userDispatch = useUserDispatch();

  useInterval(() => {
    let diff = differenceInMinutes(
      new Date(),
      Date.parse(sessionStorage.lastRefreshTokenTime)
    );

    // Logout if refresh token lifetime is expired
    if (
      diff >= sessionStorage.tokenRefreshLifetimeMins ||
      diff >= sessionStorage.tokenShortLifetimeMins
    ) {
      logout();
      history.replace("/login");
    }
    // Alert user when idle before logout
    else if (diff >= sessionStorage.tokenShortLifetimeMins - 2) {
      if (activityStatus === "idle") {
        userDispatch({
          type: ACTIONS.SET_TOKEN_WILL_EXPIRE,
        });
      } else if (activityStatus === "active") {
        refreshToken();
      }
    }
  }, 30000);

  React.useEffect(() => {
    let diff = differenceInMinutes(
      new Date(),
      Date.parse(sessionStorage.lastRefreshTokenTime)
    );

    if (
      activityStatus === "active" &&
      diff >= sessionStorage.tokenShortLifetimeMins - 2
    ) {
      refreshToken();
    }
  }, [activityStatus, refreshToken]);
};

export {
  UserStore,
  useUserStore,
  useUserDispatch,
  useUserToken,
  useLogout,
  useRefreshToken,
};
