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

Main benchmark, which creates a single parser and runs few packets through it:

```
node benchmarks/decoding.js 
mqtt-codec x 57,063 ops/sec ±1.03% (89 runs sampled)
mqtt-packet x 10,892 ops/sec ±1.86% (89 runs sampled)
Fastest is mqtt-codec
```

Decoding:

```
node benchmarks/decoding-packets.js 
mqtt-codec (connectWithProperties) x 422,167 ops/sec ±1.29% (92 runs sampled)
mqtt-packet (connectWithProperties) x 64,735 ops/sec ±1.33% (90 runs sampled)
mqtt-codec (connackWithProperties) x 498,563 ops/sec ±0.64% (93 runs sampled)
mqtt-packet (connackWithProperties) x 71,227 ops/sec ±1.56% (90 runs sampled)
mqtt-codec (auth) x 871,222 ops/sec ±1.61% (90 runs sampled)
mqtt-packet (auth) x 157,774 ops/sec ±1.81% (94 runs sampled)
mqtt-codec (publishWithUserProperties) x 417,126 ops/sec ±0.69% (93 runs sampled)
mqtt-packet (publishWithUserProperties) x 89,971 ops/sec ±1.47% (90 runs sampled)
mqtt-codec (publishWithRepeatingProperties) x 585,985 ops/sec ±0.76% (93 runs sampled)
mqtt-packet (publishWithRepeatingProperties) x 102,290 ops/sec ±1.42% (93 runs sampled)
mqtt-codec (publish2Kb) x 2,412,971 ops/sec ±1.31% (92 runs sampled)
mqtt-packet (publish2Kb) x 425,121 ops/sec ±0.55% (95 runs sampled)
mqtt-codec (pubAckSimple) x 6,806,617 ops/sec ±1.66% (95 runs sampled)
mqtt-packet (pubAckSimple) x 541,045 ops/sec ±0.39% (87 runs sampled)
mqtt-codec (pubAckWithProperties) x 1,023,191 ops/sec ±0.36% (89 runs sampled)
mqtt-packet (pubAckWithProperties) x 182,081 ops/sec ±2.83% (83 runs sampled)
mqtt-codec (pubrec) x 1,045,032 ops/sec ±0.38% (93 runs sampled)
mqtt-packet (pubrec) x 186,531 ops/sec ±2.25% (83 runs sampled)
mqtt-codec (pubrel) x 1,058,224 ops/sec ±0.39% (95 runs sampled)
mqtt-packet (pubrel) x 192,915 ops/sec ±1.54% (92 runs sampled)
mqtt-codec (pubcomp) x 1,055,261 ops/sec ±1.38% (93 runs sampled)
mqtt-packet (pubcomp) x 194,942 ops/sec ±1.72% (90 runs sampled)
mqtt-codec (subscribe) x 835,892 ops/sec ±1.43% (93 runs sampled)
mqtt-packet (subscribe) x 186,288 ops/sec ±1.44% (91 runs sampled)
mqtt-codec (subscribeToThreeTopics) x 653,509 ops/sec ±0.49% (95 runs sampled)
mqtt-packet (subscribeToThreeTopics) x 159,826 ops/sec ±2.11% (95 runs sampled)
mqtt-codec (suback) x 1,002,423 ops/sec ±1.10% (95 runs sampled)
mqtt-packet (suback) x 174,678 ops/sec ±1.90% (90 runs sampled)
mqtt-codec (unsubscribe) x 876,241 ops/sec ±1.31% (93 runs sampled)
mqtt-packet (unsubscribe) x 199,523 ops/sec ±1.69% (92 runs sampled)
mqtt-codec (unsuback) x 1,006,423 ops/sec ±1.44% (94 runs sampled)
mqtt-packet (unsuback) x 187,686 ops/sec ±1.59% (90 runs sampled)
mqtt-codec (pingreq) x 5,023,004 ops/sec ±0.45% (94 runs sampled)
mqtt-packet (pingreq) x 721,513 ops/sec ±2.40% (92 runs sampled)
mqtt-codec (pingresp) x 4,824,193 ops/sec ±0.49% (97 runs sampled)
mqtt-packet (pingresp) x 726,262 ops/sec ±2.14% (91 runs sampled)
mqtt-codec (disconnect) x 847,186 ops/sec ±0.62% (95 runs sampled)
mqtt-packet (disconnect) x 162,225 ops/sec ±1.77% (85 runs sampled)
Fastest is mqtt-codec (pubAckSimple)
```

Encoding:

```
node benchmarks/encoding-packets.js 
mqtt-codec (connectWithProperties) x 340,320 ops/sec ±1.03% (89 runs sampled)
mqtt-packet (connectWithProperties) x 78,694 ops/sec ±0.65% (91 runs sampled)
mqtt-codec (connackWithProperties) x 475,541 ops/sec ±0.80% (89 runs sampled)
mqtt-packet (connackWithProperties) x 85,971 ops/sec ±0.64% (90 runs sampled)
mqtt-codec (auth) x 761,170 ops/sec ±0.88% (91 runs sampled)
mqtt-packet (auth) x 220,458 ops/sec ±0.86% (92 runs sampled)
mqtt-codec (publishWithUserProperties) x 476,999 ops/sec ±0.97% (88 runs sampled)
mqtt-packet (publishWithUserProperties) x 113,824 ops/sec ±0.75% (90 runs sampled)
mqtt-codec (publishWithRepeatingProperties) x 592,074 ops/sec ±0.86% (89 runs sampled)
mqtt-packet (publishWithRepeatingProperties) x 123,382 ops/sec ±1.02% (91 runs sampled)
mqtt-codec (publish2Kb) x 603,189 ops/sec ±1.94% (79 runs sampled)
mqtt-packet (publish2Kb) x 552,224 ops/sec ±1.44% (84 runs sampled)
mqtt-codec (pubAckSimple) x 2,045,370 ops/sec ±0.46% (90 runs sampled)
mqtt-packet (pubAckSimple) x 1,323,745 ops/sec ±1.27% (93 runs sampled)
mqtt-codec (pubAckWithProperties) x 960,848 ops/sec ±0.60% (94 runs sampled)
mqtt-packet (pubAckWithProperties) x 288,869 ops/sec ±0.89% (95 runs sampled)
mqtt-codec (pubrec) x 952,284 ops/sec ±0.45% (93 runs sampled)
mqtt-packet (pubrec) x 283,084 ops/sec ±0.99% (93 runs sampled)
mqtt-codec (pubrel) x 950,473 ops/sec ±0.51% (92 runs sampled)
mqtt-packet (pubrel) x 285,300 ops/sec ±0.45% (96 runs sampled)
mqtt-codec (pubcomp) x 949,344 ops/sec ±0.54% (96 runs sampled)
mqtt-packet (pubcomp) x 289,744 ops/sec ±0.40% (96 runs sampled)
mqtt-codec (subscribe) x 856,080 ops/sec ±1.05% (87 runs sampled)
mqtt-packet (subscribe) x 253,906 ops/sec ±0.46% (95 runs sampled)
mqtt-codec (subscribeToThreeTopics) x 622,374 ops/sec ±0.57% (93 runs sampled)
mqtt-packet (subscribeToThreeTopics) x 198,086 ops/sec ±0.50% (93 runs sampled)
mqtt-codec (suback) x 935,755 ops/sec ±0.29% (95 runs sampled)
mqtt-packet (suback) x 293,072 ops/sec ±0.38% (95 runs sampled)
mqtt-codec (unsubscribe) x 763,717 ops/sec ±0.71% (92 runs sampled)
mqtt-packet (unsubscribe) x 290,084 ops/sec ±0.74% (95 runs sampled)
mqtt-codec (unsuback) x 938,670 ops/sec ±0.29% (93 runs sampled)
mqtt-packet (unsuback) x 289,862 ops/sec ±0.33% (96 runs sampled)
mqtt-codec (pingreq) x 130,346,933 ops/sec ±2.35% (84 runs sampled)
mqtt-packet (pingreq) x 3,694,792 ops/sec ±1.80% (93 runs sampled)
mqtt-codec (pingresp) x 943,508,360 ops/sec ±1.35% (87 runs sampled)
mqtt-packet (pingresp) x 3,612,333 ops/sec ±0.52% (93 runs sampled)
mqtt-codec (disconnect) x 812,689 ops/sec ±0.61% (95 runs sampled)
mqtt-packet (disconnect) x 217,743 ops/sec ±0.31% (96 runs sampled)
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
