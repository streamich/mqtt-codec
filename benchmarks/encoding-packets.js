const Benchmark = require('benchmark');
const packets = require('./packets');
const {MqttDecoder} = require('../es6/MqttDecoder');
const mqtt = require('mqtt-packet');

const suite = new Benchmark.Suite;

for (const name of Object.keys(packets)) {
  const decoder = new MqttDecoder();
  decoder.version = 5;
  decoder.push(packets[name]);
  const packet = decoder.parse();

  const parser = mqtt.parser({ protocolVersion: 5 });
  let packet2;
  parser.on('packet', p => packet2 = p)
  parser.parse(packets[name]);

  suite
    .add(`mqtt-codec (${name})`, function() {
      packet.toBuffer(5);
    })
    .add(`mqtt-packet (${name})`, function() {
      mqtt.generate(packet2, { protocolVersion: 5 });
    });
}

suite
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
