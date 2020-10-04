const Benchmark = require('benchmark');
const packets = require('./packets');
const {MqttDecoder} = require('../es6/MqttDecoder');
const mqtt = require('mqtt-packet');

const suite = new Benchmark.Suite;

suite
  .add(`mqtt-codec`, function() {
    const decoder = new MqttDecoder();
    for (const name of Object.keys(packets)) {
      decoder.push(Buffer.from(packets[name]));
      let packet;
      while (packet = decoder.parse()) {}
    }
  })
  .add(`mqtt-packet`, function() {
    const parser = mqtt.parser();
    for (const name of Object.keys(packets)) {
      parser.parse(Buffer.from(packets[name]));
    }
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
