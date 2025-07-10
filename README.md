Sistem Pakan Ayam Otomatis dengan ESP32
Sistem ini adalah proyek IoT untuk memantau dan mengontrol pakan ayam menggunakan ESP32, sensor ultrasonik HC-SR04, relay, MQTT, dan notifikasi Telegram. Sistem ini memungkinkan pemantauan status pakan (Penuh/Habis), jarak pakan, dan kontrol relay melalui dashboard web, serta mengirim notifikasi Telegram saat pakan habis.
Fitur

Pemantauan Jarak Pakan: Menggunakan sensor HC-SR04 untuk mendeteksi jarak pakan (jarak < 5 cm = Habis, > 5 cm = Penuh).
Kontrol Relay: Mengaktifkan/menonaktifkan relay (motor) melalui dashboard web menggunakan MQTT.
Notifikasi Telegram: Mengirim notifikasi ke Telegram saat pakan habis (< 5 cm) dengan cooldown 1 jam untuk mencegah spam.
Dashboard Web: Menampilkan status pakan, jarak, status relay, dan log aktivitas secara real-time.
MQTT: Menggunakan broker HiveMQ untuk komunikasi antara ESP32 dan dashboard.

Komponen

Perangkat Keras:
ESP32
Sensor Ultrasonik HC-SR04 (Trig: pin 14, Echo: pin 27)
Relay (pin 26)


Perangkat Lunak:
Arduino IDE untuk pemrograman ESP32
MQTT.js untuk dashboard web
Broker MQTT: broker.hivemq.com:1883
API Telegram untuk notifikasi



Struktur File

pakan_ayam.ino: Kode untuk ESP32, menangani sensor, relay, MQTT, dan notifikasi Telegram.
index.html: File HTML untuk dashboard web.
main.js: Logika JavaScript untuk dashboard, termasuk koneksi MQTT dan pembaruan UI.
style.css: Styling untuk dashboard web.
README.md: Dokumentasi proyek ini.

Simulasi
Proyek ini dapat diuji menggunakan simulasi Wokwi:Simulasi Wokwi
Catatan: Simulasi Wokwi mungkin tidak mendukung permintaan HTTP ke Telegram karena keterbatasan lingkungan. Untuk pengujian notifikasi Telegram, gunakan perangkat ESP32 fisik dengan koneksi WiFi nyata.
Cara Penggunaan
1. Persiapan Perangkat Keras

Hubungkan sensor HC-SR04:
Trig: Pin 14
Echo: Pin 27
VCC: 5V
GND: GND


Hubungkan relay ke pin 26 (dan GND).
Pastikan ESP32 terhubung ke WiFi dengan kredensial yang benar.

2. Konfigurasi Perangkat Lunak

ESP32:
Buka pakan_ayam.ino di Arduino IDE.
Perbarui ssid dan password di kode dengan kredensial WiFi Anda.
Pastikan BOT_TOKEN dan CHAT_ID untuk Telegram valid:
Dapatkan BOT_TOKEN dari BotFather.
Dapatkan CHAT_ID dengan mengirim pesan ke bot dan menjalankan https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates.


Upload kode ke ESP32.


Dashboard Web:
Host file index.html, main.js, dan style.css di server web (misalnya, Firebase Hosting, Netlify, atau server lokal dengan Node.js).
Buka dashboard di browser untuk memantau dan mengontrol sistem.



3. Pengujian

Sensor Ultrasonik:
Dekatkan objek ke sensor (< 5 cm) untuk mensimulasikan status "Habis".
Periksa Serial Monitor (baud rate 115200) untuk output jarak dan status notifikasi.


Notifikasi Telegram:
Saat jarak < 5 cm, notifikasi "⚠️ Pakan ayam hampir habis! Segera isi ulang." akan dikirim ke Telegram (dengan cooldown 1 jam).
Pesan uji startup akan dikirim saat ESP32 menyala.


Dashboard:
Pastikan dashboard menampilkan status "Habis" atau "Penuh", jarak, dan status relay.
Gunakan tombol "NYALAKAN" dan "MATIKAN" untuk mengontrol relay.


MQTT:
Pastikan ESP32 terhubung ke broker.hivemq.com:1883 dan mempublikasikan ke topik pakan/status, pakan/jarak, dan pakan/relay.
Dashboard harus tersubscribe ke topik tersebut dan mengirim perintah ke pakan/perintah.



Debugging
Jika notifikasi Telegram tidak terkirim:

Periksa Serial Monitor untuk output seperti:📏 Jarak: 1.87 cm
📤 Status pakan diperbarui: Habis
⚠️ Pakan habis terdeteksi!
ℹ️ Mencoba mengirim notifikasi Telegram...
✅ Notifikasi terkirim ke Telegram: {"ok":true,...}


Jika melihat ❌ Gagal kirim notif, kode HTTP: <kode>, periksa:
Koneksi WiFi (❌ WiFi tidak terhubung).
BOT_TOKEN dan CHAT_ID (uji manual via browser: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?chat_id=<YOUR_CHAT_ID>&text=Test).


Jika notifikasi diblokir oleh cooldown:
Ubah notifCooldown ke 10000 (10 detik) untuk pengujian, lalu kembalikan ke 3600000 (1 jam) setelah berhasil.


Jika jarak tidak valid (-1 atau Tidak Valid):
Periksa koneksi sensor HC-SR04.
Pastikan daya 5V untuk sensor.



Catatan

Wokwi Limitation: Permintaan HTTP ke Telegram tidak didukung di Wokwi. Gunakan ESP32 fisik untuk menguji notifikasi.
MQTT Broker: Gunakan broker.hivemq.com:1883 untuk MQTT. Pastikan tidak ada firewall yang memblokir port 1883.
Kode Sumber: Kode dioptimalkan untuk ESP32 dengan library WiFi, HTTPClient, dan PubSubClient. Pastikan library ini terinstal di Arduino IDE.

Kontribusi
Silakan fork repositori ini dan buat pull request untuk perbaikan atau fitur tambahan. Laporkan bug melalui issue atau hubungi pengembang.
Lisensi
Proyek ini dilisensikan di bawah MIT License.
