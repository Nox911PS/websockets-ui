import { UUID } from 'node:crypto';
import { clients, connectedUsers, registeredUsers } from '../db/users';

export const closeHandler = (clientId: UUID) => {
  clients.delete(clientId);
  console.log('CLOSE clients size', clients.size);
  const user = Array.from(connectedUsers.values()).find((connectedUser) => connectedUser.clientId === clientId);
  if (user) {
    connectedUsers.delete(user.id);
  }
  console.log('CLOSE user', user);
  console.info(`Registered Users`, registeredUsers);
  console.info(`Connected Users`, connectedUsers);
};
