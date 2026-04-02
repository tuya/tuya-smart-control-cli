# Tuya Smart Control CLI

[English](README.md) | 中文

Tuya Smart Control 官方命令行工具 -- 在终端中管理你的智能家居设备。

基于涂鸦 2C 终端用户 API 构建，支持 3,000+ 智能硬件品类，覆盖全球 200+ 国家和地区。

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- 涂鸦 API Key（[中国区](https://tuyasmart.com/) | [国际区](https://tuya.ai/)）

### 安装

```bash
git clone https://github.com/tuya/tuya-smart-control-cli.git
cd tuya-smart-control-cli
npm install
npm link
```

执行 `npm link` 后，即可在终端全局使用 `tuya` 命令。

### 配置

```bash
# 交互式配置（推荐）
tuya init

# 或直接设置环境变量
export TUYA_API_KEY="sk-AYxxxxxxxxxxxx"
```

运行 `tuya init` 会引导你输入 API Key，系统根据 Key 前缀自动识别区域和服务地址：

| 前缀 | 区域 | 服务地址 |
|------|------|----------|
| `sk-AY...` | 中国 | `https://openapi.tuyacn.com` |
| `sk-AZ...` | 美西 | `https://openapi.tuyaus.com` |
| `sk-EU...` | 中欧 | `https://openapi.tuyaeu.com` |
| `sk-IN...` | 印度 | `https://openapi.tuyain.com` |
| `sk-UE...` | 美东 | `https://openapi-ueaz.tuyaus.com` |
| `sk-WE...` | 西欧 | `https://openapi-weaz.tuyaeu.com` |
| `sk-SG...` | 新加坡 | `https://openapi-sg.iotbing.com` |

### 验证

```bash
tuya doctor
```

检查配置和 API 连通性：

```
  Tuya CLI Doctor
  ───────────────

  ✔ Config file: /Users/you/.tuya-cli/config.json
  ✔ API Key: sk-AY****xxxx (from config file)
  ✔ Base URL: https://openapi.tuyacn.com (China)
  ✔ API connection: OK (2 home(s) found)
```

## 命令参考

### 概览

```
tuya <command> [subcommand] [options]

命令:
  init                           配置 API 凭证
  doctor                         检查配置和连通性
  home                           家庭与空间管理
  device                         设备查询与管理
  weather <lat> <lon>            查询天气信息
  notify                         发送通知（仅限自发自收）
  stats                          数据统计
  ipc                            IPC 摄像头云端抓拍

全局选项:
  -V, --version                  显示版本号
  -h, --help                     显示帮助信息
```

> 所有查询命令均支持 `--json` 选项，输出原始 JSON 数据，便于脚本集成。

---

### `tuya home` -- 家庭管理

```bash
# 列出所有家庭
tuya home list

# 列出指定家庭下的房间
tuya home rooms <home_id>
```

**示例：**

```bash
$ tuya home list
┌─────────┬──────────────────┬───────┬──────────────────┐
│ Home ID │ Name             │ Role  │ Location         │
├─────────┼──────────────────┼───────┼──────────────────┤
│ 123456  │ 我的公寓          │ admin │ 30.3, 120.07     │
│ 789012  │ 海边别墅          │ owner │ -                │
└─────────┴──────────────────┴───────┴──────────────────┘

$ tuya home rooms 123456
┌─────────┬──────────────┐
│ Room ID │ Name         │
├─────────┼──────────────┤
│ 111     │ 客厅          │
│ 222     │ 卧室          │
│ 333     │ 厨房          │
└─────────┴──────────────┘
```

---

### `tuya device` -- 设备管理

```bash
# 列出所有设备
tuya device list

# 按家庭或房间筛选
tuya device list --home <home_id>
tuya device list --room <room_id>

# 查看设备详情（包含当前属性状态）
tuya device detail <device_id>

# 查看设备物模型（支持的能力）
tuya device model <device_id>

# 控制设备
tuya device control <device_id> '<properties_json>'

# 重命名设备
tuya device rename <device_id> "<new_name>"
```

**示例 - 列出设备：**

```bash
$ tuya device list
Total: 3 device(s)

┌──────────────────────┬─────────────────────────┬──────────────┬───────────┐
│ Device ID            │ Name                    │ Category     │ Status    │
├──────────────────────┼─────────────────────────┼──────────────┼───────────┤
│ 0620068884f3eb414579 │ 客厅吸顶灯               │ 光源          │ ● online  │
│ 1830045562a1bc223456 │ 卧室空调                  │ 空调          │ ● online  │
│ 2940012345b6de789012 │ 智能插座                  │ 插座          │ ○ offline │
└──────────────────────┴─────────────────────────┴──────────────┴───────────┘
```

**示例 - 查看设备详情：**

```bash
$ tuya device detail 0620068884f3eb414579

  客厅吸顶灯
  ─────────────────────────────
  ID:        0620068884f3eb414579
  Category:  光源
  Product:   WiFi 智能灯
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

**示例 - 查看设备能力：**

```bash
$ tuya device model 0620068884f3eb414579

  Properties (2):
  ┌──────────────┬────────────┬────────┬───────┬───────────────────────┐
  │ Code         │ Name       │ Access │ Type  │ Spec                  │
  ├──────────────┼────────────┼────────┼───────┼───────────────────────┤
  │ switch_led   │ 开关        │ rw     │ bool  │ bool                  │
  │ bright_value │ 亮度        │ rw     │ value │ 10~1000 step:1        │
  └──────────────┴────────────┴────────┴───────┴───────────────────────┘
```

**示例 - 控制设备：**

```bash
# 开灯
tuya device control 0620068884f3eb414579 '{"switch_led":true}'

# 设置亮度为 500
tuya device control 0620068884f3eb414579 '{"bright_value":500}'

# 同时设置多个属性
tuya device control 0620068884f3eb414579 '{"switch_led":true,"bright_value":800}'

# 设置空调模式
tuya device control 1830045562a1bc223456 '{"mode":"cold","temp_set":26}'
```

---

### `tuya weather` -- 天气查询

```bash
tuya weather <纬度> <经度> [--codes <json_array>]
```

**示例：**

```bash
# 查询北京天气
tuya weather 39.90 116.40

# 查询指定天气属性
tuya weather 39.90 116.40 --codes '["w.temp","w.humidity"]'
```

---

### `tuya notify` -- 消息通知

所有通知均为**自发自收**（仅发送给当前登录用户）。

```bash
# 发送短信
tuya notify sms "您的设备已关闭"

# 发送语音电话
tuya notify voice "警报：检测到异常温度"

# 发送邮件
tuya notify mail "每日报告" "所有设备运行正常"

# 发送 App 推送
tuya notify push "安全提醒" "客厅检测到移动"
```

---

### `tuya stats` -- 数据统计

```bash
# 查看所有设备的统计配置
tuya stats config

# 查询小时粒度统计数据
tuya stats data <device_id> <dp_code> <statistic_type> <start_time> <end_time>
```

**参数说明：**

| 参数 | 说明 | 示例 |
|------|------|------|
| `dp_code` | 数据点编码 | `ele_usage` |
| `statistic_type` | 统计类型：`SUM`、`COUNT`、`MAX`、`MIN`、`MINUX` | `SUM` |
| `start_time` | 起始时间，格式 `yyyyMMddHH` | `2025033100` |
| `end_time` | 结束时间，格式 `yyyyMMddHH`（与起始时间最多间隔 24 小时） | `2025033123` |

**示例：**

```bash
tuya stats data 0620068884f3eb414579 ele_usage SUM 2025033100 2025033123
```

---

### `tuya ipc` -- IPC 摄像头云端抓拍

```bash
# 从摄像头拍摄快照
tuya ipc pic <device_id>

# 拍摄多张快照
tuya ipc pic <device_id> --count 3

# 不解密（获取原始预签名 URL）
tuya ipc pic <device_id> --no-consent

# 录制短视频（默认 10 秒）
tuya ipc video <device_id>

# 录制 5 秒视频
tuya ipc video <device_id> -d 5

# 指定家庭 ID
tuya ipc pic <device_id> --home <home_id>
```

**示例 - 拍摄快照：**

```bash
$ tuya ipc pic 6c95a7a3xxxxxxxxxxxx
✔ Snapshot captured
  Image URL:
  https://...decrypted-image-url...
  Message: ok
```

**示例 - 录制视频：**

```bash
$ tuya ipc video 6c95a7a3xxxxxxxxxxxx -d 5
✔ Video captured
  Video URL:
  https://...decrypted-video-url...
  Cover URL:
  https://...decrypted-cover-url...
  Message: ok
```

> 抓拍流程为异步操作：CLI 先分配抓拍任务，等待设备上传，然后轮询直到媒体 URL 就绪。快照轮询通常需要几秒；视频轮询时间取决于录制时长。

---

## 配置说明

### 配置文件

凭证存储在 `~/.tuya-cli/config.json`：

```json
{
  "apiKey": "sk-AYxxxxxxxxxxxx",
  "baseUrl": "https://openapi.tuyacn.com"
}
```

### 环境变量

环境变量优先级高于配置文件：

| 变量 | 说明 | 是否必填 |
|------|------|----------|
| `TUYA_API_KEY` | 涂鸦 API Key | 是（或通过 `tuya init` 配置） |
| `TUYA_BASE_URL` | 覆盖自动检测的服务地址 | 否 |

### 优先级顺序

1. 环境变量（`TUYA_API_KEY` / `TUYA_BASE_URL`）
2. 配置文件（`~/.tuya-cli/config.json`）

---

## JSON 输出

所有查询命令均支持 `--json` 参数，输出机器可读的 JSON 格式：

```bash
# 获取原始 JSON 用于脚本处理
tuya device list --json

# 通过 jq 管道处理
tuya device list --json | jq '.[].device_id'

# 保存到文件
tuya home list --json > homes.json
```

---

## 常见使用场景

### 场景一：发现并控制设备

```bash
# 第 1 步：查找设备
tuya device list

# 第 2 步：查看设备当前状态
tuya device detail <device_id>

# 第 3 步：查看设备支持的能力
tuya device model <device_id>

# 第 4 步：发送控制指令
tuya device control <device_id> '{"switch_led":true}'
```

### 场景二：按房间控制设备

```bash
# 列出家庭 -> 获取 home_id
tuya home list

# 列出房间 -> 获取 room_id
tuya home rooms <home_id>

# 列出该房间的设备
tuya device list --room <room_id>

# 控制目标设备
tuya device control <device_id> '{"switch":true}'
```

### 场景三：监控能耗数据

```bash
# 查看可用的统计配置
tuya stats config

# 查询今日用电量
tuya stats data <device_id> ele_usage SUM 2025033100 2025033123
```

### 场景四：IPC 摄像头抓拍

```bash
# 拍摄快照
tuya ipc pic <device_id>

# 录制 5 秒视频
tuya ipc video <device_id> -d 5

# 获取原始 JSON 用于后续处理
tuya ipc pic <device_id> --json
```

---

## 支持的控制类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `bool` | 开关切换 | `{"switch_led": true}` |
| `enum` | 模式选择 | `{"mode": "cold"}` |
| `value` | 数值调节 | `{"bright_value": 500}` |
| `string` | 字符串值 | `{"display_text": "Hello"}` |

> 不支持的操作：门锁控制、实时视频流、图片操作、固件升级、设备配网/移除。这些操作请使用涂鸦 App。注意：云端截图/短视频录制已通过 `tuya ipc` 支持。

---

## 故障排查

### `tuya doctor` 报告问题

| 问题 | 解决方案 |
|------|----------|
| API Key 未配置 | 运行 `tuya init` |
| 认证失败（code 1010） | API Key 已过期，从 [tuya.ai](https://tuya.ai/) 重新获取 |
| URI 路径无效（code 1108） | 检查服务地址是否与账号注册区域匹配 |
| 网络错误 | 检查网络连接和防火墙设置 |

### 常见错误码

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 1010 | Token 无效 | 重新运行 `tuya init` 配置新的 API Key |
| 1108 | URI 路径无效 | 确认服务地址与账号区域匹配 |
| 40000901 | 设备不存在 | 检查设备 ID 是否正确 |
| 40000903 | 设备物模型不存在 | 该设备可能不支持物模型查询 |

### 获取帮助

- GitHub Issues：[tuya/tuya-openclaw-skills](https://github.com/tuya/tuya-openclaw-skills)
- 涂鸦开发者文档：[https://developer.tuya.com](https://developer.tuya.com)

---

## 项目结构

```
tuya-smart-control-cli/
├── bin/tuya.js              # CLI 入口
├── package.json             # npm 包配置
├── src/
│   ├── index.js             # 主程序，注册所有命令
│   ├── api.js               # 涂鸦 API 客户端（REST）
│   ├── config.js            # 配置管理（~/.tuya-cli/）
│   ├── commands/
│   │   ├── init.js          # 交互式 API Key 配置
│   │   ├── home.js          # 家庭与房间管理
│   │   ├── device.js        # 设备查询 / 控制 / 重命名
│   │   ├── weather.js       # 天气查询
│   │   ├── notify.js        # 短信 / 语音 / 邮件 / 推送
│   │   ├── stats.js         # 数据统计
│   │   ├── ipc.js           # IPC 摄像头云端抓拍
│   │   └── doctor.js        # 诊断与连通性检查
│   └── utils/
│       └── output.js        # 表格 / 颜色 / 加载动画
```

## 开源协议

MIT
