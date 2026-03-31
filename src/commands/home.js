import chalk from 'chalk';
import { createAPI } from '../api.js';
import { createTable, createSpinner, printError } from '../utils/output.js';

export function registerHomeCommand(program) {
  const home = program
    .command('home')
    .description('Home and space management');

  home
    .command('list')
    .description('List all homes')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      const spinner = createSpinner('Fetching homes...').start();
      try {
        const api = createAPI();
        const result = await api.getHomes();
        spinner.stop();
        const homes = result?.homes || [];

        if (opts.json) {
          console.log(JSON.stringify(homes, null, 2));
          return;
        }

        if (homes.length === 0) {
          console.log(chalk.gray('No homes found.'));
          return;
        }

        createTable(
          ['Home ID', 'Name', 'Role', 'Location'],
          homes.map(h => [
            h.home_id,
            h.name || '-',
            h.role || '-',
            h.latitude?.Value && h.longitude?.Value
              ? `${h.latitude.Value}, ${h.longitude.Value}`
              : '-',
          ])
        );
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  home
    .command('rooms')
    .description('List rooms in a home')
    .argument('<home_id>', 'Home ID')
    .option('--json', 'Output as JSON')
    .action(async (homeId, opts) => {
      const spinner = createSpinner('Fetching rooms...').start();
      try {
        const api = createAPI();
        const result = await api.getRooms(homeId);
        spinner.stop();
        const rooms = result?.rooms || [];

        if (opts.json) {
          console.log(JSON.stringify(rooms, null, 2));
          return;
        }

        if (rooms.length === 0) {
          console.log(chalk.gray('No rooms found.'));
          return;
        }

        createTable(
          ['Room ID', 'Name'],
          rooms.map(r => [r.room_id, r.name || '-'])
        );
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
