import {
  BaseEntity,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '채팅방 id' })
  id: number;

  @ManyToMany(() => User, (user) => user.chatRooms)
  @JoinTable()
  @ApiProperty({ type: () => [User], description: '사용자 목록' })
  users: User[];

  @OneToMany(() => Chat, (chat) => chat.chatRoom)
  @ApiProperty({ type: () => [Chat], description: '채팅 목록' })
  chats: Chat[];
}
