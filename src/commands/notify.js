import { createAPI } from '../api.js';
import { createSpinner, printSuccess, printError } from '../utils/output.js';

export function registerNotifyCommand(program) {
  const notify = program
    .command('notify')
    .description('Send notifications (self-send only)');

  notify
    .command('sms')
    .description('Send SMS to current user')
    .argument('<message>', 'Message content')
    .action(async (message) => {
      const spinner = createSpinner('Sending SMS...').start();
      try {
        const api = createAPI();
        await api.sendSms(message);
        spinner.stop();
        printSuccess('SMS sent successfully.');
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  notify
    .command('voice')
    .description('Send voice call to current user')
    .argument('<message>', 'Message content')
    .action(async (message) => {
      const spinner = createSpinner('Sending voice call...').start();
      try {
        const api = createAPI();
        await api.sendVoice(message);
        spinner.stop();
        printSuccess('Voice call sent successfully.');
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  notify
    .command('mail')
    .description('Send email to current user')
    .argument('<subject>', 'Email subject')
    .argument('<content>', 'Email content')
    .action(async (subject, content) => {
      const spinner = createSpinner('Sending email...').start();
      try {
        const api = createAPI();
        await api.sendMail(subject, content);
        spinner.stop();
        printSuccess('Email sent successfully.');
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });

  notify
    .command('push')
    .description('Send app push notification to current user')
    .argument('<subject>', 'Notification subject')
    .argument('<content>', 'Notification content')
    .action(async (subject, content) => {
      const spinner = createSpinner('Sending push notification...').start();
      try {
        const api = createAPI();
        await api.sendPush(subject, content);
        spinner.stop();
        printSuccess('Push notification sent successfully.');
      } catch (err) {
        spinner.stop();
        printError(err.message);
        process.exit(1);
      }
    });
}
