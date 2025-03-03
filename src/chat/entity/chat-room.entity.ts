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

@Entity()
export class ChatRoom extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.chatRooms)
  @JoinTable()
  users: User[];

  @OneToMany(() => Chat, (chat) => chat.chatRoom)
  chats: Chat[];
}
