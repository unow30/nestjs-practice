export interface ApiResponse<T> {
  status: number;
  url: string;
  data: T;
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
