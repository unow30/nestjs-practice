import { User } from 'src/user/entity/user.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatRoom } from './chat-room.entity';

@Entity()
export class Chat extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chats)
  author: User;

  @Column()
  message: string;

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.chats)
  chatRoom: ChatRoom;
}
