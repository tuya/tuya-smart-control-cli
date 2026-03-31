import chalk from 'chalk';
import { createAPI } from '../api.js';
import { createTable, createSpinner, printError } from '../utils/output.js';

export function registerWeatherCommand(program) {
  program
    .command('weather')
    .description('Query weather information')
    .argument('<lat>', 'Latitude')
    .argument('<lon>', 'Longitude')
    .option('--codes <codes>', 'Weather attribute codes (JSON array)')
    .option('--json', 'Output as JSON')
    .action(async (lat, lon, opts) => {
      const spinner = createSpinner('Fetching weather...').start();
      try {
        const api = createAPI();
        const codes = opts.codes ? JSON.parse(opts.codes) : undefined;
        const result = await api.getWeather(lat, lon, codes);
        spinner.stop();

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        if (!result || (Array.isArray(result) && result.length === 0)) {
          console.log(chalk.gray('No weather data available.'));
          return;
        }

        // Weather result can vary in shape; display as table if it's an array of kv pairs
        if (Array.isArray(result)) {
          createTable(
            ['Code', 'Value', 'Unit'],
            result.map(item => [
              item.code || '-',
              String(item.value ?? '-'),
              item.unit || '-',
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
