const Benchmark = require('benchmark');
const {genProps: v1} = require('../es6/util/genProps/v1');
const {genProps: v2} = require('../es6/util/genProps/v2');
const {genProps: v3} = require('../es6/util/genProps/v3');
const {genProps: v4} = require('../es6/util/genProps/v4');
const {genProps: v5} = require('../es6/util/genProps/v5');
const {parseProps} = require('../es6/util/parse');

const suite = new Benchmark.Suite;

const props = {
  '2': 120, // MessageExpiryInterval
  '25': 1, // RequestResponseInformation
  '35': 123, // TopicAlias
  '8': 'europe/germany/munich/sensors/temperature/room-32/termostats/#', // ResponseTopic
  '9': Buffer.from('xcxcxcxc-xcxc-xcxc-xcxc-xcxcxcxcxcxc', 'utf8'), // CorrelationData
  '11': 245555, // SubscriptionIdentifier
  '33': 20000, // ReceiveMaximum
  '37': 100, // RetainAvailable
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

run(v1);
run(v2);
run(v3);
run(v4);
run(v5);

suite
  .add(`genVarInt v1`, function() {
    run(v1);
  })
  .add(`genVarInt v2`, function() {
    run(v2);
  })
  .add(`genVarInt v3`, function() {
    run(v3);
  })
  .add(`genVarInt v4`, function() {
    run(v4);
  })
  .add(`genVarInt v5`, function() {
    run(v5);
  })

suite
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
