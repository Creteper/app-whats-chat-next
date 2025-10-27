import { type CookieJar } from "tough-cookie";

// 添加一个函数来获取 cookiez
async function getCookies(cookieJar: CookieJar, url: string) {
  const cookies = await cookieJar.getCookies(url);
  return cookies;
}

// 添加一个函数来设置 cookies
async function setCookie(
  cookieJar: CookieJar,
  name: string,
  value: string,
  url: string,
  options = {}
) {
  const cookie = `${name}=${value}`;
  await cookieJar.setCookie(cookie, url, options);
}

// 添加一个函数来删除 cookies
async function removeCookies(cookieJar: CookieJar) {
  await cookieJar.removeAllCookies(); // 或者使用更精确的方法删除特定 cookie
}


export { getCookies, setCookie, removeCookies };