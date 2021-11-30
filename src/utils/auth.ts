export const logout = () => {
  fetch(
    `${process.env.REACT_APP_API_URL ?? ""}/pass/api/auth/logout/v1`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.token}`,
        "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP
          ? `${process.env.REACT_APP_TERMINAL_IP}`
          : "",
      },
    }
  ).then((res) => sessionStorage.clear());
};
