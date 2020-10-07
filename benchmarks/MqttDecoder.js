const Benchmark = require('benchmark');
const packets = require('./packets');

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

const versions = {
  v1: require('../es6/MqttDecoder/v1').MqttDecoder,
  v2: require('../es6/MqttDecoder/v2').MqttDecoder,
};

const suite = new Benchmark.Suite;

for (const name in versions) {
  suite
    .add(`MqttDecoder (${name})`, function() {
      const decoder = new (versions[name])();
      decoder.version = 5;
      for (const packet of list) {
        decoder.push(packet);
        while (decoder.parse()) {}
      }
    })
}

suite
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
