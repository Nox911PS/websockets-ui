import { ClientIdType, clients, users } from '../db/users';
import { IGridHelperShip, IShipCoordinate, ShipStatus } from '../types/interface';
import { games, winners } from '../db/app';
import { sendMessage } from '../helpers/helpers';
import { IAttackData, IAttackFeedbackData, IStartGameData, ITurnData } from '../types/response';

export const attackHandler = (data: IAttackData, clientId: ClientIdType) => {
  const currentGame = games.get(data.gameId);

  if (currentGame) {
    if (currentGame.currentPlayerId !== data.indexPlayer) return;

    const enemyUserGameData = currentGame.users.find((user) => user.index !== data.indexPlayer);

    if (!enemyUserGameData) return;

    const enemyGridCell = enemyUserGameData.gridShips.gridShips[data.x][data.y];
    const enemyUserData = enemyUserGameData && users.get(enemyUserGameData.index);

    if (!enemyUserData?.clientId) return;

    if (enemyGridCell === null) {
      currentGame.currentPlayerId = enemyUserData.id;
      games.set(currentGame.gameId, currentGame);

      [clientId, enemyUserData.clientId].forEach((id) => {
        const turnData: ITurnData = {
          currentPlayer: enemyUserData.id,
        };
        sendMessage(id, 'attack', _generateAttackFeedbackData(data, 'miss'));
        sendMessage(id, 'turn', turnData);
      });

      return;
    }

    const enemyShipData: IGridHelperShip = enemyUserGameData.gridShips.gridHelper[enemyGridCell];

    // kill ship
    if (enemyShipData.remainingShoots === 1) {
      let isWinner = false;

      currentGame.users.forEach((user) => {
        if (user.index === enemyUserGameData.index) {
          user.gridShips.gridHelper[enemyGridCell].remainingShoots = 0;
          const shipCoordinates = enemyUserGameData.gridShips.gridHelper[enemyGridCell].shipCoordinates.get(
            `${data.x}${data.y}`,
          );

          shipCoordinates &&
            enemyUserGameData.gridShips.gridHelper[enemyGridCell].shipCoordinates.set(`${data.x}${data.y}`, {
              ...shipCoordinates,
              status: 'shooted',
            });

          isWinner = Object.values(user.gridShips.gridHelper).every(
            (ship: IGridHelperShip) => ship.remainingShoots === 0,
          );
        }
      });

      games.set(currentGame.gameId, currentGame);

      // update wins for current user
      if (winners) {
        const currentUserData = users.get(data.indexPlayer);
        currentUserData && users.set(data.indexPlayer, { ...currentUserData, wins: currentUserData.wins + 1 });
        currentUserData &&
          winners.set(currentUserData.id, { name: currentUserData.name, wins: currentUserData.wins + 1 });
      }

      // send message for each user about finishing the game
      [clientId, enemyUserData.clientId].forEach((id) => {
        if (isWinner) {
          sendMessage(id, 'finish', { winPlayer: data.indexPlayer });
          Array.from(clients.keys()).forEach((id: ClientIdType) => {
            sendMessage(id, 'update_winners', Array.from(winners.values()));
          });
        } else {
          let coordinatesForKilledShip: IShipCoordinate[] = Array.from(
            enemyUserGameData.gridShips.gridHelper[enemyGridCell].shipCoordinates.values(),
          );
          let coordinatesForAroundKilledShip: IShipCoordinate[] = Array.from(
            enemyUserGameData.gridShips.gridHelper[enemyGridCell].aroundShipCoordinates.values(),
          );

          coordinatesForKilledShip.forEach((killedShip) => {
            sendMessage(
              id,
              'attack',
              _generateAttackFeedbackData({ ...data, x: killedShip.x, y: killedShip.y }, 'killed'),
            );
          });

          coordinatesForAroundKilledShip.forEach((aroundShip) => {
            sendMessage(
              id,
              'attack',
              _generateAttackFeedbackData({ ...data, x: aroundShip.x, y: aroundShip.y }, 'miss'),
            );
          });

          const turnData: ITurnData = {
            currentPlayer: data.indexPlayer,
          };
          sendMessage(id, 'turn', turnData);
        }
      });

      return;
    }

    // already shoot in the ship of the received coordinates
    if (
      enemyUserGameData.gridShips.gridHelper[enemyGridCell].shipCoordinates.get(`${data.x}${data.y}`)?.status ===
      'shooted'
    ) {
      currentGame.currentPlayerId = enemyUserData.id;
      games.set(currentGame.gameId, currentGame);
      [clientId, enemyUserData.clientId].forEach((id) => {
        const turnData: ITurnData = {
          currentPlayer: enemyUserData.id,
        };
        const shipStatus: ShipStatus =
          enemyUserGameData.gridShips.gridHelper[enemyGridCell].remainingShoots === 0 ? 'killed' : 'shot';

        sendMessage(id, 'attack', _generateAttackFeedbackData(data, shipStatus));
        sendMessage(id, 'turn', turnData);
      });

      return;
    }

    // shoot in the ship
    currentGame.users.forEach((user) => {
      if (user.index === enemyUserGameData.index) {
        user.gridShips.gridHelper[enemyGridCell].remainingShoots = enemyShipData.remainingShoots - 1;
        const shipCoordinates = enemyUserGameData.gridShips.gridHelper[enemyGridCell].shipCoordinates.get(
          `${data.x}${data.y}`,
        );

        shipCoordinates &&
          enemyUserGameData.gridShips.gridHelper[enemyGridCell].shipCoordinates.set(`${data.x}${data.y}`, {
            ...shipCoordinates,
            status: 'shooted',
          });
      }
    });
    games.set(currentGame.gameId, currentGame);

    [clientId, enemyUserData.clientId].forEach((id) => {
      const turnData: ITurnData = {
        currentPlayer: data.indexPlayer,
      };

      sendMessage(id, 'attack', _generateAttackFeedbackData(data, 'shot'));
      sendMessage(id, 'turn', turnData);
    });
  }
};

const _generateAttackFeedbackData = (data: IAttackData, status: ShipStatus): IAttackFeedbackData => ({
  position: {
    x: data.x,
    y: data.y,
  },
  currentPlayer: data.indexPlayer,
  status,
});
