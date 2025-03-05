import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Chat } from './entity/chat.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChatRoom } from './entity/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../user/entity/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { WsException } from '@nestjs/websockets';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ChatService {
  private readonly connectedClients = new Map<number, Socket>();

  constructor(
    @InjectRepository(Chat)
    private readonly chat: Repository<Chat>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  registerClient(userId: number, client: Socket) {
    this.connectedClients.set(userId, client);
  }

  removeClient(userId: number) {
    this.connectedClients.delete(userId);
  }

  async joinUserRooms(user: { sub: number }, client: Socket) {
    console.log('user.sub', user);
    const chatRooms = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .innerJoin('chatRoom.users', 'user', 'user.id = :userId', {
        userId: user.sub,
      })
      .getMany();

    chatRooms.forEach((chatRoom, idx) => {
      // client.join(`chatRoom/${chatRoom.id.toString()}`);
      console.log(`chatRoom ${idx}`, chatRoom);
      client.join(chatRoom.id.toString());
    });
  }

  async createMessage(
    payload: { sub: number },
    { message, room }: CreateChatDto,
    qr: QueryRunner,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    console.log('user.role === Role.admin', user.role, Role.admin);
    const chatRoom = await this.getOrCreateChatRoom(user, qr, room);

    const msgModel = await qr.manager.save(Chat, {
      author: user,
      message,
      chatRoom,
    });

    const client = this.connectedClients.get(user.id);
    client
      .to(chatRoom.id.toString())
      .emit('newMessage', plainToClass(Chat, msgModel));

    return message;
  }

  async getOrCreateChatRoom(user: User, qr: QueryRunner, room?: number) {
    if (user.role === Role.admin) {
      if (!room) {
        throw new WsException('어드민은 room 값을 필수로 제공해야합니다.');
      }

      return qr.manager.findOne(ChatRoom, {
        where: { id: room },
        relations: ['users'],
      });
    }

    let chatRoom = await qr.manager
      .createQueryBuilder(ChatRoom, 'chatRoom')
      .innerJoin('chatRoom.users', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();

    if (!chatRoom) {
      const adminUser = await qr.manager.findOne(User, {
        where: { role: Role.admin },
      });

      chatRoom = await this.chatRoomRepository.save({
        users: [user, adminUser],
      });

      [user.id, adminUser.id].forEach((userId) => {
        const client = this.connectedClients.get(userId);
        if (client) {
          client.emit('roomCreated', chatRoom.id);
          client.join(chatRoom.id.toString());
          // client.join(`chat/${chatRoom.id.toString()}`);
        }
      });
    }

    return chatRoom;
  }
}
