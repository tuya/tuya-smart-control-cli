# Tuya Smart Control CLI

English | [中文](README_zh.md)

The official command-line tool for [Tuya Smart Control](https://www.tuya.com/) -- manage your smart home devices directly from the terminal.

Built on Tuya's 2C end-user APIs, supporting 3,000+ smart hardware categories across 200+ countries and regions.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- A Tuya API Key ([China](https://tuyasmart.com/) | [International](https://tuya.ai/))

### Installation

```bash
git clone https://github.com/tuya/tuya-smart-control-cli.git
cd tuya-smart-control-cli
npm install
npm link
```

After `npm link`, the `tuya` command will be available globally in your terminal.

### Setup

```bash
# Interactive configuration (recommended)
tuya init

# Or set environment variable directly
export TUYA_API_KEY="sk-AYxxxxxxxxxxxx"
```

Running `tuya init` will guide you through entering your API Key. The region and base URL are auto-detected from the key prefix:

| Prefix | Region | Base URL |
|--------|--------|----------|
| `sk-AY...` | China | `https://openapi.tuyacn.com` |
| `sk-AZ...` | US West | `https://openapi.tuyaus.com` |
| `sk-EU...` | Central Europe | `https://openapi.tuyaeu.com` |
| `sk-IN...` | India | `https://openapi.tuyain.com` |
| `sk-UE...` | US East | `https://openapi-ueaz.tuyaus.com` |
| `sk-WE...` | Western Europe | `https://openapi-weaz.tuyaeu.com` |
| `sk-SG...` | Singapore | `https://openapi-sg.iotbing.com` |

### Verify

```bash
tuya doctor
```

This checks your configuration and API connectivity:

```
  Tuya CLI Doctor
  ───────────────

  ✔ Config file: /Users/you/.tuya-cli/config.json
  ✔ API Key: sk-AY****xxxx (from config file)
  ✔ Base URL: https://openapi.tuyacn.com (China)
  ✔ API connection: OK (2 home(s) found)
```

## Commands

### Overview

```
tuya <command> [subcommand] [options]

Commands:
  init                           Configure API credentials
  doctor                         Check configuration and connectivity
  home                           Home and space management
  device                         Device query and management
  weather <lat> <lon>            Query weather information
  notify                         Send notifications (self-send)
  stats                          Data statistics

Global Options:
  -V, --version                  Show version number
  -h, --help                     Show help
```

> All query commands support the `--json` option for raw JSON output, which is useful for scripting and piping.

---

### `tuya home` -- Home Management

```bash
# List all homes
tuya home list

# List rooms in a specific home
tuya home rooms <home_id>
```

**Example:**

```bash
$ tuya home list
┌─────────┬──────────────────┬───────┬──────────────────┐
│ Home ID │ Name             │ Role  │ Location         │
├─────────┼──────────────────┼───────┼──────────────────┤
│ 123456  │ My Apartment     │ admin │ 30.3, 120.07     │
│ 789012  │ Beach House      │ owner │ -                │
└─────────┴──────────────────┴───────┴──────────────────┘

$ tuya home rooms 123456
┌─────────┬──────────────┐
│ Room ID │ Name         │
├─────────┼──────────────┤
│ 111     │ Living Room  │
│ 222     │ Bedroom      │
│ 333     │ Kitchen      │
└─────────┴──────────────┘
```

---

### `tuya device` -- Device Management

```bash
# List all devices
tuya device list

# Filter by home or room
tuya device list --home <home_id>
tuya device list --room <room_id>

# View device detail (including current property states)
tuya device detail <device_id>

# View device Thing Model (supported capabilities)
tuya device model <device_id>

# Control a device
tuya device control <device_id> '<properties_json>'

# Rename a device
tuya device rename <device_id> "<new_name>"
```

**Example - List devices:**

```bash
$ tuya device list
Total: 3 device(s)

┌──────────────────────┬─────────────────────────┬──────────────┬───────────┐
│ Device ID            │ Name                    │ Category     │ Status    │
├──────────────────────┼─────────────────────────┼──────────────┼───────────┤
│ 0620068884f3eb414579 │ Living Room Light       │ Light Source │ ● online  │
│ 1830045562a1bc223456 │ Bedroom AC              │ Air Conditi… │ ● online  │
│ 2940012345b6de789012 │ Smart Plug              │ Plug        │ ○ offline │
└──────────────────────┴─────────────────────────┴──────────────┴───────────┘
```

**Example - View device detail:**

```bash
$ tuya device detail 0620068884f3eb414579

  Living Room Light
  ─────────────────────────────
  ID:        0620068884f3eb414579
  Category:  Light Source
  Product:   WiFi Smart Light
  Status:    ● online
  Firmware:  1.0.0

  Properties:
  ┌──────────────┬─────────┐
  │ Code         │ Value   │
  ├──────────────┼─────────┤
  │ switch_led   │ true    │
  │ bright_value │ 100     │
  │ work_mode    │ colour  │
  └──────────────┴─────────┘
```

**Example - View device capabilities:**

```bash
$ tuya device model 0620068884f3eb414579

  Properties (2):
  ┌──────────────┬────────────┬────────┬───────┬───────────────────────┐
  │ Code         │ Name       │ Access │ Type  │ Spec                  │
  ├──────────────┼────────────┼────────┼───────┼───────────────────────┤
  │ switch_led   │ Switch     │ rw     │ bool  │ bool                  │
  │ bright_value │ Brightness │ rw     │ value │ 10~1000 step:1        │
  └──────────────┴────────────┴────────┴───────┴───────────────────────┘
```

**Example - Control a device:**

```bash
# Turn on a light
tuya device control 0620068884f3eb414579 '{"switch_led":true}'

# Set brightness to 500
tuya device control 0620068884f3eb414579 '{"bright_value":500}'

# Set multiple properties at once
tuya device control 0620068884f3eb414579 '{"switch_led":true,"bright_value":800}'

# Set AC mode
tuya device control 1830045562a1bc223456 '{"mode":"cold","temp_set":26}'
```

---

### `tuya weather` -- Weather Query

```bash
tuya weather <latitude> <longitude> [--codes <json_array>]
```

**Example:**

```bash
# Query weather for Beijing
tuya weather 39.90 116.40

# Query specific weather attributes
tuya weather 39.90 116.40 --codes '["w.temp","w.humidity"]'
```

---

### `tuya notify` -- Notifications

All notifications are **self-send only** (sent to the current logged-in user).

```bash
# Send SMS
tuya notify sms "Your device has been turned off"

# Send voice call
tuya notify voice "Alert: abnormal temperature detected"

# Send email
tuya notify mail "Daily Report" "All devices are running normally"

# Send app push notification
tuya notify push "Security Alert" "Motion detected in living room"
```

---

### `tuya stats` -- Data Statistics

```bash
# View statistics configuration for all devices
tuya stats config

# Query hourly statistics data
tuya stats data <device_id> <dp_code> <statistic_type> <start_time> <end_time>
```

**Parameters:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `dp_code` | Data point code | `ele_usage` |
| `statistic_type` | `SUM`, `COUNT`, `MAX`, `MIN`, `MINUX` | `SUM` |
| `start_time` | Format: `yyyyMMddHH` | `2025033100` |
| `end_time` | Format: `yyyyMMddHH` (max 24h span) | `2025033123` |

**Example:**

```bash
tuya stats data 0620068884f3eb414579 ele_usage SUM 2025033100 2025033123
```

---

## Configuration

### Config File

Credentials are stored at `~/.tuya-cli/config.json`:

```json
{
  "apiKey": "sk-AYxxxxxxxxxxxx",
  "baseUrl": "https://openapi.tuyacn.com"
}
```

### Environment Variables

Environment variables take priority over the config file:

| Variable | Description | Required |
|----------|-------------|----------|
| `TUYA_API_KEY` | Your Tuya API Key | Yes (or use `tuya init`) |
| `TUYA_BASE_URL` | Override auto-detected base URL | No |

### Priority Order

1. Environment variable (`TUYA_API_KEY` / `TUYA_BASE_URL`)
2. Config file (`~/.tuya-cli/config.json`)

---

## JSON Output

All query commands support the `--json` flag for machine-readable output:

```bash
# Get raw JSON for scripting
tuya device list --json

# Pipe to jq for processing
tuya device list --json | jq '.[].device_id'

# Save to file
tuya home list --json > homes.json
```

---

## Common Workflows

### 1. Discover and Control a Device

```bash
# Step 1: Find your device
tuya device list

# Step 2: Check its current state
tuya device detail <device_id>

# Step 3: See what it can do
tuya device model <device_id>

# Step 4: Send a command
tuya device control <device_id> '{"switch_led":true}'
```

### 2. Control Devices by Room

```bash
# List homes -> find home_id
tuya home list

# List rooms -> find room_id
tuya home rooms <home_id>

# List devices in that room
tuya device list --room <room_id>

# Control the target device
tuya device control <device_id> '{"switch":true}'
```

### 3. Monitor Energy Usage

```bash
# Check available statistics
tuya stats config

# Query electricity usage for today
tuya stats data <device_id> ele_usage SUM 2025033100 2025033123
```

---

## Supported Control Types

| Type | Description | Example |
|------|-------------|---------|
| `bool` | On/Off toggle | `{"switch_led": true}` |
| `enum` | Mode selection | `{"mode": "cold"}` |
| `value` | Numeric value | `{"bright_value": 500}` |
| `string` | Text value | `{"display_text": "Hello"}` |

> Unsupported operations: lock control, video/camera, image operations, firmware upgrades, device pairing/removal. Use the Tuya App for these.

---

## Troubleshooting

### `tuya doctor` Reports Issues

| Issue | Solution |
|-------|----------|
| API Key not configured | Run `tuya init` |
| Authentication failed (code 1010) | API Key expired, get a new one from [tuya.ai](https://tuya.ai/) |
| URI path invalid (code 1108) | Check if base URL matches your account region |
| Network error | Check internet connection and firewall settings |

### Common Error Codes

| Code | Message | Action |
|------|---------|--------|
| 1010 | Token invalid | Re-run `tuya init` with a new API Key |
| 1108 | URI path invalid | Verify base URL matches your region |
| 40000901 | Device not found | Check device ID |
| 40000903 | Device model not found | Device may not support Thing Model |

### Need Help?

- GitHub Issues: [tuya/tuya-openclaw-skills](https://github.com/tuya/tuya-openclaw-skills)
- Tuya Developer Docs: [https://developer.tuya.com](https://developer.tuya.com)

---

## Project Structure

```
tuya-smart-control-cli/
├── bin/tuya.js              # CLI entry point
├── package.json             # npm package config
├── src/
│   ├── index.js             # Main program, registers all commands
│   ├── api.js               # Tuya API client (REST)
│   ├── config.js            # Config management (~/.tuya-cli/)
│   ├── commands/
│   │   ├── init.js          # Interactive API Key setup
│   │   ├── home.js          # Home & room management
│   │   ├── device.js        # Device query / control / rename
│   │   ├── weather.js       # Weather query
│   │   ├── notify.js        # SMS / voice / email / push
│   │   ├── stats.js         # Data statistics
│   │   └── doctor.js        # Diagnostics & connectivity check
│   └── utils/
│       └── output.js        # Table / color / spinner formatting
```

## License

[MIT](LICENSE)
