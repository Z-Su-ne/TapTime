<template>
  <view class="view">
    <!-- 今日看板 -->
    <view class="box">
      <view class="title">今日专注</view>
      <t-cell-group theme="card">
        <t-cell :left-icon="noticeBoard.icon" :title="'今日专注：' + noticeBoard.title + '分钟'" :note="noticeBoard.note + '次'" />
      </t-cell-group>
    </view>
    <!-- 目标库 -->
    <view class="box">
      <view class="title">目标库</view>
      <t-cell-group theme="card">
        <t-cell v-for="item in orkShowList" :key="item.value" :left-icon="item.icon" :title="item.title" :note="item.note" arrow />
      </t-cell-group>
    </view>
    <!-- 今日专注日志 -->
    <view class="box">
      <view class="title">专注日志</view>
      <t-cell-group theme="card">
        <t-cell v-for="item in orkShowList" :key="item.value" :left-icon="item.icon" :title="item.title" arrow />
      </t-cell-group>
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
  data() {
    return {
      // 今日看板
      noticeBoard: { title: "xx", note: "xx", icon: () => h(TIcon, { name: "time" }) },
      // 目标库
      orkShowList: [
        { value: "show1", title: "专注目标", icon: () => h(TIcon, { name: "filter-3" }), note: 1 },
        { value: "show2", title: "所有目标", icon: () => h(TIcon, { name: "focus" }), note: 2 },
      ],
      // 导航栏
      tabBar: [
        { value: "tabBar1", text: "主页", icon: "home" },
        { value: "tabBar2", text: "探索", icon: "system-sum" },
        { value: "tabBar3", text: "个人", icon: "user" },
      ],
      tabBarSelect: "tabBar1",
    };
  },
  methods: {},
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
.title {
  font-size: large;
  font-weight: bold;
  margin: 8px 16px;
}
</style>
