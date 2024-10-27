import { ClientIdType } from '../db/users';
import { IRandomAttackData } from '../types/response';
import { attackHandler } from './attack-handler';

export const randomAttackHandler = (data: IRandomAttackData, clientId: ClientIdType) => {
  const attackData = {
    ...data,
    x: Math.floor(Math.random() * 10),
    y: Math.floor(Math.random() * 10),
  };
  attackHandler(attackData, clientId);
};
