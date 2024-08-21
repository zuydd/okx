import colors from "colors";
import dayjs from "dayjs";
import delayHelper from "../helpers/delay.js";
import generatorHelper from "../helpers/generator.js";
import boostsService from "./boosts.js";
import socketService from "./socket.js";

class GameService {
  constructor() {
    // sửa autoWin = true để chuyển sang chế độ dự đoán auto win
    this.autoWin = false;
  }

  async playGame(user, totalTurn) {
    const dataUser = user.dataUser;

    // Các chế độ chơi game
    // 0 - Đánh auto 1
    // 1 - Đánh chuổi nhỏ
    // 2 - Đánh chuổi lớn

    const maxSort = Math.round(totalTurn / 3);
    const maxLong = Math.round((totalTurn / 3) * 1.5);
    const randomMode = Math.random();
    let mode = 0;
    let max = 0;
    let startWin = 0;
    if (randomMode > 0.25 && randomMode <= 0.7) {
      mode = 1;
      max = maxSort;
      startWin = generatorHelper.randomInt(1, totalTurn - maxSort);
    } else if (randomMode > 0.7) {
      mode = 2;
      max = maxLong;
      startWin = generatorHelper.randomInt(1, totalTurn - maxLong);
    }
    let countGame = 0;
    if (this.autoWin) {
      dataUser.log.log(
        "Mode: auto win (tỷ lệ dự đoán 99.5%... Bị ban acc đừng có trách 😆)"
      );
    } else {
      dataUser.log.log(
        `Mode: ${mode} - Số lần win tối đa: ${max} - Win từ lần chơi thứ ${startWin}`
      );
    }
    // Nhập khung giở không muốn chạy tool vào mảng bên dưới
    const hourPause = [18, 19];
    if (hourPause.includes(dayjs().hour())) {
      await delayHelper.delay(1000);
      return;
    }
    let socketErrorCount = 0;
    while (true) {
      if (socketErrorCount > 4) {
        socketService.closeSocket();
        await delayHelper.delay(10);
        socketService.initSocket();
        await delayHelper.delay(10);
        dataUser.log.log(colors.magenta("Đã kết nối lại socket"));
        socketErrorCount = 0;
      }
      countGame++;
      const numChance = await this.assessGame(
        user,
        mode,
        max,
        startWin,
        countGame
      );
      if (numChance === 0) {
        socketErrorCount = 0;
        const checkRefill = await boostsService.refillsDaily(user);
        if (!checkRefill) {
          break;
        } else {
          const randomMode = Math.random();
          countGame = 0;
          mode = 0;
          max = 0;
          startWin = 0;
          if (randomMode > 0.35) {
            mode = 1;
            max = maxSort;
            startWin = generatorHelper.randomInt(1, totalTurn - maxSort);
          } else if (randomMode > 0.8) {
            mode = 2;
            max = maxLong;
            startWin = generatorHelper.randomInt(1, totalTurn - maxLong);
          }
        }
      }
      if (numChance === -1) {
        await delayHelper.delay(60);
        continue;
      }
      if (numChance === 3) {
        countGame--;
        socketErrorCount++;
      }
    }
  }

  async assessGame(user, mode, max, startWin, countGame) {
    const dataUser = user.dataUser;
    let dataPrice = { status: 1 };
    if (
      this.autoWin ||
      (mode !== 0 && countGame >= startWin && countGame < startWin + max)
    ) {
      dataPrice = await socketService.getPriceBTC();
    } else {
      const timeDelay = generatorHelper.randomInt(5, 7);
      await delayHelper.delay(timeDelay);
    }
    if (dataPrice.prices && dataPrice.prices.length < 5) {
      const retryAfter = 15;
      await delayHelper.delay(
        retryAfter,
        colors.red(`Socket quá tải, thử lại sau ${retryAfter}s`),
        dataUser.log
      );
      return 3;
    }
    const body = {
      extUserId: dataUser.user.id,
      predict: dataPrice.status,
      gameId: 1,
    };

    try {
      const response = await dataUser.http.post("assess", body);
      const dataResponse = response.data;
      const data = dataResponse.data;
      if (dataResponse.code === 0) {
        if (data.won) {
          dataUser.log.log(
            `Lần ${countGame} - Chơi game thắng, phần thưởng: ${colors.green(
              data.basePoint * data.multiplier
            )} 🏁`
          );
        } else {
          dataUser.log.log(`Lần ${countGame} - Chơi game thua 😭`);
        }
        return data.numChance;
      } else {
        throw new Error(`Chơi game thất bại: ${dataResponse.error_message}`);
      }
    } catch (error) {
      dataUser.log.logError(error.message);
      return -1;
    }
  }
}

const gameService = new GameService();
export default gameService;
