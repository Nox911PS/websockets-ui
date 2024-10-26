import { ClientIdType, UserIdType, users } from '../db/users';
import { IAddShipsData, IShip } from '../types/interface';
import { games, GameStatusType, IGame, IGameUser } from '../db/app';
import { sendMessage } from '../helpers/helpers';
import { IStartGameData, ITurnData } from '../types/response';

export const addShipsHandler = (data: IAddShipsData, clientId: ClientIdType) => {
  const currentGame = games.get(data.gameId);

  if (!currentGame) return;

  const updatedStatus: GameStatusType = currentGame.gameStatus === 'set_ships' ? 'in_progress' : 'set_ships';
  const updatedUsers: IGameUser[] = currentGame.users.map((user) =>
    user.index === data.indexPlayer ? { ...user, ships: data.ships, shipsGrid: _setShipsToGrid(data.ships) } : user,
  );

  const updatedGame: IGame = {
    ...currentGame,
    users: updatedUsers,
    gameStatus: updatedStatus,
  };

  games.set(data.gameId, updatedGame);

  console.log('[UPDATED STATUS', updatedStatus);
  if (updatedStatus === 'in_progress') {
    currentGame.users
      .map((user: IGameUser) => user.index)
      .forEach((userId: UserIdType) => {
        const userData = users.get(userId);
        const userInGame = updatedGame.users.find((user) => user.index === userId);
        if (userInGame && userInGame.ships && userData && userData.clientId) {
          const startGameData: IStartGameData = {
            ships: userInGame.ships,
            currentPlayerIndex: userId,
          };
          const turnData: ITurnData = {
            currentPlayer: data.indexPlayer,
          };

          sendMessage(userData.clientId, 'start_game', startGameData);
          sendMessage(userData.clientId, 'turn', turnData);
        }
      });
  }
};

const _setShipsToGrid = (ships: IShip[]): [][] => {
  // the idea to create array of arrays and then set ships in these arrays like a coordinate
  // for example [[null, small, null, ...], ...] It means the coordinate for the small ship is x: 0, y:1
  const gridShipsLength = 10;
  const shipsGrid = [];
  for (let i = 0; i < gridShipsLength; i++) {
    shipsGrid.push(new Array(gridShipsLength).fill(null));
  }

  ships.forEach((ship) => {
    const initialPositionX = ship.position.x;
    const initialPositionY = ship.position.y;
    let positionX = initialPositionX;
    let positionY = initialPositionY;

    // Fill grid by ships according to them type
    for (let k = 0; k < ship.length; k++) {
      if (ship.direction) {
        positionY = initialPositionY + k;
      } else {
        positionX = initialPositionX + k;
      }
      shipsGrid[positionY][positionX] = ship.type;
    }
  });

  console.log('GRID', shipsGrid);
  return shipsGrid;
};
