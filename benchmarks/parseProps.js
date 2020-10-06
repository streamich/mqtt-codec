const Benchmark = require('benchmark');
const {genProps} =  require('../es6/util/genProps');

const versions = {
  v1: require('../es6/util/parseProps/v1').parseProps,
  // v2: require('../es6/util/parseProps/v2').parseProps,
};

const suite = new Benchmark.Suite;

const props = {
  '2': 120, // MessageExpiryInterval
  '25': 1, // RequestResponseInformation
  '35': 123, // TopicAlias
  '11': 245555, // SubscriptionIdentifier
  '33': 20000, // ReceiveMaximum
  '37': 100, // RetainAvailable
  '8': 'europe/germany/munich/sensors/temperature/room-32/termostats/#', // ResponseTopic
  '9': Buffer.from('xcxcxcxc-xcxc-xcxc-xcxc-xcxcxcxcxcxc', 'utf8'), // CorrelationData
  '38': [ // UserProperty
    'Authorization', '=LAIJGORlkJMA9833LK2-LFDl:ADF83-03239234LKFJLDSLSD',
    'Ip-Address', '0.0.0.0',
    'Cache', 'no-cache',
  ],
};
const buf = genProps(props);

const run = (parseProps) => {
  const p = parseProps(buf, 0);
  // console.log(p);
};

// run(versions.v1);

for (const name in versions) {
  suite
    .add(`parseProps (${name})`, function() {
      run(versions[name]);
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
