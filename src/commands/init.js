import inquirer from 'inquirer';
import chalk from 'chalk';
import { saveConfig, loadConfig, resolveBaseUrl, getRegionName, PREFIX_TO_BASE_URL } from '../config.js';
import { printSuccess, printError, printInfo } from '../utils/output.js';

export function registerInitCommand(program) {
  program
    .command('init')
    .description('Configure Tuya API credentials')
    .action(async () => {
      const existing = loadConfig();

      console.log();
      console.log(chalk.bold('  Tuya Smart Control CLI Setup'));
      console.log(chalk.gray('  ─────────────────────────────'));
      console.log();

      if (existing.apiKey) {
        const masked = existing.apiKey.slice(0, 6) + '****' + existing.apiKey.slice(-4);
        printInfo(`Current API Key: ${chalk.yellow(masked)}`);
        console.log();
      }

      console.log(chalk.gray('  How to get your API Key:'));
      console.log(chalk.gray('  - China: https://tuyasmart.com/'));
      console.log(chalk.gray('  - International: https://tuya.ai/'));
      console.log();

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your Tuya API Key:',
          validate: (val) => {
            if (!val.trim()) return 'API Key is required';
            if (!val.startsWith('sk-')) return 'API Key should start with "sk-"';
            return true;
          },
        },
      ]);

      const apiKey = answers.apiKey.trim();
      const baseUrl = resolveBaseUrl(apiKey);

      if (!baseUrl) {
        const prefix = apiKey.slice(3, 5).toUpperCase();
        printError(`Unknown API key prefix "${prefix}".`);
        console.log();
        console.log('Supported prefixes:');
        Object.entries(PREFIX_TO_BASE_URL).forEach(([p, url]) => {
          console.log(`  ${chalk.cyan(p)} → ${getRegionName(p)} (${url})`);
        });
        console.log();

        const { customUrl } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customUrl',
            message: 'Enter base URL manually:',
            validate: (val) => val.trim() ? true : 'Base URL is required',
          },
        ]);
        saveConfig({ apiKey, baseUrl: customUrl.trim() });
      } else {
        const prefix = apiKey.slice(3, 5).toUpperCase();
        const region = getRegionName(prefix);
        saveConfig({ apiKey, baseUrl });
        console.log();
        printInfo(`Region detected: ${chalk.cyan(region)} (${baseUrl})`);
      }

      console.log();
      printSuccess('Configuration saved! You can now use Tuya CLI.');
      console.log();
      console.log(chalk.gray('  Try these commands:'));
      console.log(chalk.gray('  $ tuya home list'));
      console.log(chalk.gray('  $ tuya device list'));
      console.log();
    });
}
