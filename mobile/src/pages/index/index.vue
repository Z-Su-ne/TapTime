<template>
  <view class="view">
    <!-- 今日看板 -->
    <view class="box">
      <view class="container">
        <view class="title">今日专注</view>
      </view>

      <t-cell-group theme="card">
        <t-cell :left-icon="getIcon('time')" :title="'今日专注：' + dashboard.sum + '分钟'" :note="dashboard.count + '次'" />
      </t-cell-group>
    </view>

    <!-- 目标库 -->
    <view class="box">
      <view class="container">
        <view class="title">目标库</view>
        <t-icon class="icon" name="task-add-1" @click="toOkrAdd" />
      </view>

      <t-cell-group theme="card">
        <t-cell :left-icon="getIcon('filter-3')" title="专注目标" :note="kr.okrFocusName" @click="toOkrInfo" arrow />
        <t-cell :left-icon="getIcon('task-checked-1')" title="所有目标" :note="kr.countOkrInProgress" @click="toOkrList" arrow />
      </t-cell-group>
    </view>

    <!-- 专注日志 -->
    <view class="box">
      <view class="container">
        <view class="title">专注日志</view>
        <t-icon class="icon" name="task-add" @click="toFocusAdd" />
      </view>

      <t-cell-group theme="card" style="margin: 0 0 8px 0">
        <t-cell :left-icon="getIcon('browse-gallery')" title="专注日期" :note="focusDate || '点击选择'" @click="showFocusDate = true" />
      </t-cell-group>
      <t-popup v-model="showFocusDate" placement="bottom">
        <t-date-time-picker :value="focusDate" :mode="['date']" title="选择专注日期" start="2000-1-1" format="YYYY-MM-DD" @confirm="confirmFocusDate" @cancel="cancelFocusDate" />
      </t-popup>

      <t-collapse theme="card" v-model="activeValues" @change="activeChange">
        <t-collapse-panel v-for="(item, index) in focusList" :key="item.uuid" :value="index" :header="'No:' + (index + 1) + '&emsp;' + formattedHeader(item)" @click="() => selectFocusInfo(item)">
          <view class="content">
            <t-button size="small" theme="light" block style="width: 400%">
              {{ focusInfoMap[item.uuid] || "看看自己做了什么" }}
            </t-button>
            <view style="width: 32px"></view>
            <t-button size="small" theme="danger" variant="outline" block @click="delFocus(item.uuid)">
              {{ "点击删除" }}
            </t-button>
          </view>
        </t-collapse-panel>
      </t-collapse>
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

    // 今日看板
    const dashboard = ref({});

    // 目标库
    const toOkrAdd = () => {
      uni.navigateTo({ url: "/pages/okr/okrAdd" });
    };
    const toOkrList = () => {
      uni.navigateTo({ url: "/pages/okr/okrList" });
    };
    const toOkrInfo = () => {
      if (utils.isEmpty(user.okrFocus)) {
        uni.navigateTo({ url: "/pages/okr/okrList" });
      } else {
        uni.navigateTo({ url: "/pages/okr/okrInfo?uuid=" + user.okrFocus });
      }
    };
    const kr = ref({});

    // 专注日志
    const toFocusAdd = () => {
      uni.navigateTo({ url: "/pages/focus/focusAdd" });
    };

    const showFocusDate = ref(false);
    const focusDate = ref(
      (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })()
    );
    const cancelFocusDate = () => {
      console.log("cancelFocusDate");
      showFocusDate.value = false;
    };
    const confirmFocusDate = (value) => {
      console.log("confirmFocusDate: ", value);
      focusDate.value = value;
      showFocusDate.value = false;
      getIndexInfo();
    };

    const focusList = ref([]);
    const formattedHeader = computed(() => (item) => {
      return `${item.timeStart}-${item.timeEnd} 共${item.times}分钟`;
    });
    const activeValues = ref([]);
    const activeChange = (val) => {
      activeValues.value = val;
    };
    const focusInfoMap = ref({});
    const selectFocusInfo = async (item) => {
      try {
        const postData = {
          event: "selectFocus",
          objectiveId: focusList.value[activeValues.value]?.objectiveId,
          keyResultsId: focusList.value[activeValues.value]?.keyResultsId,
        };

        const logId = utils.generateUUID();
        const indexRes = await index.indexPost(logId, postData);

        if (indexRes.success) {
          const msg = `${indexRes.return.o[0].title}-${indexRes.return.kr[0].title}`;
          focusInfoMap.value[item.uuid] = msg;
        } else {
          Toast({ message: indexRes.return, theme: "error" });
        }
      } catch (error) {
        Toast({ message: "请求失败", theme: "error" });
      }
    };
    const delFocus = async (item) => {
      try {
        const postData = {
          event: "delFocus",
          uuid: item,
        };

        const logId = utils.generateUUID();
        const delRes = await focus.focusPost(logId, postData);

        if (delRes.success) {
          Toast({ message: "删除成功", theme: "success" });
        } else {
          Toast({ message: delRes.return, theme: "error" });
        }
      } catch (error) {
        Toast({ message: "请求失败", theme: "error" });
      }
      getIndexInfo();
    };

    // 信息获取
    const getIndexInfo = async () => {
      try {
        if (utils.isEmpty(user.uuid)) {
          Toast({ message: "请先登录", theme: "error" });
        } else {
          const postData = ref({
            event: "index",
            uuid: user.uuid,
            okrFocus: user.okrFocus,
            selectDate: focusDate.value,
          });
          const logId = utils.generateUUID();
          const indexRes = await index.indexPost(logId, postData.value);
          if (indexRes.success) {
            dashboard.value = indexRes.return.dashboard;
            kr.value = indexRes.return.kr;
            focusList.value = indexRes.return.focusList;
            console.log(indexRes.return);
          } else {
            Toast({ message: indexRes.return, theme: "error" });
          }
        }
      } catch (error) {
        oast({ message: "未知错误:" + error, theme: "error" });
      }
    };

    // 首次挂载时执行
    onMounted(() => {
      getIndexInfo();
    });

    // 被 <keep-alive> 缓存，使用 onActivated 钩子在每次激活时执行
    onActivated(() => {
      getIndexInfo();
    });

    // 底部导航栏
    const tabBarSelect = ref("tabBar1");
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
      getIcon,
      getIndexInfo,

      dashboard,

      kr,
      toOkrAdd,
      toOkrList,
      toOkrInfo,

      toFocusAdd,
      showFocusDate,
      focusDate,
      cancelFocusDate,
      confirmFocusDate,

      focusList,
      formattedHeader,
      focusInfoMap,
      selectFocusInfo,
      activeValues,
      activeChange,
      delFocus,

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
