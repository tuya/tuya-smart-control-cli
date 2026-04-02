import { Command } from 'commander';
import chalk from 'chalk';
import { registerInitCommand } from './commands/init.js';
import { registerHomeCommand } from './commands/home.js';
import { registerDeviceCommand } from './commands/device.js';
import { registerWeatherCommand } from './commands/weather.js';
import { registerNotifyCommand } from './commands/notify.js';
import { registerStatsCommand } from './commands/stats.js';
import { registerIpcCommand } from './commands/ipc.js';
import { registerDoctorCommand } from './commands/doctor.js';

const BANNER = `
  ${chalk.cyan.bold('Tuya Smart Control CLI')}
  ${chalk.gray('Manage your smart home devices from terminal')}
`;

const program = new Command();

program
  .name('tuya')
  .version('0.1.0')
  .description('The official CLI for Tuya Smart Control')
  .addHelpText('beforeAll', BANNER);

// Register all commands
registerInitCommand(program);
registerHomeCommand(program);
registerDeviceCommand(program);
registerWeatherCommand(program);
registerNotifyCommand(program);
registerStatsCommand(program);
registerIpcCommand(program);
registerDoctorCommand(program);

// Parse and execute
program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});
