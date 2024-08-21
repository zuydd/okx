import dayjs from "dayjs";
import WebSocket from "ws";

class SocketService {
  constructor() {
    this.url = "wss://wspri.okx.com:8443/ws/v5/ipublic";
    this.options = {
      headers: {
        Upgrade: "websocket",
        Pragma: "no-cache",
        "Sec-WebSocket-Key": "4M28H3PbXXkF91c4SfmEYg==",
        "Sec-Fetch-Site": "cross-site",
        "Sec-WebSocket-Version": "13",
        "Sec-WebSocket-Extensions": "permessage-deflate",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Mode": "websocket",
        Origin: "https://www.okx.com",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
        Connection: "Upgrade",
        "Sec-Fetch-Dest": "websocket",
      },
    };

    this.ws = new WebSocket(this.url, this.options);
    this.price = 0;
    this.dataPrice = {
      time: dayjs().valueOf(),
      price: 0,
    };
    this.reConnectTime = dayjs();
  }

  getPriceBTC() {
    return new Promise((resolve, reject) => {
      const listDataPrices = [];
      let count = 0;
      const si = setInterval(() => {
        count++;
        if (
          listDataPrices.length === 0 ||
          listDataPrices.at(-1).time !== this.dataPrice.time
        ) {
          listDataPrices.push(this.dataPrice);
        }

        if (count > 98) {
          clearInterval(si);
          const prices = listDataPrices.map((data) => data.price);
          const length = prices.length;
          const differrence = prices[0] - prices.at(-1);
          const status = differrence <= 0 ? 1 : 0;
          const rateOfChange = 0;
          const result = {
            prices,
            status,
            length,
            differrence: Math.abs(differrence),
            rateOfChange,
          };
          resolve(result);
        }
      }, 50);
    });
  }

  initSocket() {
    this.ws = new WebSocket(this.url, this.options);
    this.reConnectTime = dayjs();
    this.ws.on("open", () => {
      const subscribeMessage = JSON.stringify({
        op: "subscribe",
        args: [{ channel: "tickers", instId: "BTC-USDT" }],
      });
      this.ws.send(subscribeMessage);
    });

    this.ws.on("message", (data) => {
      const message = JSON.parse(data);
      if (message.data) {
        const tickerData = message.data[0];
        const btcPrice = tickerData.last;
        // console.log(`${dayjs().valueOf()} - ${btcPrice}`);
        this.dataPrice = {
          time: dayjs().valueOf(),
          price: btcPrice,
        };
      }
    });
  }

  closeSocket() {
    const diffTime = dayjs().diff(this.reConnectTime);
    if (this.ws && diffTime > 120) {
      this.ws.close();
      this.dataPrice = {
        time: dayjs().valueOf(),
        price: 0,
      };

      console.log("WebSocket connection closed.");
    }
  }
}
const socketService = new SocketService();
export default socketService;
