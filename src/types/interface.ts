import { GameIdType, RoomIdType } from '../db/app';
import { UserIdType } from '../db/users';

export type RequestType =
  | 'reg'
  | 'update_winners'
  | 'create_room'
  | 'add_user_to_room'
  | 'create_game'
  | 'update_room'
  | 'add_ships'
  | 'start_game'
  | 'attack'
  | 'randomAttack'
  | 'turn'
  | 'finish'
  | 'error';

export interface IMessage {
  type: RequestType;
  data: unknown;
  id: number;
}

export interface IRegData {
  name: string;
  password: string;
}

export interface IAddUserToRoomData {
  indexRoom: RoomIdType;
}

export interface IShipPosition {
  x: number;
  y: number;
}

export type ShipType = 'small' | 'medium' | 'large' | 'huge';
export type ShipStatus = 'miss' | 'killed' | 'shot';
export enum SHIP_CELL_NUMBER {
  'small' = 1,
  'medium' = 2,
  'large' = 3,
  'huge' = 4,
}

export interface IShip {
  position: IShipPosition;
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface IAddShipsData {
  gameId: GameIdType;
  ships: IShip[];
  indexPlayer: UserIdType;
}

export interface IAttackData {
  gameId: GameIdType;
  x: number;
  y: number;
  indexPlayer: UserIdType;
}
