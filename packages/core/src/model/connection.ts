import type {
  ConnectionId,
  Iso8601,
  MessageId,
  ResidentId,
  UserId,
} from "./ids.js";

export const CONNECTION_RELATIONS = [
  "child",
  "spouse",
  "sibling",
  "grandchild",
  "guardian",
  "other",
] as const;

export type ConnectionRelation = (typeof CONNECTION_RELATIONS)[number];

export type Connection = {
  readonly id: ConnectionId;
  readonly residentId: ResidentId;
  readonly familyUserId: UserId;
  readonly relation: ConnectionRelation;
  readonly createdAt: Iso8601;
};

export type Message = {
  readonly id: MessageId;
  readonly connectionId: ConnectionId;
  readonly fromId: UserId;
  readonly text: string;
  readonly createdAt: Iso8601;
};
