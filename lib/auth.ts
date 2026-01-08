import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function isAdmin() {
  const { getAccessToken } = getKindeServerSession();
  const accessToken = await getAccessToken();
  // Kinde roles are in accessToken.roles as an array of objects with key and name
  if (!accessToken?.permissions) return false;
  return accessToken.permissions.some((permission) => permission === "admin");
}