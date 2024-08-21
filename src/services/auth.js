import colors from "colors";
import { parse } from "querystring";
import fileHelper from "../helpers/file.js";
import { LogHelper } from "../helpers/log.js";
import { HttpService } from "./http.js";
import { UserService } from "./user.js";

class AuthService {
  constructor() {}

  getUser(fileName = "users.txt") {
    const raw = fileHelper.readFile(fileName);
    const rawProxies = fileHelper.readFile("proxy.txt");

    const rawUsers = raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const proxies = rawProxies
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (rawUsers.length <= 0) {
      console.log(colors.red(`Không tìm thấy dữ liệu`));
      return [];
    } else {
      const usersDecode = rawUsers.map((line, index) => {
        const valueParse = parse(decodeURIComponent(line));
        const dataHeaders = {
          devid: "",
          idGroup: "",
        };
        const user = JSON.parse(valueParse.user);
        const userData = {
          ...valueParse,
          ...dataHeaders,
          user,
          fullName: (user.first_name + " " + user.last_name).trim(),
          raw: decodeURIComponent(line),
          index: index + 1,
          proxy: proxies[index] || null,
          http: new HttpService(
            decodeURIComponent(line),
            dataHeaders,
            proxies[index] || null
          ),
          log: new LogHelper(index + 1, user.id),
        };
        return new UserService(userData);
      });
      return usersDecode;
    }
  }

  async getInfo(user) {
    const dataUser = user.dataUser;
    const body = {
      extUserId: dataUser.user.id,
      extUserName: dataUser.fullName,
      gameId: 1,
      linkCode: "61931140",
    };
    try {
      const response = await dataUser.http.post("info", body);
      const dataResponse = response.data;
      const data = dataResponse.data;
      if (dataResponse.code === 0) {
        user.updateDataServer("numChancesTotal", data.numChancesTotal);
        user.updateDataServer("numChances", data.numChances);
        dataUser.log.logSuccess("Lấy dữ liệu thành công");
        dataUser.log.log(
          `Điểm: ${colors.green(
            data.balancePoints
          )} 🏁 --- Tổng điểm: ${colors.green(data.accumPoints)}`
        );
        dataUser.log.log(`Lượt chơi: ${colors.green(data.numChances)} ⛽`);
        return data;
      } else {
        throw new Error(`Lấy dữ liệu thất bại: ${dataResponse.error_message}`);
      }
    } catch (error) {
      console.log(error);
      dataUser.log.logError(error.message);
      return null;
    }
  }
}
const authService = new AuthService();
export default authService;
