const Benchmark = require('benchmark');
const packets = require('./packets');
const {PacketPublish} = require('../es6/packets');
const mqtt = require('mqtt-packet');

const payload = Buffer.from('{"currenttemp":25,"targettemp":23}');
const suite = new Benchmark.Suite;

suite
  .add(`mqtt-codec (publish)`, function() {
    PacketPublish.create(
      'europe/germany/berlin/appartments/934b/sensors/4/state',
      4000,
      {
        '3': 'application/json', // Content Type
        '38': [ // UserProperty
          'Trace', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          'Actor', 'user_johny',
        ],
      },
      payload,
    ).toBuffer(5);
  })
  .add(`mqtt-packet (publish)`, function() {
    mqtt.generate({
      cmd: 'publish',
      topic: 'europe/germany/berlin/appartments/934b/sensors/4/state',
      messageId: 4000,
      properties: {
        contentType: 'application/json', // Content Type
        userProperties: { // UserProperty
          'Trace': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          'Actor': 'user_johny',
        },
      },
      payload: payload,
    }, { protocolVersion: 5 });
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
