import chalk from 'chalk';
import { createAPI } from '../api.js';
import { createTable, createSpinner, printError } from '../utils/output.js';

export function registerStatsCommand(program) {
  const stats = program
    .command('stats')
    .description('Data statistics');

  stats
    .command('config')
    .description('Query statistics configuration for all devices')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      const spinner = createSpinner('Fetching statistics config...').start();
      try {
        const api = createAPI();
        const result = await api.getStatsConfig();
        spinner.stop();

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        if (!result || (Array.isArray(result) && result.length === 0)) {
          console.log(chalk.gray('No statistics configuration found.'));
          return;
        }

        console.log(JSON.stringify(result, null, 2));
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  stats
    .command('data')
    .description('Query hourly statistics data')
    .argument('<device_id>', 'Device ID')
    .argument('<dp_code>', 'Data point code (e.g. ele_usage)')
    .argument('<type>', 'Statistic type: SUM, COUNT, MAX, MIN, MINUX')
    .argument('<start>', 'Start time (yyyyMMddHH)')
    .argument('<end>', 'End time (yyyyMMddHH, max 24h from start)')
    .option('--json', 'Output as JSON')
    .action(async (deviceId, dpCode, type, start, end, opts) => {
      const spinner = createSpinner('Fetching statistics...').start();
      try {
        const api = createAPI();
        const result = await api.getStatsData(deviceId, dpCode, type, start, end);
        spinner.stop();

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        if (!result || (Array.isArray(result) && result.length === 0)) {
          console.log(chalk.gray('No statistics data found.'));
          return;
        }

        if (Array.isArray(result)) {
          createTable(
            ['Time', 'Value'],
            result.map(item => [
              item.time || item.hour || '-',
              String(item.value ?? '-'),
            ])
          );
        } else {
          console.log(JSON.stringify(result, null, 2));
        }
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
