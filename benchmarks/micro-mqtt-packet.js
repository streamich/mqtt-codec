const mqtt = require('mqtt-packet');

const parser = mqtt.parser();
const max = 10e6;
let i;
const start = Date.now() / 1000;

for (i = 0; i < max; i++) {
  parser.parse(Buffer.from([
    48, 10, // Header (publish)
    0, 4, // Topic length
    116, 101, 115, 116, // Topic (test)
    116, 101, 115, 116 // Payload (test)
  ]))
}

const time = Date.now() / 1000 - start;
console.log('Total packets', max);
console.log('Total time', Math.round(time * 100) / 100);
console.log('Packets/s', (Math.round(max / time / 1e4) / 1e2) + 'M');
