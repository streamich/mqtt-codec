const Benchmark = require('benchmark');
const {genVarInt: v1} = require('../es6/util/genVarInt/v1');
const {genVarInt: v2} = require('../es6/util/genVarInt/v2');
const {genVarInt: v3} = require('../es6/util/genVarInt/v3');
const {genVarInt: v4} = require('../es6/util/genVarInt/v4');
const {genVarInt: v5} = require('../es6/util/genVarInt/v5');
const {parseVarInt} = require('../es6/util/parse');

const max = 5e6;
const suite = new Benchmark.Suite;
const run = (genVarInt) => {
  for (let i = 0; i < max; i += 11) {
    if (i !== parseVarInt(genVarInt(i), 0)[0])
      throw Error('Invalid parsing');
  }
};

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
