import { defineStore } from "pinia";
import axios from "axios";
export const useOkrStore = defineStore("okr", {
  state: () => ({
    uuid: undefined,
    okrname: undefined,
    tel: undefined,
    email: undefined,
    password: undefined,
  }),

  actions: {
    // post
    async okrPost(logId, data) {
      try {
        const apiURL = "http://localhost:3000/mobile/okr";
        const postData = { logId: logId, data: data };
        const response = await axios.post(apiURL, postData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("post成功:", response.data);
        return response.data;
      } catch (error) {
        console.error("post失败:", error);
        throw error;
      }
    },
  },
});
