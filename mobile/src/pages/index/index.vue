<template>
  <view class="view">
    <!-- 今日看板 -->
    <view class="box">
      <view class="container">
        <view class="title">今日专注</view>
      </view>

      <t-cell-group theme="card">
        <t-cell :left-icon="noticeBoard.icon" :title="'今日专注：' + noticeBoard.title + '分钟'" :note="noticeBoard.note + '次'" />
      </t-cell-group>
    </view>
    <!-- 目标库 -->
    <view class="box">
      <view class="container">
        <view class="title">目标库</view>
        <t-icon class="icon" name="task-add-1" />
      </view>

      <t-cell-group theme="card">
        <t-cell v-for="item in orkShowList" :key="item.value" :left-icon="item.icon" :title="item.title" :note="item.note" arrow />
      </t-cell-group>
    </view>
    <!-- 专注日志 -->
    <view class="box">
      <view class="container">
        <view class="title">专注日志</view>
        <t-icon class="icon" name="task-add" />
      </view>

      <t-collapse theme="card" v-model="activeValues" @change="handlePanelChange">
        <t-collapse-panel v-for="i in 4" :key="i" :value="i" :header="`面板${i}`" :disabled="i === 4">
          <view class="content">动态内容区域</view>
        </t-collapse-panel>
      </t-collapse>
    </view>
    <!-- 底部导航栏 -->
    <view class="box">
      <t-tab-bar v-model="tabBarSelect" :split="false">
        <t-tab-bar-item v-for="item in tabBar" :key="item.value" :value="item.value">
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
import { h, ref } from "vue";
import { Icon as TIcon } from "tdesign-icons-vue-next";

export default {
  setup() {
    // 今日看板
    const noticeBoard = ref({ title: "25", note: "12", icon: () => h(TIcon, { name: "time" }) });
    // 目标库
    const orkShowList = ref([
      { value: "show1", title: "专注目标", icon: () => h(TIcon, { name: "filter-3" }), note: 1 },
      { value: "show2", title: "所有目标", icon: () => h(TIcon, { name: "task-checked-1" }), note: 2 },
    ]);

    // 专注日志
    const activeValues = ref([1]);
    const handlePanelChange = (val) => {
      activeValues.value = val;
    };

    // 底部导航栏
    const tabBarSelect = ref("tabBar1");
    const tabBar = ref([
      { value: "tabBar1", text: "主页", icon: "home" },
      { value: "tabBar2", text: "探索", icon: "system-sum" },
      { value: "tabBar3", text: "个人", icon: "user" },
    ]);

    // 图标渲染方法
    const renderIcon = (name) => {
      return () => h(TIcon, { name });
    };

    return {
      noticeBoard,
      orkShowList,
      activeValues,
      tabBarSelect,
      tabBar,
      renderIcon,
      handlePanelChange,
    };
  },
};
</script>

<style>
.box {
  padding: 8px 0;
  display: block;
}
.noticeBoard {
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
}
/* 内容区域 */
.content {
  padding: 16px;
  line-height: 1.6;
}
</style>
