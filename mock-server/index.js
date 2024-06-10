const fetch = require('node-fetch');
const readline = require('readline');

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  authorization: 'Bearer me7fSDxdYjM6KChN66a0X1Kn8pskPYn7',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = prompt => new Promise(resolve => rl.question(prompt, resolve));

const sendNotification = async () => {
  const title =
    (await question(
      'Enter the title of the notification (default: GitHub Push Event): ',
    )) || 'GitHub Push Event';
  const priority =
    (await question(
      'Enter the priority of the notification[high, normal, low] (default: high): ',
    )) || 'high';
  const message =
    (await question(
      'Enter the message of the notification (default: A new commit has been pushed to the repository): ',
    )) || 'A new commit has been pushed to the repository';
  const origin =
    (await question(
      'Enter the origin of the notification (default: GitHub): ',
    )) || 'GitHub';
  const user =
    (await question(
      'Enter the user of the notification (default: user:development/guest): ',
    )) || 'user:development/guest';

  console.log('Calling API');
  fetch('http://localhost:7007/api/notifications/', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title,
      priority,
      message,
      origin,
      user,
    }),
  }).then(async res => {
    console.log('Response', res.status);
    if (
      res.headers.get('content-length') > '0' &&
      res.headers.get('content-type')?.includes('application/json')
    ) {
      const jsonResponse = await res.json();
      console.log('Response Body:', jsonResponse);
    }
    rl.close();
  });
};

sendNotification();
