const {PacketPublish} = require('../../../es6/packets/publish');

const max = 1e6;
let i;
const buf = Buffer.from('{"foo": "bar"}');

// initialize it
const packet = PacketPublish.create('test', 0, {}, buf);
packet.toBuffer();

const start = Date.now()

for (i = 0; i < max; i++) {
  const packet = PacketPublish.create('test', 0, {}, buf);
  packet.toBuffer();
}

const time = (Date.now() - start) / 1000;
console.log('Total packets', max);
console.log('Total time', Math.round(time * 100) / 100);
console.log('Packets/s', (Math.round(max / time / 1e4) / 1e2) + 'M');
console.log('Memory used', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' Mb');
