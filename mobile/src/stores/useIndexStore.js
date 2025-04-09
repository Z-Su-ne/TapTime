import { defineStore } from "pinia";
import axios from "axios";
export const useIndexStore = defineStore("index", {
  state: () => ({}),

  actions: {
    // post
    async indexPost(logId, data) {
      try {
        const apiURL = "http://localhost:3000/mobile/api";
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
