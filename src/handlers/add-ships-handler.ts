import { ClientIdType, UserIdType, users } from '../db/users';
import { IAddShipsData, IGridHelper, IGridShips, IShip, IShipCoordinate, ShipIdType } from '../types/interface';
import { games, GameStatusType, IGame, IGameUser } from '../db/app';
import { sendMessage } from '../helpers/helpers';
import { IStartGameData, ITurnData } from '../types/response';
import { randomUUID } from 'node:crypto';

export const addShipsHandler = (data: IAddShipsData, clientId: ClientIdType) => {
  const currentGame = games.get(data.gameId);

  if (!currentGame) return;

  const updatedStatus: GameStatusType = currentGame.gameStatus === 'set_ships' ? 'in_progress' : 'set_ships';
  const updatedUsers: IGameUser[] = currentGame.users.map((user) =>
    user.index === data.indexPlayer ? { ...user, ships: data.ships, gridShips: _setShipsToGrid(data.ships) } : user,
  );

  const updatedGame: IGame = {
    ...currentGame,
    users: updatedUsers,
    gameStatus: updatedStatus,
    currentPlayerId: data.indexPlayer,
  };

  games.set(data.gameId, updatedGame);

  if (updatedStatus === 'in_progress') {
    // start game and send messages each user in the game
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

const _setShipsToGrid = (ships: IShip[]): { gridShips: IGridShips; gridHelper: IGridHelper } => {
  // the idea to create array of arrays and then set ships in these arrays like a coordinate
  // for example [[null, uuid of the ship, null, ...], ...] It means the coordinate for the ship is x: 0, y:1
  const gridLength = 10;
  const gridShips = [];
  const gridHelper: IGridHelper = {};
  for (let i = 0; i < gridLength; i++) {
    gridShips.push(new Array(gridLength).fill(null));
  }

  ships.forEach((ship) => {
    const shipId: ShipIdType = randomUUID();
    const initialPositionX = ship.position.x;
    const initialPositionY = ship.position.y;
    let positionX = initialPositionX;
    let positionY = initialPositionY;

    gridHelper[shipId] = {
      id: shipId,
      shipCoordinates: new Map<string, IShipCoordinate>(),
      remainingShoots: ship.length,
      aroundShipCoordinates: new Map<string, IShipCoordinate>(),
    };

    // Fill grid by ships according to them type
    for (let k = 0; k < ship.length; k++) {
      if (ship.direction) {
        positionY = initialPositionY + k;
      } else {
        positionX = initialPositionX + k;
      }
      gridShips[positionX][positionY] = shipId;
      gridHelper[shipId].shipCoordinates.set(`${positionX}${positionY}`, {
        x: positionX,
        y: positionY,
        status: 'available',
      });
      gridHelper[shipId].aroundShipCoordinates = new Map([
        ...gridHelper[shipId].aroundShipCoordinates,
        ..._getAroundShipCoordinates(positionX, positionY),
      ]);
    }

    // check that ships coordinates don't include in the around ship coordinates
    gridHelper[shipId].shipCoordinates.forEach((value, key) => {
      if (gridHelper[shipId].aroundShipCoordinates.has(key)) {
        gridHelper[shipId].aroundShipCoordinates.delete(key);
      }
    });
  });

  return { gridShips, gridHelper };
};

const _getAroundShipCoordinates = (positionX: number, positionY: number): Map<string, IShipCoordinate> => {
  let coordinatesAroundShip = new Map<string, IShipCoordinate>();
  const cellsNumberAroundShipPositionInRow = 3;
  // fill the square 3x3 around the ship, it means we have the coordinates around the ship
  // then we filter out the ship coordinate from this square
  for (let i = 0; i < cellsNumberAroundShipPositionInRow; i++) {
    coordinatesAroundShip.set(`${positionX - 1 + i}${positionY - 1}`, {
      x: positionX - 1 + i,
      y: positionY - 1,
      status: 'available',
    });
    coordinatesAroundShip.set(`${positionX - 1 + i}${positionY}`, {
      x: positionX - 1 + i,
      y: positionY,
      status: 'available',
    });
    coordinatesAroundShip.set(`${positionX - 1 + i}${positionY + 1}`, {
      x: positionX - 1 + i,
      y: positionY + 1,
      status: 'available',
    });
  }

  coordinatesAroundShip.forEach((coordinate, key) => {
    if (coordinate.x === -1 || coordinate.x === 10 || coordinate.y === -1 || coordinate.y === 10) {
      coordinatesAroundShip.delete(key);
    }
  });

  return coordinatesAroundShip;
};
