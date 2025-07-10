#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>

// WiFi Credentials
const char* ssid = "Wokwi-GUEST"; //name wifi
const char* password = ""; // pass wifi

// Telegram Configuration
const String BOT_TOKEN = ""; //masukan bot token tele
const String CHAT_ID = ""; // masukan chat id tele

// MQTT Configuration
const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* clientId = "esp32_pakan_relay";
const char* topic_sub = "pakan/perintah";
const char* topic_pub = "pakan/status";

// Pins
const int trigPin = 14;
const int echoPin = 27;
const int relayPin = 26;

WiFiClient espClient;
PubSubClient client(espClient);

bool relayStatus = false;
String statusPakan = "Tidak Diketahui";
bool sudahKirimNotif = false;
unsigned long lastNotifTime = 0;
const unsigned long notifCooldown = 10000; // 10 detik untuk pengujian, ubah ke 3600000 untuk 1 jam

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected: " + WiFi.localIP().toString());

  // Setup MQTT
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  // Tes notifikasi Telegram saat startup
  Serial.println("ℹ️ Menguji notifikasi Telegram...");
  kirimNotifTelegram("🔔 Tes notifikasi saat startup");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float jarak = bacaJarak();
  Serial.printf("📏 Jarak: %.2f cm\n", jarak);

  // Update status pakan
  String newStatus = (jarak >= 0 && jarak <= 5) ? "Habis" : (jarak > 5) ? "Penuh" : "Tidak Valid";
  if (newStatus != statusPakan) {
    statusPakan = newStatus;
    client.publish(topic_pub, statusPakan.c_str());
    Serial.printf("📤 Status pakan diperbarui: %s\n", statusPakan.c_str());
  }

  // Publish jarak
  char buf[10];
  dtostrf(jarak, 1, 2, buf);
  client.publish("pakan/jarak", buf);

  // Publish relay status
  client.publish("pakan/relay", relayStatus ? "ON" : "OFF");

  // Cek apakah notifikasi harus dikirim
  if (jarak >= 0 && jarak < 5) {
    Serial.println("⚠️ Pakan habis terdeteksi!");
    if (!sudahKirimNotif && (millis() - lastNotifTime > notifCooldown)) {
      Serial.println("ℹ️ Mencoba mengirim notifikasi Telegram...");
      kirimNotifTelegram("⚠️ Pakan ayam hampir habis! Segera isi ulang.");
      sudahKirimNotif = true;
      lastNotifTime = millis();
    } else {
      Serial.printf("ℹ️ Notifikasi tidak dikirim: sudahKirimNotif=%d, waktu sejak notifikasi terakhir=%lu ms\n", 
                    sudahKirimNotif, millis() - lastNotifTime);
    }
  } else if (jarak > 5 && sudahKirimNotif) {
    sudahKirimNotif = false; // Reset notifikasi jika pakan sudah diisi ulang
    Serial.println("ℹ️ Notifikasi direset karena pakan penuh");
  }

  delay(2000);
}

float bacaJarak() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long durasi = pulseIn(echoPin, HIGH, 30000);
  if (durasi == 0) {
    Serial.println("⚠️ Sensor timeout");
    return -1; // Handle timeout
  }
  float jarak = durasi * 0.034 / 2;
  if (jarak <= 0 || jarak >= 400) {
    Serial.println("⚠️ Jarak tidak valid");
    return -1; // Validasi jarak
  }
  return jarak;
}

void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  Serial.printf("📥 Topic: %s | Msg: %s\n", topic, msg.c_str());

  if (String(topic) == topic_sub) {
    if (msg == "ON") {
      digitalWrite(relayPin, HIGH);
      relayStatus = true;
      client.publish("pakan/relay", "ON");
    } else if (msg == "OFF") {
      digitalWrite(relayPin, LOW);
      relayStatus = false;
      client.publish("pakan/relay", "OFF");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Menghubungkan MQTT...");
    if (client.connect(clientId)) {
      Serial.println("✅ Terhubung");
      client.subscribe(topic_sub);
    } else {
      Serial.print("❌ Gagal, coba lagi...");
      delay(2000);
    }
  }
}

void kirimNotifTelegram(String pesan) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi tidak terhubung, tidak bisa mengirim notifikasi");
    return;
  }

  HTTPClient http;
  String url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage?chat_id=" + CHAT_ID + "&text=" + urlencode(pesan);
  Serial.printf("📤 Mengirim ke URL: %s\n", url.c_str());
  http.begin(url);
  int httpCode = http.GET();
  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Notifikasi terkirim ke Telegram: %s\n", response.c_str());
  } else {
    Serial.printf("❌ Gagal kirim notif, kode HTTP: %d\n", httpCode);
  }
  http.end();
}

String urlencode(String str) {
  String encoded = "";
  char c;
  char code0;
  char code1;
  for (int i = 0; i < str.length(); i++) {
    c = str.charAt(i);
    if (isalnum(c)) {
      encoded += c;
    } else {
      code1 = (c & 0xf) + '0';
      if ((c & 0xf) > 9) code1 = (c & 0xf) - 10 + 'A';
      c = (c >> 4) & 0xf;
      code0 = c + '0';
      if (c > 9) code0 = c - 10 + 'A';
      encoded += '%';
      encoded += code0;
      encoded += code1;
    }
  }
  return encoded;
}
