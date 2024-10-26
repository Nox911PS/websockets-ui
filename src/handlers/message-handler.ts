import { UUID } from 'node:crypto';
import { parseRequest } from '../helpers/helpers';
import { regHandler } from './reg-handler';
import { createRoomHandler } from './create-room-handler';
import { IAddShipsData, IAddUserToRoomData, IAttackData, IRegData } from '../types/interface';
import { addUserToRoomHandler } from './add-user-to-room-handler';
import { addShipsHandler } from './add-ships-handler';
import { attackHandler } from './attack-handler';

export const messageHandler = (message: string, clientId: UUID) => {
  try {
    const parsedMessage = parseRequest(message);

    if (parsedMessage.type === 'reg') {
      regHandler(parsedMessage.data as IRegData, clientId);
    }

    if (parsedMessage.type === 'create_room') {
      createRoomHandler(parsedMessage.data as string, clientId);
    }
    if (parsedMessage.type === 'add_user_to_room') {
      addUserToRoomHandler(parsedMessage.data as IAddUserToRoomData, clientId);
    }
    if (parsedMessage.type === 'add_ships') {
      addShipsHandler(parsedMessage.data as IAddShipsData, clientId);
    }
    if (parsedMessage.type === 'attack') {
      attackHandler(parsedMessage.data as IAttackData, clientId);
    }
  } catch (err) {
    console.error(err);
  }
};
