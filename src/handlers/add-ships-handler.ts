import { ClientIdType, clients, IUser, users } from '../db/users';
import { findUserByClientId, sendMessage } from '../helpers/helpers';
import { games, IGame, IGameUser, IRoom, IRoomUser, RoomIdType, rooms } from '../db/app';
import { randomUUID } from 'node:crypto';
import { IAddUserToRoomData } from '../types/interface';

export const addUserToRoomHandler = (data: IAddUserToRoomData, clientId: ClientIdType) => {
  const user = findUserByClientId(users, clientId);
  const room = rooms.get(data.indexRoom);

  if (user && room) {
    const userInRoom = _getUsersInRoom(room.roomId);
    const usersForGame = [userInRoom, { index: user.id, name: user.name }];
    console.log('[start game]', rooms, userInRoom, user);
    const newGame = _generateNewGame(usersForGame);

    rooms.delete(data.indexRoom);
    games.set(newGame.gameId, newGame);

    Array.from(clients.keys()).forEach((id: ClientIdType) => {
      sendMessage(id, 'update_room', Array.from(rooms.values()));
    });

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

const _generateNewGame = (users: IRoomUser[]): IGame => ({
  gameId: randomUUID(),
  users,
  gameStatus: 'init',
});

const _getUsersInRoom = (roomId: RoomIdType): IRoomUser => {
  const room = rooms.get(roomId);
  console.log('[ROOM]', room, room?.roomUsers[0]);
  if (room) {
    return room.roomUsers[0];
  }
};
