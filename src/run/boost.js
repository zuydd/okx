import colors from "colors";
import delayHelper from "../helpers/delay.js";
import boostsService from "../services/boosts.js";

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
const boostId = await boostsService.selectBoost();
const { selected: userSelected, users } = await boostsService.selectUser(
  boostId
);

if (!userSelected?.length) {
  console.log("Không có tài khoản nào được chọn");
} else {
  const userIdSelected = userSelected.map((user) => user.id);
  for (const user of users) {
    const dataUser = user.dataUser;
    const hasBoost = userIdSelected.includes(dataUser.user.id);
    if (hasBoost) {
      const boost = userSelected.find(
        (userSelect) => userSelect.id === dataUser.user.id
      )?.boost;
      if (boost) {
        await boostsService.handleBoosts(user, boost);
        await delayHelper.delay(2);
      }
    }
  }
}
