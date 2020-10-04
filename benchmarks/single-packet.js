const Benchmark = require('benchmark');
const {packets} = require('./packets');
const {MqttDecoder} = require('../es6/MqttDecoder');
const mqtt = require('mqtt-packet');

const suite = new Benchmark.Suite;

for (const name of Object.keys(packets)) {
  suite
    .add(`mqtt-codec (${name})`, function() {
      const decoder = new MqttDecoder();
      decoder.push(Buffer.from(packets[name]));
      decoder.parse();
    })
    .add(`mqtt-packet (${name})`, function() {
      const parser = mqtt.parser();
      parser.parse(Buffer.from(packets[name]));
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
