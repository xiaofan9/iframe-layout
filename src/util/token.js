import cookies from "js-cookie";

const tokenKey = "token";
const inFifteenMinutes = new Date(new Date().getTime() + 120 * 60 * 1000);

export function getToken() {
  return cookies.get(tokenKey);
}

export function setToken(token) {
  return cookies.set(tokenKey, token, { expires: inFifteenMinutes });
}

export function removeToken() {
  return cookies.set(tokenKey, "");
}
