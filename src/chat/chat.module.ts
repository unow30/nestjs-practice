import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { Chat } from './entity/chat.entity';
import { ChatRoom } from './entity/chat-room.entity';
import { User } from '../user/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Chat, ChatRoom, User])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
