import { WebSocket } from 'ws';
import { UUID } from 'node:crypto';
import { GameIdType } from './app';

export type UserIdType = UUID;
export type ClientIdType = UUID;
export type ConnectionType = 'connected' | 'disconnected';

export interface IUser {
  name: string;
  password: string;
  id: UserIdType;
  connectionState: ConnectionType;
  wins: number;
  clientId?: ClientIdType | null;
  gameId?: GameIdType | null;
}

export const clients = new Map<ClientIdType, WebSocket>();

export const users = new Map<UserIdType, IUser>();
