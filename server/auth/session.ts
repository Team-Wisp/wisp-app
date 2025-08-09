import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "tw_session";
const maxAge = 60 * 60 * 24; // 1 day

export async function setSessionCookie(token: string) {
  (await cookies()).set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionCookie() {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null;
}

// Debug function to check all cookies
export async function getAllCookies() {
  const cookieStore = await cookies();
  return cookieStore.getAll();
}
