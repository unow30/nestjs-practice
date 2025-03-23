import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GenreDto } from './dto/response/genreDto';
import {
  ApiGenreCreate,
  ApiGenreDelete,
  ApiGenreFindAll,
  ApiGenreFindOne,
  ApiGenreUpdate,
} from '../document/decorator/genre-api.decorator';

@Controller('genre')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @ApiGenreCreate()
  create(@Body() createGenreDto: CreateGenreDto): Promise<GenreDto> {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  @ApiGenreFindAll()
  findAll(): Promise<GenreDto[]> {
    return this.genreService.findAll();
  }

  @Get(':id')
  @ApiGenreFindOne()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<GenreDto> {
    return this.genreService.findOne(id);
  }

  @Patch(':id')
  @ApiGenreUpdate()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGenreDto: UpdateGenreDto,
  ): Promise<GenreDto> {
    return this.genreService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @ApiGenreDelete()
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ id: number }> {
    return this.genreService.remove(id);
  }
}
