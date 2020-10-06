const Benchmark = require('benchmark');
const packets = require('./packets');
const {MqttDecoder} = require('../es6/MqttDecoder');
const mqtt = require('mqtt-packet');

const list = [
  packets.connectWithProperties,
  packets.connackWithProperties,
  packets.publishWithUserProperties,
  packets.publishWithRepeatingProperties,
  packets.publish2Kb,
  packets.pubAckSimple,
  packets.pubAckWithProperties,
  packets.pubrec,
  packets.pubrel,
  packets.pubcomp,
  packets.subscribe,
  packets.subscribeToThreeTopics,
  packets.suback,
  packets.unsubscribe,
  packets.unsuback,
  packets.pingreq,
  packets.pingresp,
];

const suite = new Benchmark.Suite;

suite
  .add(`mqtt-codec`, function() {
    const decoder = new MqttDecoder();
    for (const packet of list) {
      decoder.push(packet);
      while (decoder.parse()) {}
    }
  })
  .add(`mqtt-packet`, function() {
    const parser = mqtt.parser();
    for (const packet of list) {
      parser.parse(packet);
    }
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
