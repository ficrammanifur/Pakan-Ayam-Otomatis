# 🐔 Sistem Pakan Ayam Otomatis dengan ESP32

Proyek IoT untuk memantau dan mengontrol pakan ayam menggunakan **ESP32**, sensor ultrasonik **HC-SR04**, **relay**, **MQTT**, dan **notifikasi Telegram**.  
Sistem ini memantau status pakan (Penuh/Habis), jarak pakan, mengontrol relay melalui dashboard web, serta mengirim notifikasi Telegram saat pakan habis.

---

## ✨ Fitur

- **Pemantauan Jarak Pakan**  
  Menggunakan sensor HC-SR04: jarak < 5 cm = *Habis*, > 5 cm = *Penuh*.
- **Kontrol Relay**  
  Nyalakan atau matikan motor via dashboard web (MQTT).
- **Notifikasi Telegram**  
  Pesan otomatis saat pakan habis (< 5 cm) dengan cooldown 1 jam (anti spam).
- **Dashboard Web**  
  Menampilkan status pakan, jarak, status relay, dan kontrol real-time.
- **MQTT**  
  Komunikasi ESP32 ↔ dashboard via broker HiveMQ.

---

## 🔧 Komponen

### Perangkat Keras
- ESP32
- Sensor Ultrasonik HC-SR04  
  - Trig → Pin 14
  - Echo → Pin 27
- Relay → Pin 26

### Perangkat Lunak
- Arduino IDE (program ESP32)
- MQTT.js (dashboard web)
- Broker MQTT: `broker.hivemq.com:1883`
- API Telegram (notifikasi)

---

## 📁 Struktur File

| File | Deskripsi |
|-----|-----------|
| `pakan_ayam.ino` | Kode ESP32 (sensor, relay, MQTT, Telegram) |
| `index.html` | Dashboard web |
| `main.js` | Logika dashboard & MQTT |
| `style.css` | Styling dashboard |
| `README.md` | Dokumentasi proyek ini |

---

## 🧪 Simulasi

Proyek dapat diuji di [Wokwi Simulator](https://wokwi.com):  
> ⚠️ Catatan: Wokwi tidak mendukung HTTP request (Telegram).  
Untuk notifikasi Telegram, gunakan ESP32 fisik & WiFi nyata.

---

## 🚀 Cara Penggunaan

### 1️⃣ Persiapan Perangkat Keras
- Sambungkan HC-SR04:
  - Trig → Pin 14
  - Echo → Pin 27
  - VCC → 5V
  - GND → GND
- Relay → Pin 26
- Pastikan ESP32 terhubung ke WiFi.

---

### 2️⃣ Konfigurasi Perangkat Lunak

#### ESP32
- Buka `pakan_ayam.ino` di Arduino IDE.
- Ganti `ssid` & `password` sesuai WiFi Anda.
- Isi `BOT_TOKEN` & `CHAT_ID`:
  - `BOT_TOKEN`: dapat dari BotFather.
  - `CHAT_ID`: dapatkan via `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`.
- Upload ke ESP32.

#### Dashboard Web
- Host file `index.html`, `main.js`, dan `style.css` di server (Netlify, Firebase Hosting, atau lokal).
- Buka dashboard di browser.

---

### 3️⃣ Pengujian

✅ **Sensor Ultrasonik**  
- Dekatkan objek < 5 cm → status jadi *Habis*.
- Cek Serial Monitor (baud 115200).

✅ **Notifikasi Telegram**  
- Saat pakan habis, bot mengirim:
⚠️ Pakan ayam hampir habis! Segera isi ulang.
- Cooldown default: 1 jam.

✅ **Dashboard Web**
- Lihat status: *Habis/Penuh*, jarak, status relay.
- Gunakan tombol *NYALAKAN* / *MATIKAN* relay.

✅ **MQTT**
- Pastikan ESP32 publish ke:
- `pakan/status`
- `pakan/jarak`
- `pakan/relay`
- Dashboard subscribe & kontrol ke `pakan/relay/control`.

---

## 🐞 Debugging

- Jika notif Telegram gagal:
- Cek Serial Monitor:
  ```
  📏 Jarak: 1.87 cm
  📤 Status pakan: Habis
  ⚠️ Pakan habis terdeteksi!
  ℹ️ Mencoba kirim notif...
  ✅ Notifikasi terkirim ke Telegram
  ```
- Pastikan:
  - WiFi terhubung
  - BOT_TOKEN & CHAT_ID valid
  - Tes manual:  
    ```
    https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?chat_id=<YOUR_CHAT_ID>&text=Test
    ```
- Jika cooldown aktif:
- Turunkan `notifCooldown` jadi `10000` (10 detik) untuk tes.
- Jika jarak selalu -1:
- Cek wiring HC-SR04.
- Pastikan sensor dapat 5V.

---

## ⚠️ Catatan

- Wokwi tidak support HTTP (Telegram). Gunakan ESP32 fisik.
- MQTT Broker: `broker.hivemq.com:1883` (pastikan port 1883 tidak diblokir).
- Pastikan library:
- `WiFi`
- `HTTPClient`
- `PubSubClient`
sudah terinstall di Arduino IDE.

---

## 🤝 Kontribusi

- Fork repo & pull request untuk perbaikan/fitur baru.
- Laporkan bug via issue.

---

## 📄 Lisensi

Proyek ini menggunakan **MIT License**.

---

> ✨ *IoT sederhana, bikin ayam tetap kenyang, dan pemiliknya tetap santai!* 😎
