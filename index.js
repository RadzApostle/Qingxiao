import yargs from 'yargs';
import cfonts from 'cfonts';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { createInterface } from 'readline';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';

const { say } = cfonts;
const rl = createInterface(process.stdin, process.stdout);
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, author } = require(join(__dirname, './package.json'));

// ✦ Qingxiao Botz — Qingxiao Botz Banner
say('Qingxiao\n   Botz', {
  font: 'chrome',
  align: 'center',
  gradient: ['red', '#d4af37']
});

say(`'${name}' By @${author.name || author}`, {
  font: 'console',
  align: 'center',
  gradient: ['red', '#d4af37']
});

console.log('\n✦━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━✦');
console.log('      ✦  Qingxiao Botz v2.0.0  ✦   ');
console.log('         Qingxiao Botz      ');
console.log('    Navigator: RadzApostle            ');
console.log('✦━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━✦\n');

var isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;

  let args = [join(__dirname, file), ...process.argv.slice(2)];
  say([process.argv[0], ...args].join(' '), { font: 'console', align: 'center', gradient: ['red', '#d4af37'] });

  setupMaster({ exec: args[0], args: args.slice(1) });
  let p = fork();

  p.on('message', data => {
    console.log('[✦ RECEIVED]', data);
    switch (data) {
      case 'reset':
        p.kill();
        isRunning = false;
        start(file);
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
      default:
        console.warn('[⚠ UNRECOGNIZED MESSAGE]', data);
    }
  });

  p.on('exit', (_, code) => {
    isRunning = false;
    console.error('[✦] Exited with code:', code);
    if (code !== 0) {
      console.log('[✦ Restarting Qingxiao Botz...]');
      return start(file);
    }
    watchFile(args[0], () => {
      unwatchFile(args[0]);
      start(file);
    });
  });

  let opts = yargs(process.argv.slice(2)).exitProcess(false).parse();

  if (!opts['test']) {
    if (!rl.listenerCount()) {
      rl.on('line', line => {
        p.emit('message', line.trim());
      });
    }
  }
}

start('main.js');
