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
mqtt-codec (connectWithProperties) x 407,904 ops/sec ±1.32% (89 runs sampled)
mqtt-packet (connectWithProperties) x 62,646 ops/sec ±1.31% (91 runs sampled)
mqtt-codec (connackWithProperties) x 370,507 ops/sec ±0.87% (92 runs sampled)
mqtt-packet (connackWithProperties) x 69,659 ops/sec ±1.24% (89 runs sampled)
mqtt-codec (auth) x 747,043 ops/sec ±1.14% (92 runs sampled)
mqtt-packet (auth) x 154,836 ops/sec ±1.69% (92 runs sampled)
mqtt-codec (publishWithUserProperties) x 352,991 ops/sec ±0.49% (95 runs sampled)
mqtt-packet (publishWithUserProperties) x 89,703 ops/sec ±1.75% (92 runs sampled)
mqtt-codec (publishWithRepeatingProperties) x 472,454 ops/sec ±1.16% (94 runs sampled)
mqtt-packet (publishWithRepeatingProperties) x 104,085 ops/sec ±1.39% (96 runs sampled)
mqtt-codec (publish2Kb) x 2,310,562 ops/sec ±1.09% (93 runs sampled)
mqtt-packet (publish2Kb) x 421,018 ops/sec ±0.55% (93 runs sampled)
mqtt-codec (pubAckSimple) x 9,116,739 ops/sec ±1.19% (94 runs sampled)
mqtt-packet (pubAckSimple) x 570,977 ops/sec ±0.98% (94 runs sampled)
mqtt-codec (pubAckWithProperties) x 951,472 ops/sec ±1.27% (93 runs sampled)
mqtt-packet (pubAckWithProperties) x 199,994 ops/sec ±1.34% (92 runs sampled)
mqtt-codec (pubrec) x 956,126 ops/sec ±0.43% (92 runs sampled)
mqtt-packet (pubrec) x 197,326 ops/sec ±2.29% (91 runs sampled)
mqtt-codec (pubrel) x 948,917 ops/sec ±0.48% (92 runs sampled)
mqtt-packet (pubrel) x 197,010 ops/sec ±2.12% (88 runs sampled)
mqtt-codec (pubcomp) x 949,589 ops/sec ±0.44% (95 runs sampled)
mqtt-packet (pubcomp) x 200,973 ops/sec ±1.66% (94 runs sampled)
mqtt-codec (subscribe) x 762,214 ops/sec ±1.44% (93 runs sampled)
mqtt-packet (subscribe) x 190,072 ops/sec ±1.56% (89 runs sampled)
mqtt-codec (subscribeToThreeTopics) x 568,597 ops/sec ±1.52% (91 runs sampled)
mqtt-packet (subscribeToThreeTopics) x 159,456 ops/sec ±1.66% (95 runs sampled)
mqtt-codec (suback) x 906,141 ops/sec ±0.34% (97 runs sampled)
mqtt-packet (suback) x 187,002 ops/sec ±2.26% (91 runs sampled)
mqtt-codec (unsubscribe) x 792,309 ops/sec ±0.39% (95 runs sampled)
mqtt-packet (unsubscribe) x 200,908 ops/sec ±1.67% (95 runs sampled)
mqtt-codec (unsuback) x 916,393 ops/sec ±1.48% (94 runs sampled)
mqtt-packet (unsuback) x 195,334 ops/sec ±1.53% (93 runs sampled)
mqtt-codec (pingreq) x 8,135,820 ops/sec ±1.33% (93 runs sampled)
mqtt-packet (pingreq) x 744,990 ops/sec ±0.58% (93 runs sampled)
mqtt-codec (pingresp) x 9,387,048 ops/sec ±1.57% (91 runs sampled)
mqtt-packet (pingresp) x 750,255 ops/sec ±1.08% (95 runs sampled)
mqtt-codec (disconnect) x 777,548 ops/sec ±0.45% (91 runs sampled)
mqtt-packet (disconnect) x 171,641 ops/sec ±2.17% (91 runs sampled)
Fastest is mqtt-codec (pingresp)
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
