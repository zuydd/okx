import axios from "axios";
import dayjs from "dayjs";
import { HttpsProxyAgent } from "https-proxy-agent";

export class HttpService {
  constructor(query, dataHeaders = null, proxy = null) {
    if (query && query.includes("query_id=")) {
      this.query = encodeURI(query);
    } else {
      this.query = query;
    }
    if (dataHeaders) {
      this.dataHeaders = dataHeaders;
    } else {
      this.dataHeaders = {
        devid: "",
        idGroup: "",
      };
    }
    this.proxy = proxy;
    this.baseURL = "https://www.okx.com/priapi/v1/affiliate/game/racer/";
    this.headers = {
      host: "www.okx.com",
      connection: "keep-alive",
      accept: "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      "content-type": "application/json",
      origin: "https://www.okx.com",
      "Sec-Ch-Ua":
        '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126", "Microsoft Edge WebView2";v="126"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "X-Utc": "7",
      "App-Type": "web",
      "X-Locale": "en_US",
      "X-Telegram-Init-Data": this.query,
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: "https://www.okx.com/mini-app/racer",
      "accept-language": "vi-VN,vi;q=0.9",
      "X-Site-Info":
        "==QfxojI5RXa05WZiwiIMFkQPx0Rfh1SPJiOiUGZvNmIsIiTWJiOi42bpdWZyJye",
      "X-Id-Group": "1030418012460740002-c-2",
      Devid: "295e1943-0a6f-4e01-b208-e4aa7dd05cd5",
      "X-Zkdex-Env": "0",
    };
  }

  initConfig() {
    const config = {
      headers: this.headers,
    };
    if (this.proxy && this.proxy !== "skip") {
      config["httpsAgent"] = new HttpsProxyAgent(this.proxy);
    }
    return config;
  }

  get(endPoint, paramsExtend = {}) {
    const params = {
      t: Math.floor(dayjs().valueOf() / 1000),
      ...paramsExtend,
    };
    const queryString = "?" + new URLSearchParams(params).toString();
    const url = this.baseURL + endPoint + queryString;
    const config = this.initConfig();
    return axios.get(url, config);
  }

  post(endPoint, body, paramsExtend = {}) {
    const params = {
      t: Math.floor(dayjs().valueOf() / 1000),
      ...paramsExtend,
    };
    const queryString = "?" + new URLSearchParams(params).toString();
    const url = this.baseURL + endPoint + queryString;
    const config = this.initConfig();
    // console.log(config);
    return axios.post(url, body, config);
  }

  async checkProxyIP(user) {
    if (!this.proxy || this.proxy === "skip") {
      user.log.updateIp("🖥️");
      return null;
    }
    try {
      const proxyAgent = new HttpsProxyAgent(this.proxy);
      const response = await axios.get("https://api.ipify.org?format=json", {
        httpsAgent: proxyAgent,
      });
      if (response.status === 200) {
        const ip = response.data.ip;
        user.log.updateIp(ip);
        return ip;
      } else {
        throw new Error("Proxy lỗi, kiểm tra lại kết nối proxy");
      }
    } catch (error) {
      user.log.updateIp("🖥️");
      user.log.logError("Proxy lỗi, kiểm tra lại kết nối proxy");
      return -1;
      // const dataLog = `[No ${user.index} _ ID: ${
      //   user.user.id
      // } _ Time: ${dayjs().format(
      //   "YYYY-MM-DDTHH:mm:ssZ[Z]"
      // )}] Lỗi kết nối proxy - ${user.proxy}`;
    }
  }
}

const httpService = new HttpService();
export default httpService;
