<template>
  <!-- 展示层 -->
  <view class="view">
    <!-- 主页按钮 -->
    <view class="bottom"></view>
    <!-- okr show -->
    <view class="my-okr">
      <t-cell-group theme="card">
        <t-cell :left-icon="filter3" title="专注目标" arrow @click="handleClick('AppIcon')" />
        <t-cell :left-icon="PenQuillIcon" title="所有目标" arrow />
        <t-cell :left-icon="internet" title="" arrow />
      </t-cell-group>
    </view>
    <!-- tab-bar -->
    <t-tab-bar v-model="value" shape="round" theme="tag" :split="false">
      <t-tab-bar-item v-for="item in list" :key="item.value" :value="item.value">
        <template #icon>
          <t-icon :name="item.icon" />
        </template>
      </t-tab-bar-item>
    </t-tab-bar>
  </view>
</template>

<script>
import { h } from "vue";
import { ref } from "vue";
// import { Filter3Icon, PenQuillIcon, InternetIcon } from "tdesign-icons-vue-next";
import { Icon as TIcon } from "tdesign-icons-vue-next";

export default {
  data() {
    return {
      Filter3Icon: () => h(Filter3Icon),
      PenQuillIcon: () => h(PenQuillIcon),
      internet: () => h(InternetIcon),
      // const value = ref('label_1');
      list: [
        { value: "label_1", label: "首页", icon: "filter-3" },
        { value: "label_2", label: "应用", icon: "app" },
        { value: "label_3", label: "聊天", icon: "chat" },
        { value: "label_4", label: "我的", icon: "user" },
      ],
    };
  },
  methods: {
    handleClick(type) {
      console.log(`点击了${type}项`);
      // 这里可添加页面跳转逻辑 <button class="citation-flag" data-index="9">
      uni.navigateTo({
        url: `/pages/${type}/index`,
      });
    },
  },
};
</script>

<style></style>
