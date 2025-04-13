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

// 数据缓冲区
#define SAMPLE_INTERVAL 100    // 100ms采样间隔
#define BUFFER_SIZE 10         // 缓冲区存储10组数据（1秒数据量）
struct IMUData {
  float ax, ay, az;
  float gx, gy, gz;
};
IMUData imuBuffer[BUFFER_SIZE];
volatile int bufferIndex = 0;
unsigned long lastSampleTime = 0;
bool bufferFull = false;

// 消息显示
#define MSG_Y_POS 250
#define MSG_HEIGHT 30
char msgBuffer[32] = "No message";

// 计时标志
char timekeeperBuffer[32] = "stop";

void setup() {
  Serial.begin(115200);
  USBSerial.begin(115200);
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
    Serial.print("."); // 调试输出
  }
  if (WiFi.status() != WL_CONNECTED) {
    gfx->fillScreen(RED);
    gfx->print("WiFi Failed!");
    Serial.println("WiFi Connection Failed"); // 调试信息
    while (1);
  }

  // 初始化I2C总线
  Wire.begin(IIC_SDA, IIC_SCL);
  
  // 初始化RTC
  if (!rtc.begin(Wire, PCF85063_SLAVE_ADDRESS, IIC_SDA, IIC_SCL)) {
    gfx->fillScreen(RED);
    gfx->print("RTC Init Failed!");
    Serial.println("RTC Initialization Failed"); // 调试信息
    while (1);
  }

  // 初始化QMI8658传感器
  if (!qmi.begin(Wire, QMI8658_L_SLAVE_ADDRESS, IIC_SDA, IIC_SCL)) {
    gfx->fillScreen(RED);
    gfx->print("Sensor Init Failed!");
    Serial.println("QMI8658 Initialization Failed"); // 调试信息
    while (1);
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
  drawMessage("Ready");
}

void loop() {
  unsigned long currentMillis = millis();

  // 数据采集逻辑（无中断禁用）
  if (currentMillis - lastSampleTime >= SAMPLE_INTERVAL) {
    if (qmi.getDataReady()) {
      qmi.getAccelerometer(
        imuBuffer[bufferIndex].ax,
        imuBuffer[bufferIndex].ay,
        imuBuffer[bufferIndex].az
      );
      qmi.getGyroscope(
        imuBuffer[bufferIndex].gx,
        imuBuffer[bufferIndex].gy,
        imuBuffer[bufferIndex].gz
      );
      bufferIndex = (bufferIndex + 1) % BUFFER_SIZE;
      bufferFull = (bufferIndex == 0); // 缓冲区填满标志
    }
    lastSampleTime = currentMillis;
  }

  // 时间显示更新
  updateTime();
  updateClockDisplay();

  // 数据发送逻辑（带超时控制）
  static unsigned long lastPostTime = 0;
  if (bufferFull && (currentMillis - lastPostTime >= 1000)) {
    sendPostRequest();
    bufferFull = false;
    lastPostTime = currentMillis;
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
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // 使用ArduinoJson构建符合接口的JSON
  StaticJsonDocument<1024> doc;
  doc["logId"] = "TapTimeEsp32"; // 保持与示例一致的logId格式
  JsonObject data = doc.createNestedObject("data");
  data["userId"] = "ae55238a-aed7-4f28-911f-071056761a06"; // 添加userId字段
  data["timekeeper"] = timekeeperBuffer;

  // 添加传感器数据数组（根据实际接口调整字段名）
  JsonArray samples = data.createNestedArray("samples");
  for (int i = 0; i < BUFFER_SIZE; i++) {
    JsonObject sample = samples.createNestedObject();
    sample["accel"]["x"] = imuBuffer[i].ax;
    sample["accel"]["y"] = imuBuffer[i].ay;
    sample["accel"]["z"] = imuBuffer[i].az;
    sample["gyro"]["x"] = imuBuffer[i].gx;
    sample["gyro"]["y"] = imuBuffer[i].gy;
    sample["gyro"]["z"] = imuBuffer[i].gz;
  }

  // 打印调试信息
  String jsonBody;
  serializeJsonPretty(doc, jsonBody);
  Serial.println("Sending JSON: " + jsonBody);

  int httpResponseCode = http.POST(jsonBody);
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response: " + String(httpResponseCode) + " - " + response); // 详细响应[[8]]
    
    StaticJsonDocument<256> respDoc;
    DeserializationError error = deserializeJson(respDoc, response);
    if (!error) {
      String newMsg = respDoc["msg"].as<String>();
      String dateStr = respDoc["date"].as<String>();
      if (newMsg != msgBuffer) {
        strcpy(msgBuffer, newMsg.c_str());
        drawMessage(newMsg);
      }
      String newTimekeeper = respDoc["timekeeper"].as<String>();
      if (newTimekeeper != timekeeperBuffer) {
        strcpy(timekeeperBuffer, newTimekeeper.c_str());
      }
      syncTimeFromServer(dateStr);
    }
  } else {
    Serial.println("HTTP Error: " + String(httpResponseCode)); // 错误处理[[7]]
  }
  http.end();
}

void syncTimeFromServer(const String &dateStr) {
  struct tm serverTime;
  if (strptime(dateStr.c_str(), "%Y-%m-%dT%H:%M:%S", &serverTime)) {
    time_t serverTimestamp = mktime(&serverTime);
    serverTimestamp += 28800; // UTC转UTC+8
    setTime(serverTimestamp);
    lastSyncTime = serverTimestamp;
    timeSynced = true;
    USBSerial.println("Time synced from server");
  }
}