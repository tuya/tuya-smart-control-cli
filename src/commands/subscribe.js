import chalk from 'chalk';
import WebSocket from 'ws';
import { getApiKey, resolveWsUri } from '../config.js';
import { printError, printInfo } from '../utils/output.js';

const FATAL_CLOSE_CODES = new Set([1002, 1003, 1008, 1011]);

function formatTimestamp(tsMs) {
  try {
    return new Date(tsMs).toISOString().replace('T', ' ').replace('Z', '');
  } catch {
    return String(tsMs);
  }
}

function formatValue(code, value) {
  const boolCodes = new Set(['led_switch', 'switch_led', 'switch', 'doorcontact_state']);
  if (boolCodes.has(code)) {
    if (code === 'doorcontact_state') {
      return value ? chalk.yellow('open') : chalk.green('closed');
    }
    return value ? chalk.green('on') : chalk.red('off');
  }
  if (typeof value === 'boolean') {
    return value ? chalk.green('true') : chalk.red('false');
  }
  return String(value);
}

function isErrorFrame(data) {
  if (data.error) return true;
  if (data.errorCode && data.errorCode !== 'SUCCESS') return true;
  if (data.errorMsg) return true;
  if (data.success === false) return true;
  return false;
}

function connect(uri, apiKey, { deviceIds, eventType, json }) {
  const filterDevices = deviceIds ? new Set(deviceIds) : null;

  const ws = new WebSocket(uri, { headers: { Authorization: apiKey } });

  ws.on('open', () => {
    if (!json) {
      printInfo(`Connected to ${chalk.cyan(uri)}`);
      console.log(chalk.gray('  Listening for device events... Press Ctrl+C to stop.\n'));
    }
  });

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (isErrorFrame(data)) {
      printError(`Server error: ${JSON.stringify(data)}`);
      ws.close(1000, 'Received error');
      return;
    }

    const evt = data.eventType;
    const payload = data.data || {};
    const devId = payload.devId;

    // Apply device filter
    if (filterDevices && !filterDevices.has(devId)) return;

    // Apply event type filter
    if (eventType === 'property' && evt !== 'devicePropertyChange') return;
    if (eventType === 'status' && evt !== 'onlineStatusChange') return;

    if (json) {
      console.log(JSON.stringify(data));
      return;
    }

    if (evt === 'devicePropertyChange') {
      const statusList = payload.status || [];
      for (const prop of statusList) {
        const t = formatTimestamp(prop.time);
        const val = formatValue(prop.code, prop.value);
        console.log(
          chalk.gray(`[${t}]`) + ' ' +
          chalk.cyan('property') + ' ' +
          chalk.bold(devId) + ' ' +
          `${prop.code} = ${val}`
        );
      }
    } else if (evt === 'onlineStatusChange') {
      const t = formatTimestamp(payload.time);
      const badge = payload.status === 'online'
        ? chalk.green('● online')
        : chalk.gray('○ offline');
      console.log(
        chalk.gray(`[${t}]`) + ' ' +
        chalk.yellow('status') + '   ' +
        chalk.bold(devId) + ' ' +
        badge
      );
    }
  });

  ws.on('close', (code, reason) => {
    const reasonStr = reason ? reason.toString() : '';
    if (FATAL_CLOSE_CODES.has(code)) {
      printError(`Fatal close (code=${code}${reasonStr ? `, reason=${reasonStr}` : ''}). Stopping.`);
      process.exit(1);
    }
    if (!json) {
      printInfo(`Connection lost (code=${code}). Reconnecting...`);
    }
    setTimeout(() => connect(uri, apiKey, { deviceIds, eventType, json }), 2000);
  });

  ws.on('error', (err) => {
    if (!json) {
      printError(`WebSocket error: ${err.message}`);
    }
  });

  // Graceful shutdown
  const cleanup = () => {
    if (!json) {
      console.log(chalk.gray('\n  Disconnecting...'));
    }
    ws.close(1000, 'Client stopped');
    setTimeout(() => process.exit(0), 500);
  };
  process.removeAllListeners('SIGINT');
  process.on('SIGINT', cleanup);
}

export function registerSubscribeCommand(program) {
  program
    .command('subscribe')
    .description('Subscribe to real-time device events via WebSocket')
    .option('-d, --device <id...>', 'Filter by device ID(s)')
    .option('-e, --event <type>', 'Event type: all, property, status', 'all')
    .option('--json', 'Output events as raw JSON (one per line)')
    .action((opts) => {
      const apiKey = getApiKey();
      if (!apiKey) {
        printError(
          'Not authenticated. Run "tuya init" to configure your API key, ' +
          'or set the TUYA_API_KEY environment variable.'
        );
        process.exit(1);
      }

      const uri = resolveWsUri(apiKey);
      if (!uri) {
        printError(
          'Cannot determine WebSocket URI from API key prefix. ' +
          'Ensure your API key starts with a valid region prefix (e.g. sk-AY...).'
        );
        process.exit(1);
      }

      const validEvents = ['all', 'property', 'status'];
      if (!validEvents.includes(opts.event)) {
        printError(`Invalid event type "${opts.event}". Choose from: ${validEvents.join(', ')}`);
        process.exit(1);
      }

      connect(uri, apiKey, {
        deviceIds: opts.device || null,
        eventType: opts.event,
        json: opts.json || false,
      });
    });
}
