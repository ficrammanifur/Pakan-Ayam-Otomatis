// MQTT Configuration
const MQTT_BROKER = "wss://broker.hivemq.com:8884/mqtt"
const CLIENT_ID = "WebDashboard_" + Math.random().toString(16).substr(2, 8)

// Topics
const TOPICS = {
  STATUS: "pakan/status",
  JARAK: "pakan/jarak",
  RELAY: "pakan/relay",
  RELAY_CONTROL: "pakan/relay/control",
}

// Global variables
let mqttClient = null
let esp32LastSeen = null
let esp32Timeout = null

// DOM Elements
const elements = {
  connectionIndicator: document.getElementById("connectionIndicator"),
  connectionText: document.getElementById("connectionText"),
  esp32Status: document.getElementById("esp32Status"),
  lastSeen: document.getElementById("lastSeen"),
  pakanStatus: document.getElementById("pakanStatus"),
  pakanIcon: document.getElementById("pakanIcon"),
  jarakValue: document.getElementById("jarakValue"),
  jarakProgress: document.getElementById("jarakProgress"),
  relayStatus: document.getElementById("relayStatus"),
  btnRelayOn: document.getElementById("btnRelayOn"),
  btnRelayOff: document.getElementById("btnRelayOff"),
  logContainer: document.getElementById("logContainer"),
  btnClearLog: document.getElementById("btnClearLog"),
}

// Import MQTT library
const mqtt = require("mqtt")

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeMQTT()
  setupEventListeners()
  addLog("Dashboard dimulai...", "info")
})

// Setup event listeners
function setupEventListeners() {
  elements.btnRelayOn.addEventListener("click", () => controlRelay("ON"))
  elements.btnRelayOff.addEventListener("click", () => controlRelay("OFF"))
  elements.btnClearLog.addEventListener("click", clearLog)
}

// Initialize MQTT connection
function initializeMQTT() {
  addLog("Menghubungkan ke MQTT broker...", "info")

  try {
    mqttClient = mqtt.connect(MQTT_BROKER, {
      clientId: CLIENT_ID,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    })

    mqttClient.on("connect", onMQTTConnect)
    mqttClient.on("message", onMQTTMessage)
    mqttClient.on("error", onMQTTError)
    mqttClient.on("offline", onMQTTOffline)
    mqttClient.on("reconnect", onMQTTReconnect)
  } catch (error) {
    addLog("Error inisialisasi MQTT: " + error.message, "error")
    updateConnectionStatus(false)
  }
}

// MQTT event handlers
function onMQTTConnect() {
  addLog("✅ Terhubung ke MQTT broker", "success")
  updateConnectionStatus(true)

  // Subscribe to topics
  Object.values(TOPICS).forEach((topic) => {
    if (topic !== TOPICS.RELAY_CONTROL) {
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          addLog(`❌ Gagal subscribe ${topic}: ${err.message}`, "error")
        } else {
          addLog(`📡 Subscribe ${topic}`, "info")
        }
      })
    }
  })
}

function onMQTTMessage(topic, message) {
  const msg = message.toString()
  updateESP32Status()

  switch (topic) {
    case TOPICS.STATUS:
      updatePakanStatus(msg)
      addLog(`🌾 Status pakan: ${msg}`, "info")
      break

    case TOPICS.JARAK:
      updateJarakSensor(Number.parseFloat(msg))
      addLog(`📐 Jarak: ${msg} cm`, "info")
      break

    case TOPICS.RELAY:
      updateRelayStatus(msg)
      addLog(`⚡ Relay: ${msg}`, "info")
      break
  }
}

function onMQTTError(error) {
  addLog("❌ MQTT Error: " + error.message, "error")
  updateConnectionStatus(false)
}

function onMQTTOffline() {
  addLog("📡 MQTT Offline", "warning")
  updateConnectionStatus(false)
}

function onMQTTReconnect() {
  addLog("🔄 Mencoba reconnect MQTT...", "warning")
}

// Update functions
function updateConnectionStatus(connected) {
  if (connected) {
    elements.connectionIndicator.className = "status-indicator online"
    elements.connectionText.textContent = "Terhubung"
  } else {
    elements.connectionIndicator.className = "status-indicator offline"
    elements.connectionText.textContent = "Terputus"
    updateESP32Status(false)
  }
}

function updateESP32Status(active = true) {
  esp32LastSeen = new Date()

  if (active) {
    elements.esp32Status.className = "status-badge online"
    elements.esp32Status.textContent = "ONLINE"
    elements.lastSeen.textContent = formatTime(esp32LastSeen)

    // Reset timeout
    if (esp32Timeout) clearTimeout(esp32Timeout)
    esp32Timeout = setTimeout(() => {
      elements.esp32Status.className = "status-badge offline"
      elements.esp32Status.textContent = "OFFLINE"
      addLog("⚠️ ESP32 tidak merespons (timeout)", "warning")
    }, 10000) // 10 seconds timeout
  } else {
    elements.esp32Status.className = "status-badge offline"
    elements.esp32Status.textContent = "OFFLINE"
  }
}

function updatePakanStatus(status) {
  elements.pakanStatus.textContent = status

  if (status === "Penuh") {
    elements.pakanIcon.textContent = "✅"
    elements.pakanStatus.style.color = "#27ae60"
  } else if (status === "Habis") {
    elements.pakanIcon.textContent = "⚠️"
    elements.pakanStatus.style.color = "#e74c3c"
  } else {
    elements.pakanIcon.textContent = "❓"
    elements.pakanStatus.style.color = "#7f8c8d"
  }
}

function updateJarakSensor(jarak) {
  if (isNaN(jarak)) {
    elements.jarakValue.textContent = "-- cm"
    elements.jarakProgress.style.width = "0%"
    return
  }

  elements.jarakValue.textContent = jarak.toFixed(1) + " cm"

  // Update progress bar (assuming max distance is 30cm)
  const maxDistance = 30
  const percentage = Math.min((jarak / maxDistance) * 100, 100)
  elements.jarakProgress.style.width = percentage + "%"

  // Change color based on distance
  if (jarak < 5) {
    elements.jarakValue.style.color = "#e74c3c"
  } else if (jarak < 10) {
    elements.jarakValue.style.color = "#f39c12"
  } else {
    elements.jarakValue.style.color = "#27ae60"
  }
}

function updateRelayStatus(status) {
  elements.relayStatus.textContent = status

  if (status === "ON") {
    elements.relayStatus.style.color = "#27ae60"
    elements.btnRelayOn.disabled = true
    elements.btnRelayOff.disabled = false
  } else {
    elements.relayStatus.style.color = "#e74c3c"
    elements.btnRelayOn.disabled = false
    elements.btnRelayOff.disabled = true
  }
}

// Control functions
function controlRelay(command) {
  if (!mqttClient || !mqttClient.connected) {
    addLog("❌ Tidak terhubung ke MQTT", "error")
    return
  }

  mqttClient.publish(TOPICS.RELAY_CONTROL, command, (err) => {
    if (err) {
      addLog(`❌ Gagal kirim perintah ${command}: ${err.message}`, "error")
    } else {
      addLog(`📤 Perintah ${command} terkirim`, "success")
    }
  })
}

// Utility functions
function addLog(message, type = "info") {
  const logEntry = document.createElement("p")
  logEntry.className = `log-entry ${type}`
  logEntry.textContent = `[${formatTime(new Date())}] ${message}`

  elements.logContainer.appendChild(logEntry)
  elements.logContainer.scrollTop = elements.logContainer.scrollHeight

  // Keep only last 50 entries
  const entries = elements.logContainer.querySelectorAll(".log-entry")
  if (entries.length > 50) {
    entries[0].remove()
  }
}

function clearLog() {
  elements.logContainer.innerHTML = ""
  addLog("Log dibersihkan", "info")
}

function formatTime(date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// Auto-refresh last seen time
setInterval(() => {
  if (esp32LastSeen) {
    elements.lastSeen.textContent = formatTime(esp32LastSeen)
  }
}, 1000)
