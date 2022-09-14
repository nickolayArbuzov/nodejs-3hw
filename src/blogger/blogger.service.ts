import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Post } from '../posts/post.entity';
import { PostService } from '../posts/post.service';
import { Repository } from 'typeorm';
import { Blogger } from './blogger.entity';
import { CreateBloggerDto, UpdateBloggerDto } from './dto/blogger.dto';


@Injectable()
export class BloggerService {
  constructor(
    @Inject('BLOGGER_REPOSITORY') 
    private readonly bloggerRepository: Repository<Blogger>,
  ) {}

  async findAll() {
    const all = await this.bloggerRepository.find({relations: ['posts']});
    // TODO: research QueryBuilder
    /*this.bloggerRepository
    .createQueryBuilder('b')
    .innerJoin('b.posts', 'p')
    .where('p.content = :con', { con: 'a'})
    .select('')
    .addSelect('')*/
    // TODO: automapper
    return all.map(a => {return {id: a.id.toString(), name: a.name, youtubeUrl: a.youtubeUrl, createdAt: a.createdAt}})
    //return all
  }

  async findOne(id: string) {
    const donorBlogger = await this.bloggerRepository.findOne({where: {id: id}});
    if(donorBlogger) {
      // TODO something with id(number => string)
      return {...donorBlogger, id: donorBlogger.id.toString()}
    } else {
      throw new HttpException('Blogger not found', HttpStatus.NOT_FOUND);
    }
  }
  
  async createBlogger(dto: CreateBloggerDto) {
    const newBlogger = new Blogger()
    newBlogger.name = dto.name
    newBlogger.youtubeUrl = dto.youtubeUrl
    let date = new Date
    newBlogger.createdAt = date.toISOString()
    const blogger = await this.bloggerRepository.insert(newBlogger);
    // TODO something with id(number => string)
    return {...newBlogger, id: newBlogger.id.toString()};
  }

  async updateBlogger(id: string, dto: UpdateBloggerDto) {
    const donorBlogger = await this.bloggerRepository.findOne({where: {id: id}});
    if(donorBlogger) {
      // TODO something with id(number => string)
      const newBlogger = {
        ...donorBlogger,
        id: donorBlogger.id.toString(), 
        name: dto.name,
        youtubeUrl: dto.youtubeUrl,
      } 
      const blogger = await this.bloggerRepository.update(id, newBlogger);
      return newBlogger;
    } else {
      throw new HttpException('Blogger not found', HttpStatus.NOT_FOUND);
    }
  }

  async deleteBlogger(id: string) {
    const donorBlogger = await this.bloggerRepository.findOne({where: {id: id}});
    if(donorBlogger) {
      await this.bloggerRepository.delete(id)
    } else {
      throw new HttpException('Blogger not found', HttpStatus.NOT_FOUND);
    }
  }
  
}