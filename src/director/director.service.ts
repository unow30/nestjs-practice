import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  async create(createDirectorDto: CreateDirectorDto) {
    return await this.directorRepository.save(createDirectorDto);
    // return 'This action adds a new director';
  }

  async findAll(): Promise<Director[]> {
    return await this.directorRepository.find();
    // return `This action returns all director`;
  }

  async findOne(id: number): Promise<Director> {
    return await this.directorRepository.findOne({ where: { id } });
    // return `This action returns a #${id} director`;
  }

  async update(
    id: number,
    updateDirectorDto: UpdateDirectorDto,
  ): Promise<Director> {
    const director = await this.directorRepository.findOne({ where: { id } });

    if (!director) {
      throw new NotFoundException('존재하지 않는 id입니다.');
    }

    await this.directorRepository.update({ id }, updateDirectorDto);

    const newDirector = await this.directorRepository.findOne({
      where: { id },
    });
    return newDirector;
    // return `This action updates a #${id} director`;
  }

  async remove(id: number): Promise<{ id: number }> {
    const director = await this.directorRepository.findOne({ where: { id } });

    if (!director) {
      throw new NotFoundException('존재하지 않는 id입니다.');
    }

    await this.directorRepository.delete(id);

    return { id };
  }
}
