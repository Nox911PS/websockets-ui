import { ClientIdType, clients, users } from '../db/users';
import { findUserByClientId, sendMessage } from '../helpers/helpers';
import { games, rooms, winners } from '../db/app';

export const closeHandler = (clientId: ClientIdType) => {
  const disconnectedUser = findUserByClientId(users, clientId);
  const roomsWithDisconnectedUser = Array.from(rooms.values()).filter(
    (room) => room.roomUsers[0].index === disconnectedUser?.id,
  );
  const gameWithDisconnectedUser = Array.from(games.values()).filter(
    (game) => game.users[0].index === disconnectedUser?.id || game.users[1].index === disconnectedUser?.id,
  );

  if (!disconnectedUser) return;

  // remove all rooms with disconnected user
  roomsWithDisconnectedUser.forEach((room) => rooms.delete(room.roomId));

  // If disconnected user is in the game, this user loose the match and the another user wins
  if (gameWithDisconnectedUser.length) {
    const connectedUser = gameWithDisconnectedUser[0].users.find((user) => user.index !== disconnectedUser.id);

    if (!connectedUser) return;

    const connectedUserData = users.get(connectedUser.index);

    if (connectedUserData && connectedUserData.clientId) {
      // send message to the connected user about wining
      sendMessage(connectedUserData.clientId, 'finish', { winPlayer: connectedUser.index });

      // update wins for connected user
      users.set(connectedUserData.id, { ...connectedUserData, wins: connectedUserData.wins + 1 });
      winners.set(connectedUserData.id, { name: connectedUserData.name, wins: connectedUserData.wins + 1 });
    }
    // remove game with disconnected user
    games.delete(gameWithDisconnectedUser[0].gameId);
  }

  users.set(disconnectedUser.id, { ...disconnectedUser, connectionState: 'disconnected', clientId: null });
  clients.delete(clientId);

  // update rooms and winners for each client
  Array.from(clients.keys()).forEach((id: ClientIdType) => {
    sendMessage(id, 'update_room', Array.from(rooms.values()));
    sendMessage(id, 'update_winners', Array.from(winners.values()));
  });
  clients.delete(clientId);
};
