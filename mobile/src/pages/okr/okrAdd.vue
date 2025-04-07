<template>
  <view class="view">
    <!-- 选项卡 -->
    <view class="tabBar">
      <t-tabs default-value="objectives" theme="card" size="large" @click="changeTabBarSelect">
        <t-tab-panel v-for="item in tabBar" :key="item.value" :value="item.value" :label="item.label" :icon="item.icon" />
      </t-tabs>
    </view>

    <!-- 目标info -->
    <view class="oInfo" v-if="tabBarSelect === 'objectives'">
      <t-input v-model="objectives.title" align="right" label="目标标题" placeholder="比如：我要完成毕设😶‍🌫️" status="default" />
      <t-input v-model="objectives.priority" align="right" label="目标优先级" placeholder="选填(1~5,数字越大优先级越高)" type="number" />
      <view>
        <t-calendar v-model:visible="showDate" :value="dateValue" type="range" @confirm="confirmDate"></t-calendar>
        <t-cell title="计划周期" arrow :note="dateNote" @click="showDate = true"></t-cell>
      </view>
      <t-divider content="更多描述内容" />
      <t-textarea v-model="objectives.reason" label="目标缘由" placeholder="我要毕业🤯" autosize indicator :maxlength="500" />
      <t-textarea v-model="objectives.description" label="目标描述" placeholder="没啥好说的，就打个unll，然后接着写代码吧" autosize indicator :maxlength="500" />
      <t-fab :icon="getIcon('task-add-1')" draggable="vertical" text="保存目标" @click="saveAll" />
    </view>

    <!-- 关键结果info -->
    <view class="kInfo" v-else>
      <view v-for="(item, index) in keyResults" :key="index">
        <t-tag class="kTag" theme="primary" closable variant="light" @close="delKInfo(index)">关键结果 {{ index + 1 }} </t-tag>
        <t-input v-model="item.title" align="right" label="关键结果" placeholder="比如：阅读10篇文献😶‍🌫️" status="default" />
        <t-input v-model="item.targetFocus" align="right" label="每日专注" placeholder="比如：10" suffix="分钟" type="number" />
        <!-- <t-input v-model="item.valueType" align="right" label="量化类型" :placeholder="kValueTypeValue[item.valueType]" :key="item.valueType" disabled>
          <template #suffix>
            <t-button theme="primary" size="extra-small" @click="kValueTypeChange(index)"> 切换类型 </t-button>
          </template>
        </t-input>
        <t-input v-model="item.valueCurrent" align="right" label="当前状态" :placeholder="item.valueType == 'numeric' ? '选填，具体数字' : '选填，具体数字，但是不用百分号'" type="number" />
        <t-input v-model="item.valueTarget" align="right" label="目标状态" :placeholder="item.valueType == 'numeric' ? '选填，具体数字' : '选填，具体数字，但是不用百分号'" type="number" /> -->
        <t-textarea v-model="item.description" label="描述" placeholder="没啥好说的，就打个unll，然后接着写代码吧" autosize indicator :maxlength="500" />
        <t-divider />
      </view>

      <t-fab :icon="getIcon('flag')" draggable="vertical" text="增加关键结果" @click="addKInfo" />
    </view>
  </view>
</template>

<script>
import { h, ref } from "vue";
import { Toast } from "tdesign-mobile-vue";
import { Icon as TIcon } from "tdesign-icons-vue-next";
import Utils from "../../common/utils";
import { useOkrStore } from "../../stores/useOkrStore";
import { useUserStore } from "../../stores/useUserStore";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const utils = new Utils();
    const okr = useOkrStore();
    const user = useUserStore();

    // 选项卡
    let tabBarSelect = ref("objectives");
    const tabBar = ref([
      { value: "objectives", label: " 目标", icon: () => h(TIcon, { name: "task-checked-1" }) },
      { value: "keyResults", label: " 关键结果", icon: () => h(TIcon, { name: "flag" }) },
    ]);
    const changeTabBarSelect = (select) => {
      tabBarSelect.value = select;
      console.log("选择了", tabBarSelect.value);
    };

    // 目标info
    const objectives = ref({
      uuid: utils.generateUUID(),
      userId: null,
      title: null,
      description: null,
      reason: null,
      priority: null,
      status: "pending",
      startDate: null,
      endDate: null,
    });
    const priority = ref("");
    const showDate = ref(false);
    const dateNote = ref("");
    const dateValue = ref([]);
    const confirmDate = (val) => {
      dateValue.value = val;
      console.log("选择了", val);
      objectives.value.startDate = val[0];
      objectives.value.endDate = val[1];
      showDate.value = false;
      // 格式化每个日期并连接
      const formattedDates = val.map((dateStr) => formatDate(dateStr));
      dateNote.value = formattedDates.join(" - ");
    };

    const saveAll = async () => {
      try {
        objectives.value.userId = user.uuid;
        const postData = ref({
          event: "okrAdd",
          objectives: objectives.value,
          keyResults: keyResults.value,
        });
        const logId = utils.generateUUID();
        const addRes = await okr.okrPost(logId, postData.value);
        if (addRes.success) {
          Toast({
            message: "新增成功",
            theme: "success",
          });
          router.back();
        } else {
          Toast({ message: addRes.return, theme: "error" });
        }
      } catch (error) {
        console.log(error);
        Toast({ message: "未知错误:" + error, theme: "error" });
      }
    };

    // 关键结果Info
    const keyResults = ref([
      {
        uuid: utils.generateUUID(),
        objectiveId: objectives.value.uuid,
        title: null,
        targetFocus: null,
        valueType: "numeric",
        valueCurrent: null,
        valueOriginal: null,
        valueTarget: null,
        description: null,
      },
    ]);
    const kValueTypeValue = ref({
      numeric: "数值量化",
      percentage: "百分比量化",
    });
    const kValueTypeChange = (index) => {
      const newValueType = keyResults.value[index].valueType === "numeric" ? "percentage" : "numeric";
      keyResults.value[index].valueType = newValueType;
      console.log(keyResults.value[index].valueType);
    };
    const delKInfo = (index) => {
      keyResults.value.splice(index, 1);
    };
    const addKInfo = () => {
      keyResults.value.push({
        uuid: utils.generateUUID(),
        objectiveId: objectives.value.uuid,
        title: null,
        targetFocus: null,
        valueType: "numeric",
        valueCurrent: null,
        valueOriginal: null,
        valueTarget: null,
        description: null,
      });
    };

    // 格式化日期函数（需接收单个日期字符串）
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    }

    // 图标注册
    const getIcon = (icon) => () => h(TIcon, { name: icon });

    return {
      router,
      user,
      okr,
      utils,
      getIcon,

      tabBar,
      tabBarSelect,
      changeTabBarSelect,

      objectives,
      priority,
      showDate,
      dateValue,
      dateNote,
      confirmDate,
      saveAll,

      keyResults,
      kValueTypeValue,
      kValueTypeChange,
      delKInfo,
      addKInfo,
    };
  },
};
</script>

<style>
.oInfo,
.kInfo {
  background: white;
}

.kTag {
  margin-top: 4px;
  margin-left: 8px;
}
</style>
