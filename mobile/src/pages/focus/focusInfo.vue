<template>
  <view class="view">
    <view>
      <t-cell-group theme="card">
        <!-- 关联目标 -->
        <t-cell :left-icon="getIcon('filter-3')" title="专注目标" :note="objectives.title" @click="toOkrInfo" arrow />
        <!-- 关键结果 -->
        <t-cell :left-icon="getIcon('flag')" title="关键结果" :note="krState.title.join(' ')" @click="krState.show = true" arrow />
        <t-popup v-if="krState.show" v-model="krState.show" placement="bottom">
          <t-picker v-model="krState.uuid" :columns="krOptions" @confirm="confirmKr" @cancel="krState.show = false" />
        </t-popup>
      </t-cell-group>

      <view style="margin: 16px" />

      <t-cell-group theme="card">
        <!-- 专注开始时间 -->
        <t-cell title="专注开始" :note="postFocus.timeStart || '选择专注开始时间'" @click="showTimeStart = true" />
        <t-popup v-model="showTimeStart" placement="bottom">
          <t-date-time-picker default-value="12:30" :mode="[null, 'minute']" title="选择专注开始" format="HH:mm" @confirm="confirmTimeStart" @cancel="cancelTime('start')" />
        </t-popup>
        <!-- 专注结束时间 -->
        <t-cell title="专注结束" :note="postFocus.timeEnd || '选择专注结束时间'" @click="showTimeEnd = true" />
        <t-popup v-model="showTimeEnd" placement="bottom">
          <t-date-time-picker default-value="12:30" :mode="[null, 'minute']" title="选择专注结束" format="HH:mm" @confirm="confirmTimeEnd" @cancel="cancelTime('start')" />
        </t-popup>
        <!-- 专注时间 -->
        <t-cell title="专注时长" :note="(postFocus.times || '0') + ' 分钟'" />
      </t-cell-group>
    </view>

    <view style="margin: 16px">
      <t-divider />
    </view>

    <div style="margin: 16px">
      <t-button size="large" theme="primary" block @click="focusAdd">添加专注</t-button>
    </div>
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

export default {
  setup() {
    const utils = new Utils();
    const okr = useOkrStore();
    const user = useUserStore();
    const focus = useFocusStore();

    const objectives = ref("");
    const keyResults = ref([]);
    const postFocus = ref({});

    // 获取专注目标信息
    const getOkrInfo = async () => {
      try {
        if (utils.isEmpty(user.okrFocus)) {
          Toast({ message: "请先在所有目标选定专注目标", theme: "error" });
          uni.navigateTo({ url: "/pages/index/index" });
        } else {
          const postOkrData = ref({
            event: "okrInfo",
            objectivesId: user.okrFocus,
          });
          const logId = utils.generateUUID();
          const infoRes = await okr.okrPost(logId, postOkrData.value);
          if (infoRes.success) {
            objectives.value = infoRes.return.objectives;
            keyResults.value = infoRes.return.keyResults;
          } else {
            Toast({ message: infoRes.return, theme: "error" });
          }
        }
      } catch (error) {
        console.log(error);
        Toast({ message: "未知错误:" + error, theme: "error" });
      }
    };

    // 跳转okrInfo
    const toOkrInfo = async () => {
      try {
        uni.navigateTo({ url: "/pages/okr/okrInfo?uuid=" + objectives.value.uuid });
      } catch (error) {
        console.log(error);
        Toast({ message: "未知错误:" + error, theme: "error" });
      }
    };

    // 关键结果
    const krState = reactive({
      show: false,
      uuid: [],
      title: [],
    });
    const krOptions = () => {
      return keyResults.value.map((item) => ({
        label: item.title,
        value: item.uuid,
      }));
    };
    const confirmKr = (val, context) => {
      krState.uuid = val;
      krState.title = context.label;
      krState.show = false;
      console.log("当前选中值:", krState);
    };
    watch(
      () => keyResults.value,
      (newVal) => {
        if (newVal.length > 0) {
          krState.uuid = [newVal[0].uuid];
          krState.title = [newVal[0].title];
        }
      },
      { immediate: true }
    );

    // 点选时间
    const showTimeStart = ref(false);
    const showTimeEnd = ref(false);
    const cancelTime = (type) => {
      console.log("cancel:", type);
      if (type == "start") showTimeStart.value = false;
      if (type == "end") showTimeEnd.value = false;
    };
    const confirmTimeStart = (value) => {
      console.log("confirmTimeStart: ", value);
      postFocus.value.timeStart = value;
      showTimeStart.value = false;
    };
    const confirmTimeEnd = (value) => {
      console.log("confirmTimeEnd: ", value);
      postFocus.value.timeEnd = value;
      showTimeEnd.value = false;
    };
    watch(
      () => [postFocus.value.timeStart, postFocus.value.timeEnd],
      () => {
        try {
          postFocus.value.times = timeDiff.value;
          console.log("时间差更新为:", postFocus.value.times, "分钟");
        } catch (error) {
          console.log("时间差计算错误", error);
        }
      }
    );

    // 新增专注
    const focusAdd = async () => {
      try {
        if (utils.isEmpty(postFocus.value.timeStart) || utils.isEmpty(postFocus.value.timeEnd)) {
          Toast({ message: "请选择专注时间", theme: "error" });
        } else {
          postFocus.value.event = "focusAdd";
          postFocus.value.objectiveId = objectives.value.uuid;
          postFocus.value.keyResultsId = krState.uuid[0];
          postFocus.value.isDel = 0;

          const logId = utils.generateUUID();
          const infoRes = await focus.focusPost(logId, postFocus.value);
          if (infoRes.success) {
            Toast({ message: "专注成功", theme: "success" });
          } else {
            Toast({ message: infoRes.return, theme: "error" });
          }
        }
      } catch (error) {
        console.log(error);
        Toast({ message: "未知错误:" + error, theme: "error" });
      }
    };

    // 图标注册
    const getIcon = (icon) => () => h(TIcon, { name: icon });

    // 计算时间差（分钟）
    const timeDiff = computed(() => {
      const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const start = parseTime(postFocus.value.timeStart);
      const end = parseTime(postFocus.value.timeEnd);

      return Math.abs(end - start);
    });

    // 首次挂载时执行
    onMounted(() => {
      getOkrInfo();
    });

    // 被 <keep-alive> 缓存，使用 onActivated 钩子在每次激活时执行
    onActivated(() => {
      getOkrInfo();
    });

    return {
      utils,
      okr,
      user,
      focus,
      getIcon,
      timeDiff,

      objectives,
      keyResults,
      postFocus,

      toOkrInfo,

      krOptions,
      krState,
      confirmKr,

      showTimeStart,
      showTimeEnd,
      confirmTimeStart,
      confirmTimeEnd,
      cancelTime,

      focusAdd,
    };
  },
};
</script>

<style></style>
