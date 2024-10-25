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
  | 'finish';

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
