import { User } from 'src/user/entity/user.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Chat extends BaseTable {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '채팅 id' })
  id: number;

  @ManyToOne(() => User, (user) => user.chats)
  @ApiProperty({ type: () => User, description: '채팅 작성자' })
  author: User;

  @Column()
  @ApiProperty({ description: '채팅 내용' })
  message: string;

  @ManyToOne(() => ChatRoom, (chatroom) => chatroom.chats)
  @ApiProperty({ type: () => User, description: '채팅방' })
  chatRoom: ChatRoom;
}
