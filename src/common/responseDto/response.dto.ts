export class GenreResponseDto {
  id: number;
  name: string;

  constructor(genre: any) {
    this.id = genre.id;
    this.name = genre.name;
  }
}

export class DirectorResponseDto {
  id: number;
  name: string;
  dob: string; // ISO string format
  nationality: string;

  constructor(director: any) {
    this.id = director.id;
    this.name = director.name;
    this.dob = director.dob.toISOString(); // Convert Date to ISO string
    this.nationality = director.nationality;
  }
}

export class CursorPaginatedResponseDto<T> {
  data: T[];
  nextCursor: string | null;
  count: number;

  constructor(data: T[], nextCursor: string | null, count: number) {
    this.data = data;
    this.nextCursor = nextCursor;
    this.count = count;
  }
}
