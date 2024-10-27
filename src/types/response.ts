import { IShip, IShipPosition, ShipStatus } from './interface';
import { UserIdType } from '../db/users';
import { GameIdType } from '../db/app';

export interface IStartGameData {
  ships: IShip[];
  currentPlayerIndex: UserIdType;
}

export interface ITurnData {
  currentPlayer: UserIdType;
}

export interface IAttackFeedbackData {
  position: IShipPosition;
  currentPlayer: UserIdType;
  status: ShipStatus;
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

export interface IRandomAttackData {
  gameId: GameIdType;
  indexPlayer: UserIdType;
}
