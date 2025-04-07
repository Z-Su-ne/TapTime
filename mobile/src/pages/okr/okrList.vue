<template>
  <view class="view">
    <!-- 未开始 pending -->
    <view class="box" v-if="pendingList.list.length > 0">
      <view class="container">
        <view class="title">未开始的目标</view>
      </view>

      <t-cell-group theme="card">
        <t-cell :left-icon="pendingList.icon" v-for="item in pendingList.list" :key="item.value" :title="item.title" :note="item.value == user.okrFocus ? '专注目标' : ''" @click="toOkrInfo(item.value)" arrow />
      </t-cell-group>
    </view>

    <!-- 进行中 in_progress -->
    <view class="box" v-if="inProgressList.list.length > 0">
      <view class="container">
        <view class="title">进行中的目标</view>
      </view>

      <t-cell-group theme="card">
        <t-cell :left-icon="inProgressList.icon" v-for="item in inProgressList.list" :key="item.value" :title="item.title" :note="item.value == user.okrFocus ? '专注目标' : ''" @click="toOkrInfo(item.value)" arrow />
      </t-cell-group>
    </view>

    <!-- 已完成 completed -->
    <view class="box" v-if="completedList.list.length > 0">
      <view class="container">
        <view class="title">已完成的目标</view>
      </view>

      <t-cell-group theme="card">
        <t-cell :left-icon="completedList.icon" v-for="item in completedList.list" :key="item.value" :title="item.title" :note="item.value == user.okrFocus ? '专注目标' : ''" @click="toOkrInfo(item.value)" arrow />
      </t-cell-group>
    </view>
  </view>
</template>

<script>
import { h, ref, onMounted, onActivated } from "vue";
import { Toast } from "tdesign-mobile-vue";
import { Icon as TIcon } from "tdesign-icons-vue-next";
import Utils from "../../common/utils";
import { useOkrStore } from "../../stores/useOkrStore";
import { useUserStore } from "../../stores/useUserStore";

export default {
  setup() {
    const utils = new Utils();
    const okr = useOkrStore();
    const user = useUserStore();

    // 目标库
    const pendingList = ref({
      icon: () => h(TIcon, { name: "task-visible" }),
      list: [],
    });

    const inProgressList = ref({
      icon: () => h(TIcon, { name: "task-location" }),
      list: [],
    });

    const completedList = ref({
      icon: () => h(TIcon, { name: "task-checked" }),
      list: [],
    });

    const getOkrList = async () => {
      try {
        const postData = ref({
          event: "okrList",
          userId: user.uuid,
        });
        const logId = utils.generateUUID();
        const listRes = await okr.okrPost(logId, postData.value);
        if (listRes.success) {
          console.log(listRes.return);
          pendingList.value.list = listRes.return.pendingList;
          inProgressList.value.list = listRes.return.inProgressList;
          completedList.value.list = listRes.return.completedList;
        } else {
          Toast({ message: listRes.return, theme: "error" });
        }
      } catch (error) {
        console.log(error);
        Toast({ message: "未知错误:" + error, theme: "error" });
      }
    };

    const toOkrInfo = async (uuid) => {
      uni.navigateTo({ url: "/pages/okr/okrInfo?uuid=" + uuid });
    };

    // 图标渲染方法
    const renderIcon = (name) => {
      return () => h(TIcon, { name });
    };

    // 首次挂载时执行
    onMounted(() => {
      getOkrList();
    });

    // 被 <keep-alive> 缓存，使用 onActivated 钩子在每次激活时执行
    onActivated(() => {
      getOkrList();
    });

    return {
      utils,
      okr,
      user,

      pendingList,
      inProgressList,
      completedList,

      getOkrList,
      toOkrInfo,

      renderIcon,
    };
  },
};
</script>

<style>
.box {
  padding: 8px 0;
  display: block;
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
</style>
