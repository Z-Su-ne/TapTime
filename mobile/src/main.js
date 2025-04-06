import { createSSRApp } from "vue";
import App from "./App.vue";

// 全量注册TDesign
import TDesign from "tdesign-mobile-vue";
import "tdesign-mobile-vue/es/style/index.css";

// 引入Pinia并创建实例
import { createPinia } from "pinia";

export function createApp() {
  const app = createSSRApp(App);

  // 注册 Pinia
  const pinia = createPinia();
  app.use(pinia);

  // 注册 TDesign
  app.use(TDesign);

  return {
    app,
  };
}
