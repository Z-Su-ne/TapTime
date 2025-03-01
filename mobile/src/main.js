import { createSSRApp } from "vue";
import App from "./App.vue";

// 全量注册TDesign
import TDesign from "tdesign-mobile-vue";
import "tdesign-mobile-vue/es/style/index.css";

export function createApp() {
  const app = createSSRApp(App);
  app.use(TDesign);
  return {
    app,
  };
}
