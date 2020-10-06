const Benchmark = require('benchmark');
const {PacketPublish} = require('../es6/packets/publish');

const versions = [
  require('../es6/packets/publish/encodePublish/v1').encodePublish,
  require('../es6/packets/publish/encodePublish/v2').encodePublish,
  require('../es6/packets/publish/encodePublish/v3').encodePublish,
];

const props = {
  propsNone: {},
  propsOnlyNumbers: {
    '2': 120, // MessageExpiryInterval
    '25': 1, // RequestResponseInformation
    '35': 123, // TopicAlias
    '11': 245555, // SubscriptionIdentifier
    '33': 20000, // ReceiveMaximum
    '37': 100, // RetainAvailable  
  },
  propsWithStrings: {
    '2': 120, // MessageExpiryInterval
    '25': 1, // RequestResponseInformation
    '35': 123, // TopicAlias
    '11': 245555, // SubscriptionIdentifier
    '33': 20000, // ReceiveMaximum
    '37': 100, // RetainAvailable
    '8': 'europe/germany/munich/sensors/temperature/room-32/termostats/#', // ResponseTopic
    '9': Buffer.from('xcxcxcxc-xcxc-xcxc-xcxc-xcxcxcxcxcxc', 'utf8'), // CorrelationData
    '38': [ // UserProperty
      [ 'Authorization', '=LAIJGORlkJMA9833LK2-LFDl:ADF83-03239234LKFJLDSLSD' ],
      [ 'Ip-Address', '0.0.0.0' ],
      [ 'Cache', 'no-cache' ],
    ],
  },
};

const suite = new Benchmark.Suite;
const buf = Buffer.from('{"foo": "bar"}');

const run = (encodePublish, p) => {
  const packet = PacketPublish.create('test', 0, p, buf);
  encodePublish(packet, 5);
};

for (const name in props) {
  const p = props[name];
  for (let i = 0; i < versions.length; i++) {
    const version = versions[i];
    suite
      .add(`encodePublish v${i + 1} (${name})`, function() {
        run(version, p);
      })
  }
}

suite
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
