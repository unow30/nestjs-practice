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
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DirectorDto } from './dto/response/director.dto';
import {
  ApiDirectorCreate,
  ApiDirectorDelete,
  ApiDirectorFindAll,
  ApiDirectorFindOne,
  ApiDirectorUpdate,
} from '../document/decorator/director-api.decorator';

@Controller('director')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Post()
  @ApiDirectorCreate()
  create(@Body() createDirectorDto: CreateDirectorDto): Promise<DirectorDto> {
    return this.directorService.create(createDirectorDto);
  }

  @Get()
  @ApiDirectorFindAll()
  findAll(): Promise<DirectorDto[]> {
    return this.directorService.findAll();
  }

  @Get(':id')
  @ApiDirectorFindOne()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<DirectorDto> {
    return this.directorService.findOne(id);
  }

  @Patch(':id')
  @ApiDirectorUpdate()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDirectorDto: UpdateDirectorDto,
  ): Promise<DirectorDto> {
    return this.directorService.update(id, updateDirectorDto);
  }

  @Delete(':id')
  @ApiDirectorDelete()
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ id: number }> {
    return this.directorService.remove(id);
  }
}
