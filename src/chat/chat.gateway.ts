import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { WsTransactionInterceptor } from '../common/interceptor/ws-transaction.interceptor';
import { WsQueryRunner } from '../common/decorator/ws-query-runner.decorator';
import { QueryRunner } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { UseInterceptors } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.chatService.removeClient(user.sub);
    }
  }

  async handleConnection(client: Socket) {
    try {
      // Bearer $token
      const rawToken = client.handshake.headers.authorization;
      const payload = await this.authService.parseBearerToken(rawToken, false);

      if (payload) {
        client.data.user = payload;
        this.chatService.registerClient(payload.sub, client);
        await this.chatService.joinUserRooms(payload, client);
      } else {
        client.disconnect();
      }
    } catch (error) {
      console.log(error);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  @UseInterceptors(WsTransactionInterceptor)
  async handleMessage(
    @MessageBody() body: CreateChatDto,
    @ConnectedSocket() client: Socket,
    @WsQueryRunner() qr: QueryRunner,
  ) {
    const payload = client.data.user;

    await this.chatService.createMessage(payload, body, qr);
  }
}
