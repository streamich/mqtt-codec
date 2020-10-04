# mqtt-codec

- MQTT packet encoder/decoder for Node.js.
- `mqtt-codec` is 4-10x faster than `mqtt-packet`, see benchmarks below.

## Benchmarks

Before running benchmarks:

```
yarn
yarn build
```

Run main benchmark, which creates a single parser and runs various packet types through it.

```
node benchmarks/bench
mqtt-codec x 205,297 ops/sec ±1.04% (89 runs sampled)
mqtt-packet x 45,193 ops/sec ±1.44% (90 runs sampled)
Fastest is mqtt-codec
```

Also, see a benchmark for different packet types, where a new parser is created per packet.

```
node benchmarks/single-packet
mqtt-codec (connectWithProperties) x 276,398 ops/sec ±3.20% (86 runs sampled)
mqtt-packet (connectWithProperties) x 63,837 ops/sec ±1.79% (90 runs sampled)
mqtt-codec (connectShort) x 2,372,761 ops/sec ±0.49% (95 runs sampled)
mqtt-packet (connectShort) x 373,148 ops/sec ±2.18% (92 runs sampled)
mqtt-codec (connackShort) x 6,186,152 ops/sec ±0.39% (96 runs sampled)
mqtt-packet (connackShort) x 601,883 ops/sec ±2.10% (93 runs sampled)
mqtt-codec (connackWithProperties) x 3,683,787 ops/sec ±1.19% (92 runs sampled)
mqtt-packet (connackWithProperties) x 551,864 ops/sec ±2.04% (93 runs sampled)
mqtt-codec (publishSample) x 2,125,866 ops/sec ±0.51% (96 runs sampled)
mqtt-packet (publishSample) x 514,211 ops/sec ±2.03% (92 runs sampled)
Fastest is mqtt-codec (connackShort)
```

## License

[MIT © Vadim Dalecky](LICENSE).
