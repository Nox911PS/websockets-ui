import { IShip, IShipPosition, ShipStatus } from './interface';
import { UserIdType } from '../db/users';

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
