<h1 align="center">
  Sistem Pakan Ayam Otomatis dengan ESP32  
  <img src="[https://www.espressif.com/sites/default/files/ESP32_logo.png](https://www.pngwing.com/en/free-png-ahbpf)" alt="ESP32 Logo" height="30" style="vertical-align: middle; margin-left: 10px;" />
</h1>

<p align="center"><em>Sistem IoT untuk memantau dan mengontrol pakan ayam menggunakan ESP32, sensor ultrasonik, MQTT, dan notifikasi Telegram</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/last%20commit-today-brightgreen" />
  <img src="https://img.shields.io/badge/language-C%2B%2B-blue" />
  <img src="https://img.shields.io/badge/platform-ESP32-informational" />
  <img src="https://img.shields.io/badge/protocol-MQTT-green" />
</p>

---

## 🚀 Fitur

- ✅ **Pemantauan Jarak Pakan**  
  Sensor HC-SR04 mendeteksi status pakan: < 5 cm = *Habis*, > 5 cm = *Penuh*.
- ✅ **Kontrol Relay**  
  Mengatur motor pakan melalui dashboard web via MQTT.
- ✅ **Notifikasi Telegram**  
  Kirim pesan otomatis saat pakan habis (< 5 cm) dengan cooldown 1 jam (anti-spam).
- ✅ **Dashboard Web**  
  Menampilkan status pakan, jarak, status relay, dan kontrol real-time.
- ✅ **Komunikasi MQTT**  
  Menggunakan broker HiveMQ untuk komunikasi ESP32 ↔ dashboard.

---

## 🛠 Komponen

### Perangkat Keras
- **ESP32**  
  Mikrokontroler utama.
- **Sensor Ultrasonik HC-SR04**  
  - Trig: Pin 14  
  - Echo: Pin 27  
  - VCC: 5V  
  - GND: GND  
- **Relay**  
  - Pin: 26  

### Perangkat Lunak
- **Arduino IDE**: Untuk memprogram ESP32.
- **MQTT.js**: Logika dashboard web.
- **Broker MQTT**: `broker.hivemq.com:1883`.
- **API Telegram**: Untuk notifikasi.

---

## 📁 Struktur File

| File                | Deskripsi                              |
|---------------------|----------------------------------------|
| `pakan_ayam.ino`    | Kode utama ESP32 (sensor, relay, MQTT, Telegram) |
| `index.html`        | Antarmuka dashboard web                |
| `main.js`           | Logika dashboard dan komunikasi MQTT   |
| `style.css`         | Styling untuk dashboard web            |
| `README.md`         | Dokumentasi proyek                     |

---

## 🧪 Simulasi

Proyek ini dapat diuji menggunakan [Wokwi Simulator](https://wokwi.com).  
⚠️ **Catatan**: Wokwi tidak mendukung HTTP request untuk notifikasi Telegram. Gunakan ESP32 fisik dan koneksi WiFi untuk pengujian penuh.

---

## 🚀 Cara Penggunaan

### 1. Persiapan Perangkat Keras
1. Hubungkan **HC-SR04**:
   - Trig → Pin 14
   - Echo → Pin 27
   - VCC → 5V
   - GND → GND
2. Hubungkan **Relay** ke Pin 26.
3. Pastikan ESP32 terhubung ke WiFi.

### 2. Konfigurasi Perangkat Lunak

#### ESP32
1. Buka `pakan_ayam.ino` di Arduino IDE.
2. Ganti `ssid` dan `password` sesuai jaringan WiFi Anda.
3. Isi konfigurasi Telegram:
   - `BOT_TOKEN`: Dapatkan dari BotFather.
   - `CHAT_ID`: Dapatkan via `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`.
4. Upload kode ke ESP32.

#### Dashboard Web
1. Host file `index.html`, `main.js`, dan `style.css` di server (misalnya Netlify, Firebase Hosting, atau lokal).
2. Akses dashboard melalui browser.

### 3. Pengujian
- **Sensor Ultrasonik**  
  Dekatkan objek < 5 cm untuk status *Habis*. Cek output di Serial Monitor (baud 115200).
- **Notifikasi Telegram**  
  Saat pakan habis, bot mengirim:  
  ⚠️ *Pakan ayam hampir habis! Segera isi ulang.*  
  Cooldown: 1 jam.
- **Dashboard Web**  
  Lihat status pakan (*Habis/Penuh*), jarak, status relay, dan kontrol relay dengan tombol *NYALAKAN*/*MATIKAN*.
- **MQTT**  
  - ESP32 publish ke: `pakan/status`, `pakan/jarak`, `pakan/relay`.  
  - Dashboard subscribe dan kontrol ke: `pakan/relay/control`.

---

## 🔧 Konfigurasi

### Library Arduino
Pastikan library berikut terinstal di Arduino IDE:
- `WiFi`
- `HTTPClient`
- `PubSubClient`

### MQTT Broker
- Host: `broker.hivemq.com`
- Port: `1883`

---

## 📊 Monitoring

### Serial Monitor
Cek status sistem melalui Serial Monitor (baud 115200):
📏 Jarak: 1.87 cm
📤 Status pakan: Habis
⚠️ Pakan habis terdeteksi!
ℹ️ Mencoba kirim notif...
✅ Notifikasi terkirim ke Telegram

---


### Dashboard Web
- URL: `https://your-hosted-site.com`  
  Menampilkan status pakan, jarak, dan kontrol relay.

---

## 🐞 Debugging

- **Notifikasi Telegram Gagal**  
  - Pastikan WiFi terhubung.  
  - Verifikasi `BOT_TOKEN` dan `CHAT_ID`.  
  - Tes manual:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?chat_id=<YOUR_CHAT_ID>&text=Test
```

- Jika cooldown aktif, ubah `notifCooldown` ke `10000` (10 detik) untuk pengujian.

- **Jarak Selalu -1**  
- Periksa kabel HC-SR04.  
- Pastikan sensor mendapat tegangan 5V.

- **MQTT Gagal**  
- Pastikan port 1883 tidak diblokir.  
- Cek koneksi ke `broker.hivemq.com:1883`.

---

## ⚠️ Catatan Penting

- Wokwi tidak mendukung HTTP request untuk Telegram. Gunakan ESP32 fisik untuk notifikasi.
- Pastikan port 1883 pada MQTT broker tidak diblokir.
- Selalu cek Serial Monitor untuk debugging cepat.

---

## 🤝 Kontribusi

- **Fork** repository dan kirim **pull request** untuk perbaikan atau fitur baru.
- Laporkan bug melalui **issue** di GitHub.

---

## 👨‍💻 Pengembang

**Nama Pengembang**  
- GitHub: [Link GitHub Anda]  
- Portfolio: [Link Portfolio Anda]

---

## 📝 Lisensi

<p align="center">
  <a href="https://github.com/ficrammanifur/ficrammanifur/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" />
  </a>
</p>

---

<div align="center">

**⭐ Beri bintang pada repository ini jika Anda merasa terbantu!**

<p><a href="#top">⬆ Kembali ke Atas</a></p>

</div>
