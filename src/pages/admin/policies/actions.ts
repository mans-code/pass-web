export const deletePolicy = (condition_id: number) =>
  fetch(
    `${process.env.REACT_APP_API_URL ?? ""}/pass/api/admin/policy/condition/v1`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.token}`,
        "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP ?? "",
      },
      body: JSON.stringify({
        condition_id,
      }),
    }
  ).then((res) => res.json());
