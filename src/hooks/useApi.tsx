import { useQuery, useMutation } from "react-query";
import { useLogout } from "store/user-store";

type Args = {
  key: string;
  url: string;
  method?: string;
  headers?: {
    [key: string]: string;
  };
  body?: any;
  queryOptions?: any;
};

type StatusCode = {
  status: number;
};

export type ApiError = StatusCode & {
  error_code: string;
  reason: string;
  more_details?: any;
  message?: string;
};

type SuccessRequest = StatusCode & {
  data: any;
  headers: {
    [key: string]: string;
  };
};

const baseUrl = process.env.REACT_APP_API_URL ?? "";

const getHeader = (newHeaders?: any) => {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${sessionStorage.token}`);
  headers.set("Content-Type", "application/json");
  process.env.REACT_APP_TERMINAL_IP &&
    headers.set("x-overridden-client-ip", process.env.REACT_APP_TERMINAL_IP);
  sessionStorage.clientVersion &&
    headers.set("x-client-version", sessionStorage.clientVersion);

  if (newHeaders) {
    Object.keys(newHeaders).map((key) => headers.set(key, newHeaders[key]));
  }

  return headers;
};

const options = {
  refetchOnWindowFocus: false,
  retry: process.env.NODE_ENV === "development" ? false : 3,
};

export const fetcher = async (
  key: string,
  url: string,
  method: string,
  headers?: any,
  body?: any
) => {
  try {
    const res = await fetch(`${baseUrl}${url}`, {
      method,
      headers: getHeader(headers),
      body: body ? JSON.stringify(body) : undefined,
    });

    const resHeaders: any = {
      "x-signature": res.headers.get("x-signature"),
      "x-environment": res.headers.get("x-environment"),
    };

    // Successful request
    if (res.ok) {
      // Request success 200 with body
      try {
        const data = await res.json();

        return Promise.resolve({
          status: res.status,
          data,
          headers: resHeaders,
        } as SuccessRequest);
      } catch (e) {
        // Request success 20x with no body
        return Promise.resolve({
          status: res.status,
          data: null,
          headers: resHeaders,
        } as SuccessRequest);
      }
    }

    // Resquest error
    else {
      // Request error with body
      try {
        const data = await res.json();

        return Promise.reject({
          status: res.status,
          ...data,
        });
      } catch (e) {
        // Request error with no body
        return Promise.reject({
          status: res.status,
          headers: resHeaders,
        });
      }
    }
  } catch (e) {
    throw new Error(e.message);
  }
};

export function useGet<DataType>({
  key,
  url,
  method = "GET",
  headers = {},
  queryOptions = {},
}: Args) {
  const logout = useLogout();
  const { data, ...query } = useQuery([key, url, method, headers], fetcher, {
    ...options,
    ...queryOptions,
  });

  if (query.isError && (query.error as ApiError).status === 401) {
    logout();
  }

  return {
    data: data?.data as DataType,
    headers: data?.headers,
    ...query,
  };
}
