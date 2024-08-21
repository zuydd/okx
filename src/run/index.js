import colors from "colors";
import datetimeHelper from "../helpers/datetime.js";
import delayHelper from "../helpers/delay.js";
import authService from "../services/auth.js";
import gameService from "../services/game.js";
import socketService from "../services/socket.js";
import taskService from "../services/task.js";

const DELAY_ACC = 30;

const run = async (user) => {
  const dataUser = user.dataUser;
  const numberX = 1;
  await delayHelper.delay((dataUser.index - 1) * DELAY_ACC);
  console.log(
    `========== Đăng nhập tài khoản ${dataUser.index} | ${dataUser.fullName.green} ==========`
  );
  while (true) {
    const ip = await dataUser.http.checkProxyIP(dataUser);
    if (ip === -1) {
      const seconds = 60 * 5;
      await delayHelper.delay(
        seconds,
        colors.yellow(
          `Thử kết nối lại proxy sau ${datetimeHelper.formatDuration(seconds)}`
        ),
        dataUser.log
      );
      continue;
    }

    const info = await authService.getInfo(user);
    const secondRefresh = 90;
    if (!info) {
      const seconds = 60;
      await delayHelper.delay(
        seconds,
        colors.yellow(
          `Thử lấy lại dữ liệu sau ${datetimeHelper.formatDuration(seconds)}`
        ),
        dataUser.log
      );
      continue;
    }
    await taskService.getAllTask(user);
    const numChancesStart = info.numChancesTotal - numberX;
    const numChancesAwait = numChancesStart - info.numChances;
    let secondsDelay = secondRefresh * numChancesAwait;
    if (info.numChances >= numChancesStart) {
      await gameService.playGame(user, info.numChances);
      secondsDelay = secondRefresh * (info.numChancesTotal - numberX);
    }
    await delayHelper.delay(
      secondsDelay,
      colors.yellow(
        `Chờ thêm lượt chơi mới sau ${datetimeHelper.formatDuration(
          secondsDelay
        )}`
      ),
      dataUser.log
    );
  }
};

console.log(
  colors.yellow.bold(
    `=============  Tool phát triển và chia sẻ miễn phí bởi ZuyDD  =============`
  )
);
console.log(
  "Mọi hành vi buôn bán tool dưới bất cứ hình thức nào đều không được cho phép!"
);
console.log(
  `Telegram: ${colors.green(
    "https://t.me/zuydd"
  )}  ___  Facebook: ${colors.blue("https://www.facebook.com/zuy.dd")}`
);
console.log(
  `Cập nhật các tool mới nhất tại: ${colors.gray("https://github.com/zuydd")}`
);
console.log("");
console.log("");
console.log("");
socketService.initSocket();
const users = authService.getUser();
for (const [index, user] of users.entries()) {
  run(user);
}
