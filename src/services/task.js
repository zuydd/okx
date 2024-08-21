import colors from "colors";
import delayHelper from "../helpers/delay.js";

class TaskService {
  constructor() {}

  async getAllTask(user) {
    const dataUser = user.dataUser;
    const params = {
      extUserId: dataUser.user.id,
    };
    try {
      const response = await dataUser.http.get("tasks", params);
      const dataResponse = response.data;
      const data = dataResponse.data;
      if (dataResponse.code === 0) {
        const skipTasks = [5, 9];
        const tasks = data.filter(
          (task) => task.state === 0 && !skipTasks.includes(task.id)
        );
        dataUser.log.log(
          `Số nhiệm vụ chưa hoàn thành: ${colors.green(tasks.length)}`
        );
        for (const task of tasks) {
          await this.handleTask(user, task);
        }
      } else {
        throw new Error(
          `Lấy danh sách nhiệm vụ thất bại: ${dataResponse.error_message}`
        );
      }
    } catch (error) {
      dataUser.log.logError(error.message);
    }
  }

  async handleTask(user, task) {
    const dataUser = user.dataUser;
    const body = { extUserId: dataUser.user.id, id: task.id };
    try {
      const response = await dataUser.http.post("task", body);
      const dataResponse = response.data;
      // const data = dataResponse.data;
      if (dataResponse.code === 0) {
        dataUser.log.log(
          `Hoàn thành nhiệm vụ ${task.id}: ${colors.blue(
            task?.context?.name
          )}, phần thưởng: ${colors.green(task?.points)} 🏁`
        );
        delayHelper.delay(10);
      } else {
        throw new Error(
          `Không thể hoàn thành nhiệm vụ: ${dataResponse.error_message}`
        );
      }
    } catch (error) {
      dataUser.log.logError(error.message);
    }
  }
}

const taskService = new TaskService();
export default taskService;
