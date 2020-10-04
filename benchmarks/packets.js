
const bytes2kb = Buffer.allocUnsafe(2048);

const packets = {
  connectWithProperties: Buffer.from([
    16, 125, // Header
    0, 4, // Protocol ID length
    77, 81, 84, 84, // Protocol ID
    5, // Protocol version
    54, // Connect flags
    0, 30, // Keepalive
    47, // properties length
    17, 0, 0, 4, 210, // sessionExpiryInterval
    33, 1, 176, // receiveMaximum
    39, 0, 0, 0, 100, // maximumPacketSize
    34, 1, 200, // topicAliasMaximum
    25, 1, // requestResponseInformation
    23, 1, // requestProblemInformation,
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties,
    21, 0, 4, 116, 101, 115, 116, // authenticationMethod
    22, 0, 4, 1, 2, 3, 4, // authenticationData
    0, 4, // Client ID length
    116, 101, 115, 116, // Client ID
    47, // will properties
    24, 0, 0, 4, 210, // will delay interval
    1, 0, // payload format indicator
    2, 0, 0, 16, 225, // message expiry interval
    3, 0, 4, 116, 101, 115, 116, // content type
    8, 0, 5, 116, 111, 112, 105, 99, // response topic
    9, 0, 4, 1, 2, 3, 4, // corelation data
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // user properties
    0, 5, // Will topic length
    116, 111, 112, 105, 99, // Will topic
    0, 4, // Will payload length
    4, 3, 2, 1// Will payload
  ]),

  connackWithProperties: Buffer.from([
    32, 100, 0, 0,
    97, // properties length
    17, 0, 0, 4, 210, // sessionExpiryInterval
    33, 1, 176, // receiveMaximum
    36, 2, // Maximum qos
    37, 1, // retainAvailable
    39, 0, 0, 0, 100, // maximumPacketSize
    18, 0, 4, 116, 101, 115, 116, // assignedClientIdentifier
    34, 1, 200, // topicAliasMaximum
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116,
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    40, 1, // wildcardSubscriptionAvailable
    41, 1, // subscriptionIdentifiersAvailable
    42, 0, // sharedSubscriptionAvailable
    19, 4, 210, // serverKeepAlive
    26, 0, 4, 116, 101, 115, 116, // responseInformation
    28, 0, 4, 116, 101, 115, 116, // serverReference
    21, 0, 4, 116, 101, 115, 116, // authenticationMethod
    22, 0, 4, 1, 2, 3, 4 // authenticationData
  ]),

  auth: Buffer.from([
    240, 36, // Header
    0, // reason code
    34, // properties length
    21, 0, 4, 116, 101, 115, 116, // auth method
    22, 0, 4, 0, 1, 2, 3, // auth data
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
  ]),

  publishWithUserProperties: Buffer.from([
    61, 86, // Header
    0, 4, // Topic length
    116, 101, 115, 116, // Topic (test)
    0, 10, // Message ID
    73, // properties length
    1, 1, // payloadFormatIndicator
    2, 0, 0, 16, 225, // message expiry interval
    35, 0, 100, // topicAlias
    8, 0, 5, 116, 111, 112, 105, 99, // response topic
    9, 0, 4, 1, 2, 3, 4, // correlationData
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    11, 120, // subscriptionIdentifier
    3, 0, 4, 116, 101, 115, 116, // content type
    116, 101, 115, 116 // Payload (test)
  ]),

  publishWithRepeatingProperties: Buffer.from([
    61, 64, // Header
    0, 4, // Topic length
    116, 101, 115, 116, // Topic (test)
    0, 10, // Message ID
    51, // properties length
    1, 1, // payloadFormatIndicator
    2, 0, 0, 16, 225, // message expiry interval
    35, 0, 100, // topicAlias
    8, 0, 5, 116, 111, 112, 105, 99, // response topic
    9, 0, 4, 1, 2, 3, 4, // correlationData
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    11, 120, // subscriptionIdentifier
    11, 121, // subscriptionIdentifier
    11, 122, // subscriptionIdentifier
    3, 0, 4, 116, 101, 115, 116, // content type
    116, 101, 115, 116 // Payload (test)
  ]),

  publish2Kb: Buffer.concat([Buffer.from([
    48, 135, 16, // Header
    0, 4, // Topic length
    116, 101, 115, 116, // Topic (test)
    0, // Properties
  ]), bytes2kb]),

  pubAckSimple: Buffer.from([
    64, 3, // Header
    0, 2, // Message ID
    16 // reason code
  ]),

  pubAckWithProperties: Buffer.from([
    64, 24, // Header
    0, 2, // Message ID
    16, // reason code
    20, // properties length
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
  ]),

  pubrec: Buffer.from([
    80, 24, // Header
    0, 2, // Message ID
    16, // reason code
    20, // properties length
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
  ]),

  pubrel: Buffer.from([
    98, 24, // Header
    0, 2, // Message ID
    16, // reason code
    20, // properties length
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
  ]),

  pubcomp: Buffer.from([
    112, 24, // Header
    0, 2, // Message ID
    16, // reason code
    20, // properties length
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116 // userProperties
  ]),

  subscribe: Buffer.from([
    130, 26, // Header (subscribeqos=1length=9)
    0, 6, // Message ID (6)
    16, // properties length
    11, 145, 1, // subscriptionIdentifier
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    0, 4, // Topic length,
    116, 101, 115, 116, // Topic (test)
    24 // settings(qos: 0, noLocal: false, Retain as Published: true, retain handling: 1)
  ]),

  subscribeToThreeTopics: Buffer.from([
    130, 40, // Header (subscribeqos=1length=9)
    0, 7, // Message ID (6)
    16, // properties length
    11, 145, 1, // subscriptionIdentifier
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    0, 4, // Topic length,
    116, 101, 115, 116, // Topic (test)
    24, // settings(qos: 0, noLocal: false, Retain as Published: true, retain handling: 1)
    0, 4, // Topic length
    117, 101, 115, 116, // Topic (uest)
    1, // Qos (1)
    0, 4, // Topic length
    116, 102, 115, 116, // Topic (tfst)
    6 // Qos (2), No Local: true
  ]),

  suback: Buffer.from([
    144, 27, // Header
    0, 6, // Message ID
    20, // properties length
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    0, 1, 2, 1 // Granted qos (0, 1, 2) and a rejected being 0x80
  ]),

  unsubscribe: Buffer.from([
    162, 28,
    0, 7, // Message ID (7)
    13, // properties length
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    0, 4, // Topic length
    116, 102, 115, 116, // Topic (tfst)
    0, 4, // Topic length,
    116, 101, 115, 116 // Topic (test)
  ]),

  unsuback: Buffer.from([
    176, 25, // Header
    0, 8, // Message ID
    20, // properties length
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    0, 128 // success and error
  ]),

  pingreq: Buffer.from([
    192, 0 // Header
  ]),

  pingresp: Buffer.from([
    208, 0 // Header
  ]),

  disconnect: Buffer.from([
    224, 34, // Header
    0, // reason code
    32, // properties length
    17, 0, 0, 0, 145, // sessionExpiryInterval
    31, 0, 4, 116, 101, 115, 116, // reasonString
    38, 0, 4, 116, 101, 115, 116, 0, 4, 116, 101, 115, 116, // userProperties
    28, 0, 4, 116, 101, 115, 116// serverReference
  ]),
};

module.exports = packets;
