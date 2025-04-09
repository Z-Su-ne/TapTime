<template>
  <view class="view">
    <!-- 今日看板 -->
    <view class="box">
      <view class="container">
        <view class="title">工具探索</view>
      </view>

      <t-cell-group theme="card">
        <t-cell :left-icon="getIcon('tomato')" title="小番茄钟" @click="toTomato" arrow />
      </t-cell-group>
    </view>

    <!-- 目标库 -->
    <view class="box">
      <view class="container">
        <view class="title">数据可视化</view>
      </view>

      <t-cell-group theme="card">
        <t-cell :left-icon="getIcon('filter-3')" title="专注目标" arrow />
        <t-cell :left-icon="getIcon('task-checked-1')" title="所有目标" arrow />
      </t-cell-group>
    </view>

    <!-- 底部导航栏 -->
    <view class="box">
      <t-tab-bar v-model="tabBarSelect" :split="false">
        <t-tab-bar-item v-for="item in tabBar" :key="item.value" :value="item.value" @click="toTabBar">
          {{ item.text }}
          <template #icon>
            <t-icon :name="item.icon" />
          </template>
        </t-tab-bar-item>
      </t-tab-bar>
    </view>
  </view>
</template>

<script>
import { h, ref, reactive, computed, watch, onMounted, onActivated } from "vue";
import { Toast } from "tdesign-mobile-vue";
import { Icon as TIcon } from "tdesign-icons-vue-next";
import Utils from "../../common/utils";
import { useOkrStore } from "../../stores/useOkrStore";
import { useUserStore } from "../../stores/useUserStore";
import { useFocusStore } from "../../stores/useFocusStore";
import { useIndexStore } from "../../stores/useIndexStore";

export default {
  setup() {
    const utils = new Utils();
    const okr = useOkrStore();
    const user = useUserStore();
    const focus = useFocusStore();
    const index = useIndexStore();

    // 首次挂载时执行
    onMounted(() => {});

    // 被 <keep-alive> 缓存，使用 onActivated 钩子在每次激活时执行
    onActivated(() => {});

    // 番茄钟跳转
    const toTomato = () => {
      console.log("跳转 番茄钟");
      uni.navigateTo({ url: "/pages/tool/tomatoOne" });
    };

    // 底部导航栏
    const tabBarSelect = ref("tabBar2");
    const tabBar = ref([
      { value: "tabBar1", text: "主页", icon: "home" },
      { value: "tabBar2", text: "探索", icon: "system-sum" },
      { value: "tabBar3", text: "个人", icon: "user" },
    ]);
    // 导航栏跳转
    const toTabBar = () => {
      if (tabBarSelect.value == "tabBar1") {
        console.log("跳转 tabBar1（主页）");
        uni.navigateTo({ url: "/pages/index/index" });
      }
      if (tabBarSelect.value == "tabBar2") {
        console.log("跳转 tabBar2（探索）");
        uni.navigateTo({ url: "/pages/tool/tool" });
      }
      if (tabBarSelect.value == "tabBar3") {
        console.log("跳转 tabBar3（个人）");
        uni.navigateTo({ url: "/pages/mine/mine" });
      }
    };

    // 图标注册
    const getIcon = (icon) => () => h(TIcon, { name: icon });

    return {
      utils,
      okr,
      user,
      focus,
      index,

      toTomato,
      getIcon,

      tabBar,
      tabBarSelect,
      toTabBar,
    };
  },
};
</script>

<style>
.box {
  padding: 8px 0;
  display: block;
}
.dashboard {
  margin: 0 16px;
  background-color: white;
  border-radius: 12px;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
}
.title {
  font-size: large;
  font-weight: bold;
}
.icon {
  margin-right: 24px;
  size: 24px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.icon:active {
  opacity: 0.7;
}
.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
