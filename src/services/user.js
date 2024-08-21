export class UserService {
  constructor(dataUser) {
    this.dataUser = dataUser;
    this.dataServer = {
      numChancesTotal: 10,
      numChances: 10,
    };
  }

  getUserData() {
    return this.dataUser;
  }

  updateDataServer(key, value) {
    this.dataServer[key] = value;
  }
}
