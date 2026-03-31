import chalk from 'chalk';
import { createAPI } from '../api.js';
import {
  createTable, createSpinner, printSuccess, printError,
  statusBadge, formatDeviceRow,
} from '../utils/output.js';

export function registerDeviceCommand(program) {
  const device = program
    .command('device')
    .description('Device query and management');

  device
    .command('list')
    .description('List all devices')
    .option('--home <home_id>', 'Filter by home ID')
    .option('--room <room_id>', 'Filter by room ID')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      const spinner = createSpinner('Fetching devices...').start();
      try {
        const api = createAPI();
        let result;
        if (opts.room) {
          result = await api.getRoomDevices(opts.room);
        } else if (opts.home) {
          result = await api.getHomeDevices(opts.home);
        } else {
          result = await api.getAllDevices();
        }
        spinner.stop();
        const devices = result?.devices || [];

        if (opts.json) {
          console.log(JSON.stringify(devices, null, 2));
          return;
        }

        if (devices.length === 0) {
          console.log(chalk.gray('No devices found.'));
          return;
        }

        console.log(chalk.gray(`Total: ${devices.length} device(s)`));
        console.log();
        createTable(
          ['Device ID', 'Name', 'Category', 'Status'],
          devices.map(formatDeviceRow)
        );
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  device
    .command('detail')
    .description('Get device detail')
    .argument('<device_id>', 'Device ID')
    .option('--json', 'Output as JSON')
    .action(async (deviceId, opts) => {
      const spinner = createSpinner('Fetching device detail...').start();
      try {
        const api = createAPI();
        const result = await api.getDeviceDetail(deviceId);
        spinner.stop();

        if (!result) {
          printError('Device not found.');
          process.exit(1);
        }

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log();
        console.log(chalk.bold(`  ${result.name || 'Unknown Device'}`));
        console.log(chalk.gray('  ─────────────────────────────'));
        console.log(`  ID:        ${result.device_id}`);
        console.log(`  Category:  ${result.category_name || result.category || '-'}`);
        console.log(`  Product:   ${result.product_name || '-'}`);
        console.log(`  Status:    ${statusBadge(result.online)}`);
        console.log(`  Firmware:  ${result.firmware_version || '-'}${result.firmware_update_available ? chalk.yellow(' (update available)') : ''}`);

        if (result.properties && Object.keys(result.properties).length > 0) {
          console.log();
          console.log(chalk.bold('  Properties:'));
          createTable(
            ['Code', 'Value'],
            Object.entries(result.properties).map(([k, v]) => [
              k,
              typeof v === 'boolean'
                ? (v ? chalk.green('true') : chalk.red('false'))
                : String(v),
            ])
          );
        }
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  device
    .command('model')
    .description('Get device Thing Model (capabilities)')
    .argument('<device_id>', 'Device ID')
    .option('--json', 'Output as JSON')
    .action(async (deviceId, opts) => {
      const spinner = createSpinner('Fetching device model...').start();
      try {
        const api = createAPI();
        const result = await api.getDeviceModel(deviceId);
        spinner.stop();

        const model = typeof result?.model === 'string'
          ? JSON.parse(result.model)
          : result?.model;

        if (opts.json) {
          console.log(JSON.stringify(model, null, 2));
          return;
        }

        if (!model?.services?.length) {
          console.log(chalk.gray('No model data found.'));
          return;
        }

        for (const service of model.services) {
          const props = service.properties || [];
          if (props.length === 0) continue;

          console.log();
          console.log(chalk.bold(`  Properties (${props.length}):`));
          createTable(
            ['Code', 'Name', 'Access', 'Type', 'Spec'],
            props.map(p => {
              const spec = p.typeSpec || {};
              let specStr = spec.type || '-';
              if (spec.type === 'value') {
                specStr = `${spec.min}~${spec.max} step:${spec.step}${spec.unit ? ' ' + spec.unit : ''}`;
              } else if (spec.type === 'enum' && spec.range) {
                specStr = spec.range.join(' | ');
              }
              return [
                p.code,
                p.name || '-',
                p.accessMode || '-',
                chalk.cyan(spec.type || '-'),
                specStr,
              ];
            })
          );
        }
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  device
    .command('control')
    .description('Control a device by issuing properties')
    .argument('<device_id>', 'Device ID')
    .argument('<properties>', 'Properties JSON, e.g. \'{"switch_led":true}\'')
    .action(async (deviceId, propertiesStr) => {
      let properties;
      try {
        properties = JSON.parse(propertiesStr);
      } catch {
        printError('Invalid JSON for properties. Example: \'{"switch_led":true}\'');
        process.exit(1);
      }

      const spinner = createSpinner('Sending command...').start();
      try {
        const api = createAPI();
        await api.issueProperties(deviceId, properties);
        spinner.stop();
        printSuccess(`Command sent to device ${deviceId}`);
        console.log(chalk.gray(`  Properties: ${JSON.stringify(properties)}`));
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  device
    .command('rename')
    .description('Rename a device')
    .argument('<device_id>', 'Device ID')
    .argument('<name>', 'New device name')
    .action(async (deviceId, name) => {
      const spinner = createSpinner('Renaming device...').start();
      try {
        const api = createAPI();
        await api.renameDevice(deviceId, name);
        spinner.stop();
        printSuccess(`Device ${deviceId} renamed to "${name}"`);
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
