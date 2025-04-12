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

      <!-- 月记录日历热力图 -->
      <view class="echartsView">
        <view id="heatmap" class="echarts"></view>
      </view>

      <!-- 今日饼图 -->
      <view class="echartsView">
        <view id="pie" class="echarts"></view>
      </view>
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
import { h, ref, reactive, computed, watch, onMounted, onActivated, nextTick } from "vue";
import { Toast } from "tdesign-mobile-vue";
import { Icon as TIcon } from "tdesign-icons-vue-next";
import Utils from "../../common/utils";
import { useOkrStore } from "../../stores/useOkrStore";
import { useUserStore } from "../../stores/useUserStore";
import { useFocusStore } from "../../stores/useFocusStore";
import { useIndexStore } from "../../stores/useIndexStore";

import * as echarts from "echarts/core";
import { HeatmapChart, PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  TitleComponent, // 新增标题组件
  CalendarComponent, // 新增日历组件
} from "echarts/components";

export default {
  setup() {
    const utils = new Utils();
    const okr = useOkrStore();
    const user = useUserStore();
    const focus = useFocusStore();
    const index = useIndexStore();

    // 主题色配置
    const themeColors = ["#0052d9", "#2151d1", "#f2f3fe"];

    // 初始化图表
    const initCharts = () => {
      nextTick(() => {
        // 注册必须的组件
        echarts.use([TitleComponent, CalendarComponent, HeatmapChart, PieChart, CanvasRenderer, TooltipComponent, VisualMapComponent, LegendComponent]);

        // 日历热力图
        const heatmapChart = echarts.init(document.getElementById("heatmap"));
        heatmapChart.setOption(getHeatmapOption());

        // 饼图
        const pieChart = echarts.init(document.getElementById("pie"));
        pieChart.setOption(getPieOption());
      });
    };

    // 生成虚拟数据
    const getVirtualData = (year) => {
      const date = +echarts.time.parse(year + "-01-01");
      const end = +echarts.time.parse(+year + 1 + "-01-01");
      const dayTime = 3600 * 24 * 1000;
      const data = [];
      for (let time = date; time < end; time += dayTime) {
        data.push([echarts.time.format(time, "{yyyy}-{MM}-{dd}", false), Math.floor(Math.random() * 100)]);
      }
      return data;
    };

    // 日历图配置
    const getHeatmapOption = () => ({
      title: {
        top: 10,
        left: "center",
        text: "学习日历",
        textStyle: {
          color: themeColors[0],
        },
      },
      tooltip: {
        formatter: (params) => `${params.value[0]}<br/>学习时长：${params.value[1]}分钟`,
      },
      visualMap: {
        min: 0,
        max: 100,
        type: "piecewise",
        orient: "horizontal",
        left: "center",
        top: 40,
        inRange: {
          color: [themeColors[2], themeColors[1], themeColors[0]],
        },
      },
      calendar: {
        top: 80,
        left: 20,
        right: 20,
        cellSize: ["auto", 15],
        range: new Date().getFullYear(),
        itemStyle: {
          borderWidth: 0.5,
          borderColor: themeColors[2],
        },
        yearLabel: { show: false },
      },
      series: {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: getVirtualData(new Date().getFullYear()),
      },
    });

    // 饼图配置
    const getPieOption = () => ({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c}小时 ({d}%)",
      },
      legend: {
        top: "5%",
        left: "center",
        textStyle: {
          color: themeColors[0],
        },
      },
      color: [themeColors[0], themeColors[1], themeColors[2], "#a0cfff", "#c6e2ff"],
      series: [
        {
          name: "今日学习分布",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "60%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              color: themeColors[0],
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 3.6, name: "前端开发" },
            { value: 2.1, name: "算法练习" },
            { value: 1.8, name: "项目实战" },
            { value: 1.2, name: "技术阅读" },
            { value: 0.6, name: "其他" },
          ],
        },
      ],
    });
    // 首次挂载时执行
    onMounted(() => {
      echarts.use([HeatmapChart, PieChart, CanvasRenderer, GridComponent, TooltipComponent, VisualMapComponent, LegendComponent]);
      initCharts();
    });

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

.echartsView {
  width: 100%;
  height: 400px;
  padding: 16px;
  margin-bottom: 16px;
  /* background: white; */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.echarts {
  width: 100%;
  height: 100%;
}
</style>
