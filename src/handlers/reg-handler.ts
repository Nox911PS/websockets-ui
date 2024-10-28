import { ClientIdType, clients, IUser, users } from '../db/users';
import { randomUUID } from 'node:crypto';
import { findUserByName, sendMessage } from '../helpers/helpers';
import { rooms, winners } from '../db/app';
import { IRegData } from '../types/interface';

export const regHandler = (data: IRegData, clientId: ClientIdType) => {
  let registeredUser = findUserByName(users, data.name);

  if (registeredUser) {
    if (registeredUser.name === data.name && registeredUser.connectionState === 'connected') {
      sendMessage(clientId, 'reg', _prepareUserData(registeredUser, true, 'The user is already connected'));
      return;
    }

    if (registeredUser.name === data.name && registeredUser.password !== data.password) {
      sendMessage(clientId, 'reg', _prepareUserData(registeredUser, true, 'The password is wrong'));
      return;
    }
  } else {
    registeredUser = _generateNewUser(data.name, data.password);
  }

  users.set(registeredUser.id, { ...registeredUser, clientId, connectionState: 'connected' });
  winners.set(registeredUser.id, { name: registeredUser.name, wins: registeredUser.wins });

  sendMessage(clientId, 'reg', _prepareUserData(registeredUser, false));
  Array.from(clients.keys()).forEach((id: ClientIdType) => {
    sendMessage(id, 'update_winners', Array.from(winners.values()));
    sendMessage(
      id,
      'update_room',
      Array.from(rooms.values()).filter((room) => room.roomUsers.length === 1),
    );
  });
};

const _generateNewUser = (name: string, password: string): IUser => ({
  name,
  password,
  id: randomUUID(),
  wins: 0,
  clientId: null,
  connectionState: 'disconnected',
});

const _prepareUserData = (user: IUser, isError: boolean, errorText = '') => ({
  name: user.name,
  index: user.id,
  error: isError,
  errorText,
});
