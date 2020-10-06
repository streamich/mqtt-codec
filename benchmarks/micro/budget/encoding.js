const max = 10e6;
let i;
const buf = Buffer.from('{"foo": "bar"}');

const createPacket = () => {
  const topic = 'test';
  const buffer = Buffer.allocUnsafe(22);
  buffer.writeUInt8(0x30, 0);
  buffer.writeUInt8(0x14, 1);
  buffer.writeUInt16BE(4, 2);
  buffer.write(topic, 4);
  buf.copy(buffer, 8);
  return buffer;
};

// initialize it
createPacket();

const start = Date.now()

for (i = 0; i < max; i++) {
  createPacket();
}

const time = (Date.now() - start) / 1000;
console.log('Total packets', max);
console.log('Total time', Math.round(time * 100) / 100);
console.log('Packets/s', (Math.round(max / time / 1e4) / 1e2) + 'M');
console.log('Memory used', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' Mb');
