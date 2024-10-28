import { ClientIdType, clients, IUser, UserIdType } from '../db/users';
import { IMessage, RequestType } from '../types/interface';

export const parseRequest = (req: string): IMessage => {
  const parsedRequest = JSON.parse(req);
  parsedRequest.data = parsedRequest.data ? JSON.parse(parsedRequest.data) : parsedRequest.data;

  return parsedRequest;
};

export const findUserByClientId = (users: Map<UserIdType, IUser>, clientId: ClientIdType): IUser | undefined =>
  Array.from(users.values()).find((user) => user.clientId === clientId);

export const findUserByName = (users: Map<UserIdType, IUser>, userName: string): IUser | undefined =>
  Array.from(users.values()).find((user) => user.name === userName);

export const sendMessage = (clientId: ClientIdType, type: RequestType, data: unknown) => {
  const ws = clients.get(clientId);

  const response = {
    type,
    data: JSON.stringify(data),
    id: 0,
  };

  logger(type, response.data, false);
  if (ws) {
    ws.send(JSON.stringify(response));
  }
};

export const sendMessages = (clientIds: ClientIdType[], type: RequestType, data: unknown) => {
  clientIds.forEach((clientId) => sendMessage(clientId, type, data));
};

export const logger = (command: string, result: string, isRequest) =>
  console.info(`${isRequest ? 'Request' : 'Response'} Command: `, command, '\nData: ', result, '\n');
