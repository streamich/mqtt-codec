const {MqttDecoder} = require('../../es6/MqttDecoder');
const {connectShort, publishSample} = require('../packets');

const parser = new MqttDecoder();
const max = 10e6;
let i;
const start = Date.now() / 1000;

for (i = 0; i < max; i++) {
  parser.push(Buffer.from(publishSample));
  while (parser.parse()) {}
}

const time = Date.now() / 1000 - start;
console.log('Total packets', max);
console.log('Total time', Math.round(time * 100) / 100);
console.log('Packets/s', (Math.round(max / time / 1e4) / 1e2) + 'M');
console.log('Memory used', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' Mb');
