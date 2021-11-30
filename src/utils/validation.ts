export const validateUserPolicy = (validator: string) => {
  let applied_policies = JSON.parse(sessionStorage.applied_policies);
  return (
    applied_policies.filter((p: string) => p.includes(validator)).length > 0
  );
};

export const validatePolicy = (policies: string[], validator: string) =>
  policies.filter((p: string) => p.includes(validator)).length > 0;

export const validateIPv4 = (ip: string) =>
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip
  );
