import chalk from 'chalk';
import { getApiKey, getBaseUrl, loadConfig, CONFIG_FILE, resolveBaseUrl, getRegionName } from '../config.js';
import { printSuccess, printError, printInfo, createSpinner } from '../utils/output.js';

export function registerDoctorCommand(program) {
  program
    .command('doctor')
    .description('Check CLI configuration and connectivity')
    .action(async () => {
      console.log();
      console.log(chalk.bold('  Tuya CLI Doctor'));
      console.log(chalk.gray('  ───────────────'));
      console.log();

      // Check config file
      const config = loadConfig();
      if (config.apiKey) {
        printSuccess(`Config file: ${CONFIG_FILE}`);
      } else {
        printError(`Config file: not found or empty (${CONFIG_FILE})`);
      }

      // Check API key
      const apiKey = getApiKey();
      if (apiKey) {
        const source = process.env.TUYA_API_KEY ? 'env:TUYA_API_KEY' : 'config file';
        const masked = apiKey.slice(0, 6) + '****' + apiKey.slice(-4);
        printSuccess(`API Key: ${masked} (from ${source})`);
      } else {
        printError('API Key: not configured. Run "tuya init" to set up.');
        return;
      }

      // Check base URL
      const baseUrl = getBaseUrl();
      if (baseUrl) {
        const prefix = apiKey.slice(3, 5).toUpperCase();
        const region = getRegionName(prefix);
        printSuccess(`Base URL: ${baseUrl} (${region})`);
      } else {
        printError('Base URL: cannot be determined');
        return;
      }

      // Check connectivity
      const spinner = createSpinner('Testing API connectivity...').start();
      try {
        const resp = await fetch(`${baseUrl}/v1.0/end-user/homes/all`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        const data = await resp.json();
        spinner.stop();

        if (data.success) {
          const homeCount = data.result?.homes?.length || 0;
          printSuccess(`API connection: OK (${homeCount} home(s) found)`);
        } else {
          if (data.code === 1010) {
            printError('API connection: Authentication failed - API key may be expired');
          } else {
            printError(`API connection: Error [${data.code}] ${data.msg}`);
          }
        }
      } catch (err) {
        spinner.stop();
        printError(`API connection: Failed - ${err.message}`);
      }

      console.log();
    });
}
