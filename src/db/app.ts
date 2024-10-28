import { UserIdType } from './users';
import { UUID } from 'node:crypto';
import { IGrid, IShip, IShipPosition } from '../types/interface';
export type GameStatusType = 'init' | 'set_ships' | 'start_game' | 'in_progress' | 'finish';

export type RoomIdType = UUID;
export type GameIdType = UUID;

export interface IWinner {
  name: string;
  wins: number;
}

export interface IRoomUser {
  name: string;
  index: UserIdType;
}

export interface IRoom {
  roomId: RoomIdType;
  roomUsers: IRoomUser[];
}

export interface IGameUser {
  name: string;
  index: UserIdType;
  ships: IShip[] | null;
  gridShips: IGrid;
  shootsHistory: Set<string>;
}

export interface IGame {
  gameId: GameIdType;
  users: IGameUser[];
  gameStatus: GameStatusType;
  currentPlayerId: UserIdType | null;
}

export const winners = new Map<UserIdType, IWinner>();

export const rooms = new Map<RoomIdType, IRoom>();

export const games = new Map<GameIdType, IGame>();
