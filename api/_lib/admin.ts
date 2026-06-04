export const adminPasswordHeader = "x-admin-password";

export function getHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
) {
  const value = headers[name] || headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export function isAdminPasswordValid(password: unknown) {
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  return (
    typeof password === "string" &&
    password.length > 0 &&
    expectedPassword.length > 0 &&
    password === expectedPassword
  );
}
