import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';

export function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

export function printSuccess(msg) {
  console.log(chalk.green('✔') + ' ' + msg);
}

export function printError(msg) {
  console.error(chalk.red('✖') + ' ' + msg);
}

export function printWarn(msg) {
  console.log(chalk.yellow('⚠') + ' ' + msg);
}

export function printInfo(msg) {
  console.log(chalk.blue('ℹ') + ' ' + msg);
}

export function createTable(head, rows) {
  const table = new Table({
    head: head.map(h => chalk.cyan.bold(h)),
    style: { head: [], border: [] },
    chars: {
      top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
      right: '│', 'right-mid': '┤', middle: '│',
    },
  });
  rows.forEach(row => table.push(row));
  console.log(table.toString());
}

export function createSpinner(text) {
  return ora({ text, color: 'cyan' });
}

export function statusBadge(online) {
  return online ? chalk.green('● online') : chalk.gray('○ offline');
}

export function formatDeviceRow(device) {
  return [
    device.device_id,
    device.name || '-',
    device.category_name || device.category || '-',
    statusBadge(device.online),
  ];
}
