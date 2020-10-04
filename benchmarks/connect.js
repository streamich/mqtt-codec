const Benchmark = require('benchmark');
const {connectShort, connectWithProperties} = require('./packets');
const {MqttDecoder} = require('../es6/MqttDecoder');
const mqtt = require('mqtt-packet');

const decoder = new MqttDecoder();
const parser = mqtt.parser();

const suite = new Benchmark.Suite;
suite
  .add('mqtt-codec (CONNECT short)', function() {
    decoder.push(Buffer.from(connectShort));
    packet = decoder.parse();
  })
  .add('mqtt-codec (CONNECT long with properties)', function() {
    decoder.push(Buffer.from(connectWithProperties));
    packet = decoder.parse();
  })
  .add('mqtt-packet (CONNECT short)', function() {
    parser.parse(Buffer.from(connectShort));
  })
  .add('mqtt-packet (CONNECT long with properties)', function() {
    parser.parse(Buffer.from(connectWithProperties));
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
