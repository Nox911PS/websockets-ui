import { ClientIdType, IUser, UserIdType, users } from '../db/users';
import { IAddShipsData, IAttackData } from '../types/interface';
import { games, GameStatusType, IGame, IGameUser } from '../db/app';
import { findUserByClientId, sendMessage } from '../helpers/helpers';
import { IAttackFeedbackData, IStartGameData, ITurnData } from '../types/response';

export const attackHandler = (data: IAttackData, clientId: ClientIdType) => {
  const currentGame = games.get(data.gameId);

  if (currentGame) {
    const attackFeedbackData: IAttackFeedbackData = {
      position: {
        x: data.x,
        y: data.y,
      },
      currentPlayer: data.indexPlayer,
      status: 'killed',
    };
    const secondUser = currentGame.users.find((user) => user.index !== data.indexPlayer);
    const secondUserData = secondUser && users.get(secondUser.index);
    if (secondUserData?.clientId) {
      sendMessage(clientId, 'attack', attackFeedbackData);
      sendMessage(secondUserData.clientId, 'attack', attackFeedbackData);
    }
  }
};
