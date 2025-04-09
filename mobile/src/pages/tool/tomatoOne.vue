<template>
  <view class="view">
    <!-- 时间显示区域 -->
    <view class="clock">
      <view class="time">{{ formattedTime }}</view>
      <view class="status">{{ statusText }}</view>
    </view>

    <view class="control">
      <view class="button">
        <t-button @click="toggleTimer" block :theme="isRunning ? 'primary' : 'light'">
          {{ isRunning ? "暂停" : "开始" }}
        </t-button>
        <view style="width: 32px"></view>
        <t-button @click="resetTimer" block> 重置 </t-button>
      </view>

      <view class="setting">
        <view class="input">
          <label class="label">工作时长：</label>
          <input class="number" type="number" v-model="workTime" min="1" max="60" :disabled="isRunning" />
          <span>分钟</span>
        </view>
        <view class="input">
          <label class="label">休息时长：</label>
          <input class="number" type="number" v-model="breakTime" min="1" max="60" :disabled="isRunning" />
          <span>分钟</span>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";

const workTime = ref(25);
const breakTime = ref(5);
const remainingTime = ref(workTime.value * 60);
const isRunning = ref(false);
const isWorking = ref(true);
let timer = null;

const formattedTime = computed(() => {
  const min = Math.floor(remainingTime.value / 60);
  const sec = remainingTime.value % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
});

const statusText = computed(() => (isWorking.value ? "专注时间" : "休息时间"));

function toggleTimer() {
  isRunning.value = !isRunning.value;
  if (isRunning.value) {
    timer = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--;
      } else {
        clearInterval(timer);
        isWorking.value = !isWorking.value;
        remainingTime.value = isWorking.value ? workTime.value * 60 : breakTime.value * 60;
        timer = setInterval(toggleTimer, 1000);
      }
    }, 1000);
  } else {
    clearInterval(timer);
  }
}

function resetTimer() {
  clearInterval(timer);
  isRunning.value = false;
  isWorking.value = true;
  remainingTime.value = workTime.value * 60;
}

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.view {
  margin: 0;
  padding: 0;
  height: 90vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(#f2f3fe, #ffffff);
  color: #2151d1;
}

.clock {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.time {
  font-size: 64px;
  font-weight: bold;
  margin-bottom: 15px;
}

.status {
  font-weight: bold;
  font-size: 24px;
  opacity: 0.7;
}

.control {
  padding: 20px;
}

.button {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting {
  background-color: #f2f3fe;
  margin-top: 16px;
  padding: 16px 24px;
  border-radius: 10px;
}

.input {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: bold;
  text-align: center;
  width: 40%;
}
.number {
  text-align: end;
  width: 40%;
}

input[type="number"] {
  width: 80px;
  padding: 8px;
  border: 2px solid #2151d1;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
}

input[type="number"]:disabled {
  background-color: #e7e7e7;
}
</style>
