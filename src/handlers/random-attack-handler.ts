import { ClientIdType } from '../db/users';
import { IRandomAttackData } from '../types/response';
import { attackHandler } from './attack-handler';
import { games } from '../db/app';

export const randomAttackHandler = (data: IRandomAttackData, clientId: ClientIdType) => {
  const currentGame = games.get(data.gameId);
  const currentUserGameData = currentGame && currentGame.users.find((user) => user.index === data.indexPlayer);
  if (currentUserGameData) {
    const randomCoordinates = _getNewRandomCoordinates(currentUserGameData.shootsHistory);
    const attackData = {
      ...data,
      x: randomCoordinates.x,
      y: randomCoordinates.y,
    };
    attackHandler(attackData, clientId);
  }
};

const _getNewRandomCoordinates = (existingCoordinates: Set<string>): { x: number; y: number } => {
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  if (existingCoordinates.has(`${x}${y}`)) {
    return _getNewRandomCoordinates(existingCoordinates);
  }
  return {
    x,
    y,
  };
};
