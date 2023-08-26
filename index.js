const axios = require('axios');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const json = require('koa-json');
const Router = require('koa-router');
const ejs = require('ejs');
const fs = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');

const app = new Koa();
const router = new Router();
const urlsFilePath = 'urls.json';
let urls = [];

try {
  const urlsFileContent = fs.readFileSync(urlsFilePath);
  urls = JSON.parse(urlsFileContent);
} catch (error) {
  console.error(chalk.red(`Error reading URLs file: ${error}`));
}

const heartbeatInterval = 60 * 1000;
const downtimeThreshold = 60 * 60 * 1000;

let lastStatuses = {};
let deletionTimers = {};

const pingUrl = async (url) => {
  try {
    const res = await axios.get(url);
    if (res.status === 200) {
      if (!lastStatuses[url] || lastStatuses[url].status !== res.status) {
        console.log(chalk.green(`[ OK ] ${url} is working\nStatus code: ${res.status}\nHeartbeat: ${new Date().toISOString()}\n`));
      }
      lastStatuses[url] = {
        status: res.status,
        uptime: lastStatuses[url] ? lastStatuses[url].uptime + heartbeatInterval : heartbeatInterval,
        lastChecked: new Date().getTime()
      };

      if (deletionTimers[url]) {
        clearTimeout(deletionTimers[url]);
        delete deletionTimers[url];
      }
    } else {
      if (!lastStatuses[url] || lastStatuses[url].status !== res.status) {
        console.error(chalk.red(`[ERROR] ${url} returned status code ${res.status}`));
      }
      lastStatuses[url] = {
        status: res.status,
        uptime: lastStatuses[url] ? lastStatuses[url].uptime : 0,
        lastChecked: new Date().getTime()
      };

      if (!deletionTimers[url]) {
        deletionTimers[url] = setTimeout(() => {
          const index = urls.findIndex(u => u.url === url);
          if (index !== -1) {
            urls.splice(index, 1);
            fs.writeFileSync(urlsFilePath, JSON.stringify(urls));
            console.log(chalk.yellow(`[DELETED] ${url} has been deleted due to prolonged downtime.`));
            delete deletionTimers[url];
          }
        }, downtimeThreshold);
      }
    }
  } catch (error) {
    if (!lastStatuses[url] || lastStatuses[url].status !== null) {
      console.error(chalk.red(`[ERROR] ${url} could not be reached:\n${error}`));
    }
    lastStatuses[url] = {
      status: null,
      uptime: lastStatuses[url] ? lastStatuses[url].uptime : 0,
      lastChecked: new Date().getTime()
    };

    if (!deletionTimers[url]) {
      deletionTimers[url] = setTimeout(() => {
        const index = urls.findIndex(u => u.url === url);
        if (index !== -1) {
          urls.splice(index, 1);
          fs.writeFileSync(urlsFilePath, JSON.stringify(urls));
          console.log(chalk.yellow(`[DELETED] ${url} has been deleted due to prolonged downtime.`));
          delete deletionTimers[url];
        }
      }, downtimeThreshold);
    }
  }
};

router.get('/', async (ctx) => {
  const responseData = {
    message: 'Ping bot is up and running',
    urls: urls.map(url => {
      return {
        name: url.name,
        url: url.url,
        status: lastStatuses[url.url] ? lastStatuses[url.url].status : null,
        lastChecked: new Date().toISOString(),
        uptime: lastStatuses[url.url] ? lastStatuses[url.url].uptime / 1000 + ' seconds' : null
      }
    }),
    timestamp: new Date().toISOString(),
  };
  const html = await ejs.renderFile('index.ejs', responseData);
  ctx.body = html;
});

router.get('/api/ping', async (ctx) => {
  const { name, url } = ctx.request.query;

  if (!name || !url) {
    ctx.status = 400;
    ctx.body = { error: 'Both the "name" and "url" parameters are required.' };
    return;
  }

  if (name.includes(' ') || !isValidUrl(url)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid format for "name" or "url" parameter. Please ensure there are no spaces in the name and enter a valid URL.' };
    return;
  }

  const existingUrl = urls.find((u) => u.url === url);
  if (existingUrl) {
    ctx.status = 400;
    ctx.body = { error: 'The specified URL already exists in the monitored list.' };
    return;
  }

  const existingName = urls.find((u) => u.name === name);
  if (existingName) {
    ctx.status = 400;
    ctx.body = { error: 'The specified name already exists. Please choose another name.' };
    return;
  }

  urls.push({ name, url });
  fs.writeFileSync(urlsFilePath, JSON.stringify(urls));
  ctx.status = 200;
  ctx.body = { message: `The URL "${url}" has been added to the monitored list with the name "${name}"` };
});

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

const pingAllUrls = () => {
  urls.forEach((url) => pingUrl(url.url));
};

app
  .use(json())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

setInterval(pingAllUrls, 1000);
setInterval(pingAllUrls, heartbeatInterval);

app.listen(3000);
console.log(chalk.green('Server Start Time (Asia/Manila): ' + moment().tz('Asia/Manila').format('MM/DD/YY h:mm A')));
console.log(chalk.blue('===================================================='));
console.log(chalk.blue(' BotScope v2: Bot Performance Monitoring         '));
console.log(chalk.blue('===================================================='));
console.log(chalk.blue(' URLs being monitored:'));
console.log(chalk.blue('----------------------------------------------------'));
urls.forEach((url) => {
  console.log(chalk.blue(`${url.name.padEnd(10)} ${url.url.padEnd(30)}`));
});
console.log(chalk.blue('====================================================\n'));
console.log(chalk.blue('📋 Logs\n'));
