#include <Arduino.h>
#include "Arduino_GFX_Library.h"
#include "pin_config.h"
#include <Wire.h>
#include "HWCDC.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <TimeLib.h>
#include <ArduinoJson.h>
#include "SensorQMI8658.hpp"
#include "SensorPCF85063.hpp"

HWCDC USBSerial;
Arduino_DataBus *bus = new Arduino_ESP32SPI(LCD_DC, LCD_CS, LCD_SCK, LCD_MOSI);
Arduino_GFX *gfx = new Arduino_ST7789(bus, LCD_RST, 0, true, LCD_WIDTH, LCD_HEIGHT, 0, 20);

// WiFi配置
const char *ssid = "IE";
const char *password = "0d000721";
const char *serverUrl = "http://192.168.12.222:3000/esp32/api";

// 时钟参数
#define MARK_COLOR WHITE
#define SUBMARK_COLOR DARKGREY
#define HOUR_COLOR WHITE
#define MINUTE_COLOR BLUE
#define SECOND_COLOR RED
int16_t w, h, center;
int16_t hHandLen, mHandLen, sHandLen, markLen;
float sdeg, mdeg, hdeg;
int16_t osx = 0, osy = 0, omx = 0, omy = 0, ohx = 0, ohy = 0;
int16_t nsx, nsy, nmx, nmy, nhx, nhy;

// 时间同步
time_t lastSyncTime = 0;
bool timeSynced = false;

// 传感器实例
SensorQMI8658 qmi;
SensorPCF85063 rtc;
IMUdata acc = { 0 };
IMUdata gyr = { 0 };

// 消息显示
#define MSG_Y_POS 250
#define MSG_HEIGHT 30
char msgBuffer[32] = "No message";

void setup() {
  Serial.begin(115200);
  USBSerial.begin(115200);

  // 初始化显示屏
  gfx->begin();
  gfx->fillScreen(BLACK);
  gfx->setTextColor(WHITE);
  gfx->setTextSize(2);
  gfx->print("Initializing...");

  // 初始化WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry++ < 20) {
    delay(500);
    gfx->print(".");
  }
  if (WiFi.status() != WL_CONNECTED) {
    gfx->fillScreen(RED);
    gfx->print("WiFi Failed!");
    while (1)
      ;
  }

  // 初始化RTC
  Wire.begin(IIC_SDA, IIC_SCL);
  if (!rtc.begin(Wire, PCF85063_SLAVE_ADDRESS, IIC_SDA, IIC_SCL)) {
    gfx->fillScreen(RED);
    gfx->print("RTC Init Failed!");
    while (1)
      ;
  }

  // 初始化传感器
  if (!qmi.begin(Wire, QMI8658_L_SLAVE_ADDRESS, IIC_SDA, IIC_SCL)) {
    gfx->fillScreen(RED);
    gfx->print("Sensor Init Failed!");
    while (1)
      ;
  }
  qmi.configAccelerometer(SensorQMI8658::ACC_RANGE_4G, SensorQMI8658::ACC_ODR_1000Hz);
  qmi.configGyroscope(SensorQMI8658::GYR_RANGE_64DPS, SensorQMI8658::GYR_ODR_896_8Hz);
  qmi.enableGyroscope();
  qmi.enableAccelerometer();

  // 初始化时钟参数
  w = gfx->width();
  h = gfx->height();
  center = min(w, h) / 2;
  hHandLen = center * 3 / 8;
  mHandLen = center * 2 / 3;
  sHandLen = center * 5 / 6;
  markLen = sHandLen / 6;

  // 初始化背光
  pinMode(LCD_BL, OUTPUT);
  digitalWrite(LCD_BL, HIGH);

  // 初始化时间
  setTime(rtc.getDateTime().hour, rtc.getDateTime().minute,
          rtc.getDateTime().second, rtc.getDateTime().day,
          rtc.getDateTime().month, rtc.getDateTime().year);

  // 绘制时钟界面
  drawClockFace();
  drawMessage(msgBuffer);
}

void loop() {
  // 读取传感器数据
  if (qmi.getDataReady()) {
    qmi.getAccelerometer(acc.x, acc.y, acc.z);
    qmi.getGyroscope(gyr.x, gyr.y, gyr.z);
  }

  // 处理时间显示
  updateTime();
  updateClockDisplay();

  // 处理POST请求（每秒一次）
  static unsigned long lastPostTime = 0;
  if (millis() - lastPostTime >= 1000) {
    sendPostRequest();
    lastPostTime = millis();
  }
}

void drawClockFace() {
  gfx->fillScreen(BLACK);

  // 绘制60个刻度
  for (int i = 0; i < 60; i++) {
    float angle = radians(i * 6 - 90);  // 转换为弧度，-90度起始
    int16_t inner, outer;

    if (i % 15 == 0) {  // 主刻度（每15分钟）
      inner = center - markLen * 2;
      outer = center;
    } else if (i % 5 == 0) {  // 次刻度（每5分钟）
      inner = center - markLen * 1.5;
      outer = center;
    } else {  // 秒刻度
      inner = center - markLen;
      outer = center;
    }

    int16_t x0 = cos(angle) * inner + center;
    int16_t y0 = sin(angle) * inner + center;
    int16_t x1 = cos(angle) * outer + center;
    int16_t y1 = sin(angle) * outer + center;

    gfx->drawLine(x0, y0, x1, y1, (i % 5 == 0) ? MARK_COLOR : SUBMARK_COLOR);
  }
}

void updateTime() {
  // 使用TimeLib管理时间
  tmElements_t tm;
  breakTime(now(), tm);

  // 计算指针角度
  sdeg = map(tm.Second, 0, 60, 0, 360) * DEG_TO_RAD;
  mdeg = map(tm.Minute, 0, 60, 0, 360) * DEG_TO_RAD;
  hdeg = map(tm.Hour % 12, 0, 12, 0, 360) * DEG_TO_RAD;

  // 计算指针坐标
  nsx = cos(sdeg - HALF_PI) * sHandLen + center;
  nsy = sin(sdeg - HALF_PI) * sHandLen + center;
  nmx = cos(mdeg - HALF_PI) * mHandLen + center;
  nmy = sin(mdeg - HALF_PI) * mHandLen + center;
  nhx = cos(hdeg - HALF_PI) * hHandLen + center;
  nhy = sin(hdeg - HALF_PI) * hHandLen + center;
}

void updateClockDisplay() {
  // 擦除旧指针
  gfx->drawLine(center, center, osx, osy, BLACK);
  gfx->drawLine(center, center, omx, omy, BLACK);
  gfx->drawLine(center, center, ohx, ohy, BLACK);

  // 绘制新指针
  gfx->drawLine(center, center, nsx, nsy, SECOND_COLOR);
  gfx->drawLine(center, center, nmx, nmy, MINUTE_COLOR);
  gfx->drawLine(center, center, nhx, nhy, HOUR_COLOR);

  // 保存当前坐标
  osx = nsx;
  osy = nsy;
  omx = nmx;
  omy = nmy;
  ohx = nhx;
  ohy = nhy;
}

void drawMessage(const String &msg) {
  static String lastMsg = "";
  if (msg == lastMsg) return;

  // 清除固定区域
  gfx->fillRect(0, MSG_Y_POS, gfx->width(), MSG_HEIGHT, BLACK);

  // 计算居中位置
  gfx->setTextSize(2);
  int16_t textWidth = msg.length() * 6 * 2;
  int16_t x = (gfx->width() - textWidth) / 2;

  // 绘制消息
  gfx->setCursor(x, MSG_Y_POS + 5);
  gfx->print(msg);

  lastMsg = msg;
}

void sendPostRequest() {
  if (!qmi.getDataReady()) return;

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // 构造 JSON 请求体
  String jsonBody = "{\"logId\":\"TapTimeEsp32\","
                    "\"data\":{"
                      "\"userId\":\"TapTimeEsp32\","
                      "\"accel\":{\"x\":" + String(acc.x) + ",\"y\":" + String(acc.y) + ",\"z\":" + String(acc.z) + "},"
                      "\"gyro\":{\"x\":" + String(gyr.x) + ",\"y\":" + String(gyr.y) + ",\"z\":" + String(gyr.z) + "}"
                    "}}";

  // 打印请求内容到串口监视器
  Serial.println("Sending POST request to: " + String(serverUrl));
  Serial.println("Request body: " + jsonBody);

  // 发送 POST 请求
  int httpResponseCode = http.POST(jsonBody);

  // 打印响应状态码
  if (httpResponseCode > 0) {
    String response = http.getString();

    // 打印服务器响应内容
    Serial.println("HTTP Response Code: " + String(httpResponseCode));
    Serial.println("Server Response: " + response);

    // 使用StaticJsonDocument替代DynamicJsonDocument（节省内存）
    StaticJsonDocument<256> doc;  // 根据实际数据大小调整容量
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      String newMsg = doc["msg"].as<String>();
      String dateStr = doc["date"].as<String>();

      if (newMsg != msgBuffer) {
        strcpy(msgBuffer, newMsg.c_str());
        drawMessage(newMsg);
      }

      syncTimeFromServer(dateStr);
    } else {
      Serial.print("JSON解析失败: ");
      Serial.println(error.c_str());
    }
  } else {
    // 打印错误信息
    Serial.println("POST request failed. Error code: " + String(httpResponseCode));
  }

  // 关闭连接
  http.end();
}

void syncTimeFromServer(const String &dateStr) {
  struct tm serverTime;
  if (strptime(dateStr.c_str(), "%Y-%m-%dT%H:%M:%S", &serverTime)) {
    time_t serverTimestamp = mktime(&serverTime);
    time_t localTimestamp = now();

    // 转换为UTC+8时间
    serverTimestamp += 28800;  // UTC转UTC+8

    if (abs(serverTimestamp - localTimestamp) > 5) {
      setTime(serverTimestamp);
      lastSyncTime = serverTimestamp;
      timeSynced = true;
      USBSerial.println("Time synced from server");
    }
  }
}