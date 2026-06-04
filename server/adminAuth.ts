export const adminPasswordHeader = "x-admin-password";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function isAdminPasswordValid(password: unknown) {
  const expectedPassword = getAdminPassword();
  return (
    typeof password === "string" &&
    password.length > 0 &&
    expectedPassword.length > 0 &&
    password === expectedPassword
  );
}

export function getMissingAdminPasswordMessage() {
  return "ADMIN_PASSWORD is not configured.";
}
