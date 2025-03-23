import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entity/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createGenreDto: CreateGenreDto) {
    const genre = await this.genreRepository.findOne({
      where: { name: createGenreDto.name },
    });

    if (genre) {
      throw new NotFoundException('이미 존재하는 장르입니다');
    }

    return await this.genreRepository.save(createGenreDto);
    // return 'This action adds a new genre';
  }

  async findAll() {
    return await this.genreRepository.find();
  }

  async findOne(id: number) {
    return await this.genreRepository.findOne({ where: { id: id } });
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreRepository.findOne({ where: { id: id } });

    if (!genre) {
      throw new NotFoundException(`존재하지 않는 장르입니다.`);
    }

    await this.genreRepository.update(id, { ...updateGenreDto });

    return this.genreRepository.findOne({ where: { id: id } });
  }

  async remove(id: number) {
    const genre = await this.genreRepository.findOne({ where: { id: id } });

    if (!genre) {
      throw new NotFoundException(`존재하지 않는 장르입니다.`);
    }
    await this.genreRepository.delete(id);

    return { id };
  }
}
