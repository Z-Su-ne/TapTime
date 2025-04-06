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
        <t-calendar v-model:visible="showDate" :value="objectives.date" type="range" @confirm="confirmDate"></t-calendar>
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
        <t-input v-model="item.value_type" align="right" label="量化类型" :placeholder="kValueTypeValue[item.value_type]" :key="item.value_type" disabled>
          <template #suffix>
            <t-button theme="primary" size="extra-small" @click="kValueTypeChange(index)"> 切换类型 </t-button>
          </template>
        </t-input>
        <t-input v-model="item.value_current" align="right" label="当前状态" :placeholder="item.value_type == 'numeric' ? '选填，具体数字' : '选填，具体数字，但是不用百分号'" type="number" />
        <t-input v-model="item.value_target" align="right" label="目标状态" :placeholder="item.value_type == 'numeric' ? '选填，具体数字' : '选填，具体数字，但是不用百分号'" type="number" />
        <t-textarea v-model="item.description" label="描述" placeholder="没啥好说的，就打个unll，然后接着写代码吧" autosize indicator :maxlength="500" />
        <t-divider />
      </view>

      <t-fab :icon="getIcon('flag')" draggable="vertical" text="增加关键结果" @click="addKInfo" />
    </view>
  </view>
</template>

<script>
import { h, ref } from "vue";
import { Icon as TIcon } from "tdesign-icons-vue-next";

export default {
  setup() {
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

    // uuidv4
    function generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    // 目标info
    const objectives = ref({
      uuid: generateUUID(),
      title: null,
      priority: null,
      date: [],
      reason: null,
      description: null,
    });
    const priority = ref("");
    const showDate = ref(false);
    const dateNote = ref("");
    const confirmDate = (val) => {
      objectives.value.date = val;
      showDate.value = false;
      // 格式化每个日期并连接
      const formattedDates = val.map((dateStr) => formatDate(dateStr));
      dateNote.value = formattedDates.join(" - ");
      console.log("选择了", objectives.value.date);
    };
    const saveAll = () => {
      console.log(objectives.value, keyResults.value);
    };

    // 关键结果Info
    const keyResults = ref([
      {
        objective_id: objectives.value.uuid,
        uuid: generateUUID(),
        title: null,
        value_type: "numeric",
        value_current: null,
        value_original: null,
        value_target: null,
        description: null,
      },
    ]);
    const kValueTypeValue = ref({
      numeric: "数值量化",
      percentage: "百分比量化",
    });
    const kValueTypeChange = (index) => {
      const newValueType = keyResults.value[index].value_type === "numeric" ? "percentage" : "numeric";
      keyResults.value[index].value_type = newValueType;
      console.log(keyResults.value[index].value_type);
    };
    const delKInfo = (index) => {
      keyResults.value.splice(index, 1);
    };
    const addKInfo = () => {
      keyResults.value.push({
        objective_id: objectives.value.uuid,
        uuid: generateUUID(),
        title: null,
        value_type: "numeric",
        value_current: null,
        value_target: null,
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
      tabBar,
      tabBarSelect,
      changeTabBarSelect,

      objectives,
      priority,
      showDate,
      dateNote,
      confirmDate,
      saveAll,

      keyResults,
      kValueTypeValue,
      kValueTypeChange,
      delKInfo,
      addKInfo,

      getIcon,
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

.example-progress {
  .button-group {
    display: flex;
    justify-content: center;
    padding-bottom: 8px;
    .space {
      width: 16px;
    }
  }
}
</style>
