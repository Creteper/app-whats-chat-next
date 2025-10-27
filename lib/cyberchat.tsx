import axios from "axios";
import { type AxiosInstance } from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { setCookie, getCookies } from "./cookies";
import { type UserInfo } from "@/types/users"
import { md5 } from "./md5";
import localforage from "localforage";

export type CyberChatUser = {
  username: string;
  password: string;
};

export type CyberChatLoadAIListParams = {
  ugroup: string;
  nsfw: string;
  type: string;
  not_in: string;
};

export interface CyberChatResponse {
  code: number;
  message: string;
  data: any;
}

// 生成随机 User-Agent 的函数
function generateUserAgent(): string {
  const browsers = [
    {
      name: "Chrome",
      versions: [
        "98.0.4758.102",
        "99.0.4844.51",
        "100.0.4896.75",
        "101.0.4951.67",
      ],
    },
    {
      name: "Firefox",
      versions: ["97.0", "98.0", "99.0", "100.0"],
    },
    {
      name: "Safari",
      versions: ["15.3", "15.4", "15.5", "16.0"],
    },
  ];

  const operatingSystems = [
    "Windows NT 10.0; Win64; x64",
    "Macintosh; Intel Mac OS X 10_15_7",
    "X11; Linux x86_64",
  ];

  const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];
  const randomVersion =
    randomBrowser.versions[
      Math.floor(Math.random() * randomBrowser.versions.length)
    ];
  const randomOS =
    operatingSystems[Math.floor(Math.random() * operatingSystems.length)];

  if (randomBrowser.name === "Safari") {
    return `Mozilla/5.0 (${randomOS}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${randomVersion} Safari/605.1.15`;
  } else {
    return `Mozilla/5.0 (${randomOS}) AppleWebKit/537.36 (KHTML, like Gecko) ${randomBrowser.name}/${randomVersion} Safari/537.36`;
  }
}

export default class CyberChatAPI {
  private url: string;
  private axiosInstance: AxiosInstance;
  private cookieJar: CookieJar;
  private user: CyberChatUser = {} as CyberChatUser;
  public baseUrl: string;
  public ua: string;
  public userNameMd5: string = "";
  public passWordMd5: string = "";

  // 构造函数
  constructor() {
    this.url = "/api/chat2/assets/data/";
    this.cookieJar = new CookieJar();
    this.baseUrl = "https://cyberchat.vip";
    console.log(this.baseUrl);
    // 生成随机 User-Agent
    const userAgent = generateUserAgent();
    this.ua = userAgent;
    this.axiosInstance = wrapper(
      axios.create({
        baseURL: this.url,
        timeout: 10000,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": userAgent,
        },
        jar: this.cookieJar,
        withCredentials: true,
      })
    );
  }

  async login(user: CyberChatUser) {
    this.user = user;
    // 在登录时进行密码加密
    this.userNameMd5 = md5(this.user.username);
    this.passWordMd5 = md5(this.user.password);

    localforage.setItem("userNameMd5", this.userNameMd5);
    localforage.setItem("passWordMd5", this.passWordMd5);

    setCookie(this.cookieJar, "login_uid", this.userNameMd5, this.baseUrl);
    setCookie(this.cookieJar, "psd", this.passWordMd5, this.baseUrl);

    let response = await this.axiosInstance.post("/login.php", {
      uid: this.user.username,
      psd: this.passWordMd5,
    });

    const responseInterface: CyberChatResponse = {} as CyberChatResponse;
    responseInterface.code = response.status;

    if (response.status != 200) {
      responseInterface.message = "登录失败，请检查网络状态";
      return responseInterface;
    }

    responseInterface.data = response.data;

    // 修复比较逻辑，正确检查数据是否为空
    if (
      Array.isArray(responseInterface.data) &&
      responseInterface.data.length === 0
    ) {
      responseInterface.code = 400;
      responseInterface.message = "登录失败，请检查用户名或密码";
      return responseInterface;
    }

    response = await this.axiosInstance.post("/insert_login_log.php", {
      uid: this.userNameMd5,
      ua: this.ua,
    });
    responseInterface.message = "登录成功";

    return responseInterface;
  }

  async getUserInfo() {
    const response = await this.axiosInstance.post("/load_user_info.php", {
      uid: this.user.username,
    });

    return response.data as UserInfo;
  }

  async getAIList(pm: CyberChatLoadAIListParams) {
    const response = await this.axiosInstance.post("/load_AI_list.php", pm);
    return response.data;
  }
}

export async function CheckLoginStatus() {
  const uid = await localforage.getItem("userNameMd5");
  return uid ? true : false;
}
