import colors from "colors";
import dayjs from "dayjs";
import inquirer from "inquirer";
import delayHelper from "../helpers/delay.js";
import authService from "./auth.js";

class BoostsService {
  constructor() {}

  async getAllBoosts(user) {
    const dataUser = user.dataUser;
    const params = {
      extUserId: dataUser.user.id,
    };
    try {
      const response = await dataUser.http.get("boosts", params);
      const dataResponse = response.data;
      const data = dataResponse.data;
      if (dataResponse.code === 0) {
        return data;
      } else {
        throw new Error(
          `Lấy danh sách boosts thất bại: ${dataResponse.error_message}`
        );
      }
    } catch (error) {
      dataUser.log.logError(error.message);
      return [];
    }
  }

  async handleBoosts(user, boost) {
    const dataUser = user.dataUser;
    const body = { extUserId: dataUser.user.id, id: boost.id };
    try {
      const response = await dataUser.http.post("boost", body);
      const dataResponse = response.data;
      // const data = dataResponse.data;
      if (dataResponse.code === 0) {
        if (boost.id === 1) {
          dataUser.log.log(
            `Nạp lại nhiên liệu thành công, lượt chơi hiện có: ${colors.green(
              user?.dataServer?.numChancesTotal
            )} ⛽`
          );
        } else if (boost.id === 2) {
          dataUser.log.log(
            `Nâng cấp sức chứa thành công, sức chứa hiện tại: ${colors.green(
              10 + (boost?.curStage + 1) * 2
            )}`
          );
        } else if (boost.id === 3) {
          dataUser.log.log(
            `Nâng cấp bộ sạc thành công, điểm cơ bản hiện tại: ${colors.green(
              10 + (boost?.curStage + 1) * 10
            )}`
          );
        }
        return true;
      } else {
        throw new Error(`Nâng cấp thất bại: ${dataResponse.error_message}`);
      }
    } catch (error) {
      dataUser.log.logError(error.message);
      return false;
    }
  }

  async refillsDaily(user) {
    // chạy refillsDaily trong khoảng 20h-23h để tối ưu
    if (dayjs().hour() < 20 || dayjs().hour() >= 23) return false;
    const boosts = await this.getAllBoosts(user);
    const boostRefill = boosts.find(
      (boost) =>
        boost.id === 1 &&
        boost.curStage < boost.totalStage &&
        boost.pointCost === 0
    );
    if (boostRefill) {
      const status = await this.handleBoosts(user, boostRefill);
      return status;
    } else {
      return false;
    }
  }

  async selectBoost() {
    const items = [
      { name: "🏎️ Fuel - Tăng thêm 2 sức chứa", value: 2 },
      { name: "🚀 Turbo Charger - Tăng 10 điểm cơ bản", value: 3 },
    ];
    try {
      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "selectedItem",
          message: "Chọn một loại nâng cấp:",
          choices: items,
        },
      ]);
      return answers.selectedItem;
    } catch (error) {
      if (error.isTtyError) {
        console.error(
          "Không thể hiển thị giao diện trong môi trường hiện tại."
        );
      } else {
        console.error("Đã xảy ra lỗi:", error);
      }
      return -1;
    }
  }

  async selectUser(id) {
    const users = authService.getUser();
    const items = await Promise.all(
      users.map(async (user, index) => {
        await delayHelper.delay(0.5 + index);
        const dataUser = user.dataUser;
        const ip = await dataUser.http.checkProxyIP(dataUser);
        if (ip === -1)
          return {
            name: null,
            value: {},
          };
        const boostsData = await this.getAllBoosts(user);
        const boost = boostsData.find((boost) => boost.id === id);
        const LevelBoost = `Level ${boost.curStage}`;
        const nameBoosts = ["", "", "🏎️ Fuel", "🚀 Turbo Charger"];
        return {
          name: ` Tài khoản ${dataUser.index} | ${dataUser.fullName.green} \t| ${dataUser.user.id} | ${nameBoosts[id]} - ${LevelBoost.blue}`,
          value: {
            id: dataUser.user.id,
            boost,
          },
        };
      })
    );
    items.filter((item) => item.name !== null);
    if (items.length > 1) {
      items.unshift({
        name: " Tất cả",
        value: {
          id: "all",
          boost: null,
        },
      });
    }

    try {
      const answers = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selectedItems",
          message: "Chọn một hoặc nhiều tài khoản cần nâng cấp:",
          choices: items,
        },
      ]);
      if (answers.selectedItems.map((item) => item.id).includes("all")) {
        return {
          users,
          selected: items.slice(1).map((item) => item.value),
        };
      } else {
        return {
          users,
          selected: answers.selectedItems,
        };
      }
    } catch (error) {
      if (error.isTtyError) {
        console.error(
          "Không thể hiển thị giao diện trong môi trường hiện tại."
        );
      } else {
        console.error("Đã xảy ra lỗi:", error.message);
      }
      return -1;
    }
  }
}

const boostsService = new BoostsService();
export default boostsService;
