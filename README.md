# mqtt-codec

- Fast MQTT packet encoder/decoder for Node.js.
- `mqtt-codec` is 4-10x faster than `mqtt-packet` and uses less memory, see benchmarks below.
- Zero dependencies.
- TypeScript types included.

## Benchmarks

Before running benchmarks:

```
yarn
yarn build
```

Run main benchmark, which creates a single parser and runs various packet types through it.

```
node benchmarks/bench.js 
mqtt-codec x 55,148 ops/sec ±1.72% (90 runs sampled)
mqtt-packet x 10,535 ops/sec ±1.55% (92 runs sampled)
Fastest is mqtt-codec
```

Also, see a benchmark for different packet types, where a new parser is created per packet.

```
node benchmarks/single-packet.js 
mqtt-codec (connectWithProperties) x 433,533 ops/sec ±1.52% (94 runs sampled)
mqtt-packet (connectWithProperties) x 67,244 ops/sec ±1.47% (92 runs sampled)
mqtt-codec (connackWithProperties) x 519,865 ops/sec ±0.47% (94 runs sampled)
mqtt-packet (connackWithProperties) x 75,237 ops/sec ±1.42% (93 runs sampled)
mqtt-codec (auth) x 916,655 ops/sec ±1.52% (90 runs sampled)
mqtt-packet (auth) x 165,637 ops/sec ±1.56% (89 runs sampled)
mqtt-codec (publishWithUserProperties) x 436,541 ops/sec ±1.07% (90 runs sampled)
mqtt-packet (publishWithUserProperties) x 94,829 ops/sec ±1.40% (91 runs sampled)
mqtt-codec (publishWithRepeatingProperties) x 617,063 ops/sec ±1.31% (91 runs sampled)
mqtt-packet (publishWithRepeatingProperties) x 108,080 ops/sec ±1.64% (88 runs sampled)
mqtt-codec (publish2Kb) x 2,559,234 ops/sec ±0.64% (92 runs sampled)
mqtt-packet (publish2Kb) x 433,540 ops/sec ±0.93% (92 runs sampled)
mqtt-codec (pubAckSimple) x 7,401,898 ops/sec ±1.76% (92 runs sampled)
mqtt-packet (pubAckSimple) x 595,741 ops/sec ±0.55% (92 runs sampled)
mqtt-codec (pubAckWithProperties) x 1,111,076 ops/sec ±1.49% (90 runs sampled)
mqtt-packet (pubAckWithProperties) x 192,213 ops/sec ±1.58% (91 runs sampled)
mqtt-codec (pubrec) x 1,116,782 ops/sec ±1.11% (93 runs sampled)
mqtt-packet (pubrec) x 190,068 ops/sec ±2.35% (92 runs sampled)
mqtt-codec (pubrel) x 1,096,460 ops/sec ±0.71% (93 runs sampled)
mqtt-packet (pubrel) x 190,440 ops/sec ±2.01% (88 runs sampled)
mqtt-codec (pubcomp) x 1,117,027 ops/sec ±0.69% (89 runs sampled)
mqtt-packet (pubcomp) x 192,141 ops/sec ±1.48% (94 runs sampled)
mqtt-codec (subscribe) x 848,616 ops/sec ±1.88% (92 runs sampled)
mqtt-packet (subscribe) x 181,918 ops/sec ±1.45% (93 runs sampled)
mqtt-codec (subscribeToThreeTopics) x 667,723 ops/sec ±0.38% (96 runs sampled)
mqtt-packet (subscribeToThreeTopics) x 154,597 ops/sec ±2.33% (93 runs sampled)
mqtt-codec (suback) x 1,035,238 ops/sec ±0.33% (90 runs sampled)
mqtt-packet (suback) x 174,194 ops/sec ±1.61% (94 runs sampled)
mqtt-codec (unsubscribe) x 897,074 ops/sec ±1.70% (89 runs sampled)
mqtt-packet (unsubscribe) x 193,405 ops/sec ±1.72% (90 runs sampled)
mqtt-codec (unsuback) x 1,038,542 ops/sec ±1.47% (88 runs sampled)
mqtt-packet (unsuback) x 184,793 ops/sec ±1.48% (89 runs sampled)
mqtt-codec (pingreq) x 5,141,397 ops/sec ±0.53% (91 runs sampled)
mqtt-packet (pingreq) x 763,094 ops/sec ±2.49% (90 runs sampled)
mqtt-codec (pingresp) x 5,186,830 ops/sec ±0.60% (90 runs sampled)
mqtt-packet (pingresp) x 764,774 ops/sec ±2.35% (88 runs sampled)
mqtt-codec (disconnect) x 870,228 ops/sec ±0.51% (93 runs sampled)
mqtt-packet (disconnect) x 161,623 ops/sec ±1.26% (92 runs sampled)
Fastest is mqtt-codec (pubAckSimple)
```

You can also run micro-benchmarks to see memory consumption:

```
node benchmarks/micro/mqtt-codec.js 
Total packets 10000000
Total time 3.61
Packets/s 2.77M
Memory used 5.43 Mb

node benchmarks/micro/mqtt-packet.js 
Total packets 10000000
Total time 20.41
Packets/s 0.49M
Memory used 8.89 Mb
```

## License

[MIT © Vadim Dalecky](LICENSE).
