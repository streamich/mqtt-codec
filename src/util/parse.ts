import BufferList from 'bl';
import {ERROR, PROPERTY} from '../enums';
import {Properties} from '../types';

export const parseVarInt = (list: BufferList, offset: number): [int: number, size: number] => {
  const b1 = list.readUInt8(offset);
  if (b1 ^ 0b10000000) return [b1 & 0b01111111, 1];
  const b2 = list.readUInt8(offset + 1);
  if (b2 ^ 0b10000000) return [((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 2];
  const b3 = list.readUInt8(offset + 2);
  if (b3 ^ 0b10000000) return [((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 3];
  const b4 = list.readUInt8(offset + 3);
  return [((b4 & 0b01111111) << 21) + ((b3 & 0b01111111) << 14) + ((b2 & 0b01111111) << 7) + (b1 & 0b01111111), 4]
};

export const parseBinary = (list: BufferList, offset: number): Buffer => {
  const stringOffset = offset + 2;
  const dataLength = list.readUInt16BE(offset);
  return list.slice(stringOffset, stringOffset + dataLength);
};

export const parseProps = (list: BufferList, offset: number): [props: Properties, size: number] => {
  const [int, size] = parseVarInt(list, offset);
  offset += size;
  const end = offset + int;
  const props: Properties = {};
  while (offset < end) {
    const byte = list.readUInt8(offset++);
    switch (byte) {
      case PROPERTY.PayloadFormatIndicator:
      case PROPERTY.RequestProblemInformation:
      case PROPERTY.RequestResponseInformation:
      case PROPERTY.MaximumQoS:
      case PROPERTY.RetainAvailable:
      case PROPERTY.WildcardSubscriptionAvailable:
      case PROPERTY.SubscriptionIdentifierAvailable:
      case PROPERTY.SharedSubscriptionAvailable:
        {
          props[byte] = list.readUInt8(offset);
          offset += 1;
          break;
        }
      case PROPERTY.ServerKeepAlive:
      case PROPERTY.ReceiveMaximum:
      case PROPERTY.TopicAliasMaximum:
      case PROPERTY.TopicAlias:
        {
          props[byte] = list.readUInt16BE(offset);
          offset += 2;
          break;
        }
      case PROPERTY.MessageExpiryInterval:
      case PROPERTY.WillDelayInterval:
      case PROPERTY.MaximumPacketSize:
        {
          props[byte] = list.readUInt32BE(offset);
          offset += 4;
          break;
        }
      case PROPERTY.CorrelationData:
      case PROPERTY.AuthenticationData:
        {
          const {byteLength} = props[byte] = parseBinary(list, offset);
          offset += 2 + byteLength;
          break;
        }
      case PROPERTY.ContentType:
      case PROPERTY.ResponseTopic:
      case PROPERTY.AssignedClientIdentifier:
      case PROPERTY.AuthenticationMethod:
      case PROPERTY.ResponseInformation:
      case PROPERTY.ServerReference:
      case PROPERTY.ReasonString:
        {
          const binary = parseBinary(list, offset);
          props[byte] = binary.toString('utf8');
          offset += 2 + binary.byteLength;
          break;
        }
      case PROPERTY.UserProperty:
        {
          if (props[PROPERTY.UserProperty]) props[PROPERTY.UserProperty] = [];
          const key = parseBinary(list, offset);
          offset += 2 + key.byteLength;
          const value = parseBinary(list, offset);
          offset += 2 + value.byteLength;
          props[PROPERTY.UserProperty]!.push([key.toString('utf8'), value.toString('utf8')]);
          break;
        }
      default:
        throw ERROR.MALFORMED_PACKET;
    }
  }
  return [props, int + size];
};
