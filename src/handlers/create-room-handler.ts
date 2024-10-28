import { ClientIdType, clients, users } from '../db/users';
import { findUserByClientId, sendMessage, sendMessages } from '../helpers/helpers';
import { IRoom, rooms, winners } from '../db/app';
import { randomUUID } from 'node:crypto';

export const createRoomHandler = (data: string, clientId: ClientIdType) => {
  const user = findUserByClientId(users, clientId);

  if (user) {
    const newRoom: IRoom = {
      roomId: randomUUID(),
      roomUsers: [
        {
          name: user.name,
          index: user.id,
        },
      ],
    };

    rooms.set(newRoom.roomId, newRoom);

    sendMessages(Array.from(clients.keys()), 'update_room', Array.from(rooms.values()));
  }
};
