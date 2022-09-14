import { Blogger } from '../blogger/blogger.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ length: 30 })
  title: string;

  @Column({ length: 100 })
  shortDescription: string;

  @Column({ length: 1000 })
  content: string;

  @Column()
  createdAt: string;

  @Column()
  bloggerId: string;

  @Column()
  bloggerName: string;

  @ManyToOne(() => Blogger, blogger => blogger.posts, {onDelete: 'CASCADE'})
  blogger: Blogger
  
}