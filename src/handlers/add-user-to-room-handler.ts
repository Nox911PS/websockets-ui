import { ClientIdType, clients, IUser, users } from '../db/users';
import { findUserByClientId, sendMessage, sendMessages } from '../helpers/helpers';
import { games, IGame, IGameUser, IRoom, IRoomUser, RoomIdType, rooms } from '../db/app';
import { randomUUID } from 'node:crypto';
import { IAddUserToRoomData } from '../types/interface';

export const addUserToRoomHandler = (data: IAddUserToRoomData, clientId: ClientIdType) => {
  const user = findUserByClientId(users, clientId);
  const room = rooms.get(data.indexRoom);

  if (user && room) {
    const userInRoom = _getUserInRoom(room.roomId);
    if (userInRoom.index === user.id) {
      sendMessage(clientId, 'error', 'You can not add yourself into the room you are created');
      return;
    }

    const usersForGame: IGameUser[] = [
      { ...userInRoom, ships: null },
      { index: user.id, name: user.name, ships: null },
    ];
    const newGame = _generateNewGame(usersForGame);

    rooms.delete(data.indexRoom);
    games.set(newGame.gameId, newGame);

    sendMessages(Array.from(clients.keys()), 'update_room', Array.from(rooms.values()));

    newGame.users.forEach((user) => {
      const createGameResponseData = {
        idGame: newGame.gameId,
        idPlayer: user.index,
      };

      const clientId = users.get(user.index)?.clientId;

      if (clientId) {
        sendMessage(clientId, 'create_game', createGameResponseData);
      }
    });
  }
};

const _generateNewGame = (users: IGameUser[]): IGame => ({
  gameId: randomUUID(),
  users,
  gameStatus: 'init',
});

const _getUserInRoom = (roomId: RoomIdType): IRoomUser => {
  const room = rooms.get(roomId);
  if (room) {
    return room.roomUsers[0];
  }
};
