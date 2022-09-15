import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Post } from '../posts/post.entity';
import { PostService } from '../posts/post.service';
import { Repository } from 'typeorm';
import { Blogger } from './blogger.entity';
import { CreateBloggerDto, UpdateBloggerDto } from './dto/blogger.dto';
import { QueryBlogDto } from '../commonDTO/query.dto';
import { queryDefault } from '../constants/constants';


@Injectable()
export class BloggerService {
  constructor(
    @Inject('BLOGGER_REPOSITORY') 
    private readonly bloggerRepository: Repository<Blogger>,
    @Inject('BLOGGER_REPOSITORY') 
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAllPostsByBlogId(id: string, query: QueryBlogDto) {

    const blog = await this.bloggerRepository.findOne({where: {id: id}})

    if(blog) {
      const repo = this.bloggerRepository.createQueryBuilder('blog')
      const pageNumber = query.pageNumber ? +query.pageNumber : +queryDefault.pageNumber
      const pageSize = query.pageSize ? + +query.pageSize : +queryDefault.pageSize
      const sortDirection = (query.sortDirection ? query.sortDirection.toLocaleUpperCase() : queryDefault.sortDirection.toLocaleUpperCase()) as 'DESC' | 'ASC'
      const all = await repo
        .leftJoinAndSelect('blog.posts', 'posts')
        .where({id: id})
        .skip((pageNumber-1) * pageSize)
        .take(pageSize)
        .getOne()
      const blog = await repo.where({id: id}).getOne()
      //TODO: automapper
      //TODO: property order in returned obj's
      const returnedPosts = all.posts.map(a => {
        return {content: a.content, shortDescription: a.shortDescription, title: a.title, blogId: a.blogId, blogName: a.blogName, id: a.id}
      })
      return returnedPosts
    } else {
      throw new HttpException('Blogger not found', HttpStatus.NOT_FOUND);
    }
  }

  async findAll(query: QueryBlogDto) {
    const repo = this.bloggerRepository.createQueryBuilder('blog')
    if(query.searchNameTerm) {
      //repo.where("LOWER(blog.name) like :name", { name: `LOWER(%${query.searchNameTerm}%)` })
      repo.where("LOWER(blog.name) like :name", { name: `%${query.searchNameTerm.toLowerCase()}%` })
    }
    
    const sortDirection = (query.sortDirection ? query.sortDirection.toLocaleUpperCase() : queryDefault.sortDirection.toLocaleUpperCase()) as 'DESC' | 'ASC'

    const all = await repo
      .skip((query.pageNumber ? (+query.pageNumber-1) : (+queryDefault.pageNumber-1)) * (query.pageSize ? + +query.pageSize : +queryDefault.pageSize))
      .take(query.pageSize ? +query.pageSize : +queryDefault.pageSize)
      .getMany()

    const count = await repo.getCount()
    //TODO: automapper
    //TODO: property order in returned obj's
    const returnedBlogs = all.map(a => {return {name: a.name, youtubeUrl: a.youtubeUrl, id: a.id}})
    return returnedBlogs
  }

  // TODO: need to refactor
  async findOneForCustomDecorator(id: string) {
    const donorBlogger = await this.bloggerRepository.findOne({where: {id: id}});
    if(donorBlogger) {
      return donorBlogger
    } else {
      return null
    }
  }

  async findOne(id: string) {
    const donorBlogger = await this.bloggerRepository.findOne({where: {id: id}});
    if(donorBlogger) {
      return donorBlogger
    } else {
      throw new HttpException('Blogger not found', HttpStatus.NOT_FOUND);
    }
  }
  
  async createBlogger(dto: CreateBloggerDto) {
    const newBlogger = new Blogger()
    newBlogger.name = dto.name
    newBlogger.youtubeUrl = dto.youtubeUrl
    const blogger = await this.bloggerRepository.insert(newBlogger);
    return newBlogger
  }

  async updateBlogger(id: string, dto: UpdateBloggerDto) {
    const donorBlogger = await this.bloggerRepository.findOne({where: {id: id}});
    if(donorBlogger) {
      const newBlogger = {
        ...donorBlogger,
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