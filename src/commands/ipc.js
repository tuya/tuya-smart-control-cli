import chalk from 'chalk';
import { createAPI } from '../api.js';
import { createSpinner, printSuccess, printError } from '../utils/output.js';

export function registerIpcCommand(program) {
  const ipc = program
    .command('ipc')
    .description('IPC camera cloud capture');

  ipc
    .command('pic')
    .description('Capture a snapshot from an IPC camera')
    .argument('<device_id>', 'Device ID')
    .option('--consent', 'Request decrypted playable URL (default: true)', true)
    .option('--no-consent', 'Request raw presigned URL instead')
    .option('--count <number>', 'Number of snapshots (1-5)', parseInt)
    .option('--home <home_id>', 'Home ID')
    .option('--json', 'Output as JSON')
    .action(async (deviceId, opts) => {
      const spinner = createSpinner('Capturing snapshot...').start();
      try {
        const api = createAPI();
        const result = await api.ipcPicAllocateAndFetch(deviceId, {
          userPrivacyConsentAccepted: opts.consent,
          picCount: opts.count,
          homeId: opts.home,
        });
        spinner.stop();

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        const resolve = result.resolve;
        if (resolve?.status === 'NOT_READY') {
          printError('Capture timed out. The device may still be uploading — try again later.');
          process.exit(1);
        }

        printSuccess('Snapshot captured');
        const url = resolve?.decrypt_image_url || resolve?.raw_presigned_image_url;
        if (url) {
          console.log(chalk.gray('  Image URL:'));
          console.log(`  ${url}`);
        }
        if (resolve?.message_for_user) {
          console.log(chalk.gray(`  Message: ${resolve.message_for_user}`));
        }
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  ipc
    .command('video')
    .description('Record a short video from an IPC camera')
    .argument('<device_id>', 'Device ID')
    .option('-d, --duration <seconds>', 'Video duration in seconds (1-60, default 10)', parseInt, 10)
    .option('--consent', 'Request decrypted playable URL (default: true)', true)
    .option('--no-consent', 'Request raw presigned URL instead')
    .option('--home <home_id>', 'Home ID')
    .option('--json', 'Output as JSON')
    .action(async (deviceId, opts) => {
      const spinner = createSpinner(`Recording ${opts.duration}s video...`).start();
      try {
        const api = createAPI();
        const result = await api.ipcVideoAllocateAndFetch(deviceId, {
          videoDurationSeconds: opts.duration,
          userPrivacyConsentAccepted: opts.consent,
          homeId: opts.home,
        });
        spinner.stop();

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        const resolve = result.resolve;
        if (resolve?.status === 'NOT_READY') {
          printError('Capture timed out. The device may still be uploading — try again later.');
          process.exit(1);
        }

        printSuccess('Video captured');
        const videoUrl = resolve?.decrypt_video_url || resolve?.raw_presigned_video_url;
        const coverUrl = resolve?.decrypt_cover_image_url || resolve?.raw_presigned_cover_image_url;
        if (videoUrl) {
          console.log(chalk.gray('  Video URL:'));
          console.log(`  ${videoUrl}`);
        }
        if (coverUrl) {
          console.log(chalk.gray('  Cover URL:'));
          console.log(`  ${coverUrl}`);
        }
        if (resolve?.message_for_user) {
          console.log(chalk.gray(`  Message: ${resolve.message_for_user}`));
        }
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
