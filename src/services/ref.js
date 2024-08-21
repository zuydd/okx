import axios from "axios";
import delayHelper from "../helpers/delay.js";
import fileHelper from "../helpers/file.js";

class RefService {
  constructor() {}

  getData() {
    const rawDatas = fileHelper.readFile("ref.txt");
    const dataRefs = rawDatas
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((data, index) => {
        const arrData = data.split("|");
        return {
          id: arrData[0],
          username: arrData[1],
          index,
        };
      });

    return dataRefs;
  }

  headers() {
    return {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9",
      "App-Type": "web",
      "Content-Type": "application/json",
      Origin: "https://www.okx.com",
      Referer:
        "https://www.okx.com/mini-app/racer?tgWebAppStartParam=linkCode_85298986",
      "Sec-Ch-Ua":
        '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126", "Microsoft Edge WebView2";v="126"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
      "X-Cdn": "https://www.okx.com",
      "X-Locale": "en_US",
      "X-Utc": "7",
      "X-Zkdex-Env": "0",
    };
  }

  async ref(data) {
    try {
      const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/info?t=${Date.now()}`;
      const headers = this.headers();
      const payload = {
        extUserId: data.id,
        extUserName: data.username,
        gameId: 1,
        linkCode: "94626092",
      };

      const response = await axios.post(url, payload, { headers });
      const dataResponse = response.data;
      if (dataResponse.code !== 0) {
        throw new Error(`Ref thất bại: ${dataResponse.error_message}`);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  async handleRef(dataRefs) {
    for (const data of dataRefs) {
      await this.ref(data);
      await this.assessPrediction(data);
    }
  }

  async assessPrediction(dataRefs) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/assess?t=${Date.now()}`;
    const headers = this.headers();
    const payload = {
      extUserId: dataRefs.id,
      predict: 1,
      gameId: 1,
    };

    for (let index = 0; index < 10; index++) {
      const response = await axios.post(url, payload, { headers });
      if (response.data.data.won) {
        console.log(
          `[ No ${dataRefs.index} _ ID: ${dataRefs.id} ] Ref thành công`
        );
        break;
      } else {
        await delayHelper.delay(5);
      }
    }
  }
}

const refService = new RefService();
export default refService;
