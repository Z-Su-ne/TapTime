<template>
  <view class="view">
    <!-- show -->
    <t-cell-group theme="card">
      <t-cell :title="user.username || '点击此处登录'" :description="'Email: ' + (user.email || '空空的')" @click="user.uuid ? (showUpdateView = true) : (showUserEvent = true)">
        <template #leftIcon>
          <t-avatar>{{ user.username || "未登录" }}</t-avatar>
        </template>
      </t-cell>
      <t-cell title="手机传感器" hover>
        <template #note>
          <t-switch :default-value="true" />
        </template>
      </t-cell>
      <t-cell title="外置设备" hover>
        <template #note>
          <t-switch :default-value="true" />
        </template>
      </t-cell>
      <!-- <t-cell title="信息修改" arrow /> -->
    </t-cell-group>

    <div style="margin: 16px" :hidden="!user.uuid">
      <t-button size="large" theme="danger" variant="outline" block style="background-color: white" @click="exit">退出当前账号</t-button>
    </div>

    <!-- 登录/注册 -->
    <t-dialog v-model:visible="showUserEvent" content="请先注册或登录" cancel-btn="注册" confirm-btn="登录" @confirm="userEventLogin" @cancel="userEventRegister" :closeOnOverlayClick="true" />
    <view class="popup">
      <t-popup v-model:visible="showRegisterView" placement="center" destroy-on-close>
        <view class="popupText">用户注册</view>
        <t-input label="用户名" placeholder="请取一个好听的名字吧" v-model="postUser.username" @change="(value) => inputInfo('username', value)" borderless />
        <!-- <t-input label="手机号" placeholder="请输入电话" v-model="postUser.tel" @change="(value) => inputInfo('tel', value)" borderless /> -->
        <t-input label="邮&emsp;箱" placeholder="请输入邮箱" v-model="postUser.email" @change="(value) => inputInfo('email', value)" borderless />
        <t-input label="密&emsp;码" placeholder="请输入密码" v-model="postUser.password" @change="(value) => inputInfo('password', value)" />
        <t-button size="large" theme="primary" block style="margin: 16px; width: 75vw" @click="handleRegister">注册</t-button>
      </t-popup>
    </view>
    <view class="popup">
      <t-popup v-model:visible="showLoginView" placement="center" destroy-on-close>
        <view class="popupText">用户登录</view>
        <t-input label="邮&emsp;箱" placeholder="请输入邮箱" v-model="postUser.email" @change="(value) => inputInfo('email', value)" borderless />
        <t-input label="密&emsp;码" placeholder="请输入密码" v-model="postUser.password" @change="(value) => inputInfo('password', value)" />
        <t-button size="large" theme="primary" block style="margin: 16px; width: 75vw" @click="handleLogin">登录</t-button>
      </t-popup>
    </view>

    <!-- 账号修改 -->
    <view class="popup">
      <t-popup v-model:visible="showUpdateView" placement="center" destroy-on-close>
        <view class="popupText">用户信息修改</view>
        <t-input label="新用户名" placeholder="请取一个好听的名字吧(选填)" v-model="postUser.username" @change="(value) => inputInfo('username', value)" borderless />
        <t-input label="新邮箱&emsp;" placeholder="请输入新邮箱(选填)" v-model="postUser.email" @change="(value) => inputInfo('email', value)" borderless />
        <t-input label="新密码&emsp;" placeholder="请输入新密码（选填）" v-model="postUser.password" @change="(value) => inputInfo('password', value)" />
        <t-button size="large" theme="primary" block style="margin: 16px; width: 75vw" @click="handleUpdate">修改信息</t-button>
      </t-popup>
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
import { nextTick, h, ref } from "vue";
import { Icon as TIcon } from "tdesign-icons-vue-next";
import { useUserStore } from "../../stores/useUserStore";
import Utils from "../../common/utils";
import { Toast } from "tdesign-mobile-vue";

export default {
  setup() {
    const utils = new Utils();
    const user = useUserStore();
    const postUser = ref({
      uuid: undefined,
      username: undefined,
      tel: undefined,
      email: undefined,
      password: undefined,
      newPassword: undefined,
    });
    const inputInfo = (field, value) => {
      postUser.value[field] = value;
      console.log(`保存字段 ${field}:`, postUser.value[field]);
    };

    // 用户弹出框事件
    const showUserEvent = ref(false);
    const userEventLogin = () => {
      console.log("用户登录");
      nextTick(() => (showLoginView.value = true));
    };
    const userEventRegister = () => {
      console.log("用户注册");
      nextTick(() => (showRegisterView.value = true));
    };
    const userEventClose = () => {
      console.log("用户退出");
    };

    // 注册
    const showRegisterView = ref(false);
    const handleRegister = async () => {
      try {
        if (utils.isEmpty(postUser.value.username) || utils.isEmpty(postUser.value.email) || utils.isEmpty(postUser.value.password)) {
          Toast({ message: "不能为空", theme: "error" });
        } else {
          postUser.value.type = "user";
          postUser.value.event = "register";
          const logId = utils.generateUUID();
          const registeRes = await user.userPost(logId, postUser.value);
          if (registeRes.success) {
            user.$patch({
              uuid: registeRes.return[0].uuid,
              username: registeRes.return[0].username,
              password: registeRes.return[0].password,
              email: registeRes.return[0].email,
            });
            Toast({ message: "注册成功", theme: "success" });
          } else {
            Toast({ message: registeRes.return, theme: "error" });
            user.$reset();
          }
        }
      } catch (error) {
        Toast({ message: "未知错误:" + error, theme: "error" });
        user.$reset();
      }
      showRegisterView.value = false;
      postUser.value = utils.toEmpty(postUser.value);
    };

    // 登录
    const showLoginView = ref(false);
    const handleLogin = async () => {
      try {
        if (utils.isEmpty(postUser.value.email) || utils.isEmpty(postUser.value.password)) {
          Toast({ message: "不能为空", theme: "error" });
        } else {
          postUser.value.type = "user";
          postUser.value.event = "login";
          const logId = utils.generateUUID();
          const loginRes = await user.userPost(logId, postUser.value);
          if (loginRes.success) {
            user.$patch({
              uuid: loginRes.return[0].uuid,
              username: loginRes.return[0].username,
              password: loginRes.return[0].password,
              email: loginRes.return[0].email,
            });
            Toast({ message: "登录成功", theme: "success" });
          } else {
            Toast({ message: loginRes.return, theme: "error" });
            user.$reset();
          }
        }
      } catch (error) {
        Toast({ message: "未知错误:" + error, theme: "error" });
        user.$reset();
      }
      showLoginView.value = false;
      postUser.value = utils.toEmpty(postUser.value);
    };

    // 修改
    const showUpdateView = ref(false);
    const handleUpdate = async () => {
      try {
        postUser.value.type = "user";
        postUser.value.event = "update";
        postUser.value.uuid = user.uuid;
        const logId = utils.generateUUID();
        const updateRes = await user.userPost(logId, postUser.value);
        if (updateRes.success) {
          user.$patch({
            username: updateRes.return[0].username,
            password: updateRes.return[0].password,
            email: updateRes.return[0].email,
          });
          Toast({ message: "更新成功", theme: "success" });
        } else {
          Toast({ message: updateRes.return, theme: "error" });
          user.$reset();
        }
      } catch (error) {
        Toast({ message: "未知错误:" + error, theme: "error" });
        user.$reset();
      }
      showUpdateView.value = false;
      postUser.value = utils.toEmpty(postUser.value);
    };

    // 退出
    const exit = async () => {
      user.$reset();
    };

    // 底部导航栏
    const tabBarSelect = ref("tabBar3");
    const tabBar = ref([
      { value: "tabBar1", text: "主页", icon: "home" },
      { value: "tabBar2", text: "探索", icon: "system-sum" },
      { value: "tabBar3", text: "个人", icon: "user" },
    ]);

    // 图标渲染方法
    const renderIcon = (name) => {
      return () => h(TIcon, { name });
    };

    // 导航栏跳转
    const toTabBar = () => {
      if (tabBarSelect.value == "tabBar1") {
        console.log("跳转 tabBar1（主页）");
        uni.navigateTo({ url: "/pages/index/index" });
      }
      if (tabBarSelect.value == "tabBar2") {
        console.log("跳转 tabBar2（探索）");
        uni.navigateTo({ url: "/pages/mine/mine" });
      }
      if (tabBarSelect.value == "tabBar3") {
        console.log("跳转 tabBar3（个人）");
        uni.navigateTo({ url: "/pages/mine/mine" });
      }
    };

    return {
      user,
      postUser,
      inputInfo,

      showUserEvent,
      userEventRegister,
      userEventLogin,
      userEventClose,

      showRegisterView,
      handleRegister,

      showLoginView,
      handleLogin,

      showUpdateView,
      handleUpdate,

      exit,

      tabBar,
      tabBarSelect,
      toTabBar,
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
  cursor: pointer;
  transition: opacity 0.2s;
}
.icon:active {
  opacity: 0.7;
}
/* 内容区域 */
.content {
  padding: 16px;
  line-height: 1.6;
}
/* 登录、注册 */
.popup {
  align-items: center;
  justify-items: center;
  width: 80vw !important;
  border-radius: 10px;
}
.popupText {
  margin: 16px 0;
  width: 80vw !important;
  text-align: center;
  font-size: larger;
  font-weight: bold;
  color: #0052d9;
}
</style>
