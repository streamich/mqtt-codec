const Benchmark = require('benchmark');
const {parseProps} = require('../es6/util/parse');

const versions = {
  v1: require('../es6/util/genProps/v1').genProps,
  v2: require('../es6/util/genProps/v2').genProps,
  v3: require('../es6/util/genProps/v3').genProps,
  v4: require('../es6/util/genProps/v4').genProps,
  v5: require('../es6/util/genProps/v5').genProps,
  v6: require('../es6/util/genProps/v6').genProps,
  v7: require('../es6/util/genProps/v7').genProps,
  v8: require('../es6/util/genProps/v8').genProps,
  v9: require('../es6/util/genProps/v9').genProps,
  v10: require('../es6/util/genProps/v10').genProps, 
  v11: require('../es6/util/genProps/v11').genProps,
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
    [ 'Authorization', '=LAIJGORlkJMA9833LK2-LFDl:ADF83-03239234LKFJLDSLSD' ],
    [ 'Ip-Address', '0.0.0.0' ],
    [ 'Cache', 'no-cache' ],
  ],
};

const run = (genProps) => {
  const buf = genProps(props);
  const p = parseProps(buf, 0)[0];
  if (p['2'] !== 120) throw new Error('Props parsing failed');
};

for (const name in versions) {
  suite
    .add(`genProps (${name})`, function() {
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
