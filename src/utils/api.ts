const API_URL = process.env.REACT_APP_API_URL ?? "";
const TERMINAL_URL = process.env.REACT_APP_TERMINAL_IP ?? "";

export async function fetchAPI(
  endpoint: string,
  {
    host = API_URL,
    method = "GET",
    params,
    body,
  }: {
    host?: string;
    method?: string;
    params?: object;
    body?: object;
  } = {}
) {
  let url = `${host}${endpoint}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-overridden-client-ip": TERMINAL_URL,
        "x-client-version": "", // TODO: get client version
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    return {
      ok: res.ok,
      data,
      headers: res.headers,
    };
  } catch (e) {
    throw new Error(e);
  }
}
