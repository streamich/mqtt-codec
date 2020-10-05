const mqtt = require('mqtt-packet');

const max = 1e6;
let i;
const buf = Buffer.from('{"foo": "bar"}');

// initialize it
mqtt.generate({
  cmd: 'publish',
  topic: 'test',
  payload: buf,
})

const start = Date.now()

for (i = 0; i < max; i++) {
  mqtt.generate({
    cmd: 'publish',
    topic: 'test',
    payload: buf,
  })
}

const time = (Date.now() - start) / 1000;
console.log('Total packets', max);
console.log('Total time', Math.round(time * 100) / 100);
console.log('Packets/s', (Math.round(max / time / 1e4) / 1e2) + 'M');
console.log('Memory used', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' Mb');
