import uuid from 'react-native-uuid';
import ReconnectingWebSocket from 'reconnecting-websocket';

import { usedConfig } from '@/common/config';
import { ActorRequest, ActorResponse, ActorResponseType } from '@/types/actor-api.types';

const ACTOR_URL = usedConfig.actorUrl;
const DEBUG = false;

const consoleInfo = DEBUG ? console.info : () => {};

type Listener = {
  id: string;
  type?: string;
  handler: (response: any) => void;
};

export default class SocketHandler {
  private static _socket: ReconnectingWebSocket | null = null;
  private static _listeners: Listener[] = [];
  private static _timeouts: NodeJS.Timeout[] = [];

  public static async connect() {
    // if everything is alright and we are already connected then no need to reconnect
    if (
      SocketHandler._socket !== null &&
      (SocketHandler._socket.readyState === WebSocket.OPEN || SocketHandler._socket.readyState === WebSocket.CONNECTING)
    ) {
      console.log('Socket already connected');
      return;
    }
    await new Promise((resolve, reject) => {
      SocketHandler._socket = new ReconnectingWebSocket(ACTOR_URL, undefined, {
        debug: DEBUG,
      });
      SocketHandler._socket.addEventListener('open', () => {
        consoleInfo('SocketHandler._socket', 'Opened!');
        console.log('Socket connected successfully');
        resolve(null);
      });
      SocketHandler._socket.addEventListener('message', (event: MessageEvent) => {
        const genericResponse = JSON.parse(event.data);
        consoleInfo('SocketHandler._socket', '->', genericResponse);
        for (const listener of SocketHandler._listeners) {
          if (listener.id !== undefined) {
            if (listener.id === genericResponse.id) {
              listener.handler(genericResponse);
            }
            continue;
          }

          if (listener.type !== undefined) {
            if (listener.type === genericResponse.type) {
              listener.handler(genericResponse);
            }
            continue;
          }

          listener.handler(genericResponse);
        }
      });
      SocketHandler._socket.addEventListener('close', (e: any) => {
        consoleInfo('SocketHandler._socket', 'Closed, reconnecting...');
        console.log('Socket closed, reconnecting...');
      });
    });
  }

  public static disconnect() {
    if (SocketHandler._socket !== null) {
      SocketHandler._socket.close();
      SocketHandler._listeners = [];
      SocketHandler._timeouts.map(id => clearTimeout(id));
      SocketHandler._timeouts = [];
      console.log('Socket disconnected');
    }
  }

  public static addListener(id: string, type: string | undefined, handler: (response: any) => void) {
    SocketHandler._listeners.push({ id, type, handler });
  }

  public static removeListener(handler: (response: any) => void) {
    for (let i = 0; i < SocketHandler._listeners.length; i++) {
      if (SocketHandler._listeners[i].handler === handler) {
        SocketHandler._listeners.splice(i, 1);
      }
    }
  }

  public static send(
    request: ActorRequest & {
      [key: string]: any;
    },
  ) {
    if (SocketHandler._socket === null) {
      throw new Error('Socket not initialized!');
    }
    if (SocketHandler._socket.readyState !== WebSocket.OPEN) {
      // This is naive, we should use a library here!
      setTimeout(() => SocketHandler.send(request), 500);
      return;
    }

    consoleInfo('SocketHandler._socket', '<-', request);
    SocketHandler._socket.send(JSON.stringify(request));
  }

  public static async request<Response extends ActorResponse>(
    request: ActorRequest & {
      [key: string]: any;
    },
  ): Promise<Response> {
    const requestId = uuid.v4();
    consoleInfo('SocketHandler.request', 'requestId', requestId);
    return new Promise((resolve, reject) => {
      let handled = false;
      const handler = (response: Response) => {
        if (response.id === requestId) {
          handled = true;
          SocketHandler.removeListener(handler);
          if (response.type === ActorResponseType.ERROR_RESPONSE) {
            reject(response);
          } else {
            resolve(response);
          }
        }
      };
      SocketHandler.addListener(requestId, undefined, handler);
      const id = setTimeout(() => {
        if (!handled) {
          SocketHandler.removeListener(handler);
          reject(new Error('Connection timeout!'));
        }
        SocketHandler._timeouts = SocketHandler._timeouts.filter(timeoutId => timeoutId !== id);
      }, 90_000);
      SocketHandler._timeouts.push(id);

      SocketHandler.send({
        ...request,
        id: requestId,
      });
    });
  }
}
