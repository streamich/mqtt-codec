const packets = {
  connectWithProperties: [
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
  ],
  
  connectShort: [
    16, 16,
    0, 4, 77, 81, 84, 84, // Protocol name
    4, // Version
    2, // Flags
    0, 0, // Keep-alive
    0, 4, 116, 101, 115, 116 // Client ID "test"
  ],

  connackShort: [
    32, 2, 0, 0
  ],

  connackWithProperties: [
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
  ],

  publishSample: [
    48, 10, // Header (publish)
    0, 4, // Topic length
    116, 101, 115, 116, // Topic (test)
    116, 101, 115, 116 // Payload (test)
  ],
};

module.exports = packets;
