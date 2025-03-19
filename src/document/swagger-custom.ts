import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * data 안에 key value 그대로 표현
 * response 까지 만들 필요 없을때 사용
 */
export const ApiPropertyResponse = (
  obj: SchemaObject & Partial<ReferenceObject>,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          ...obj.properties,
        },
      },
    }),
  );
};

export const ApiPropertyCreated = (
  obj: SchemaObject & Partial<ReferenceObject>,
) => {
  return applyDecorators(
    ApiCreatedResponse({
      schema: {
        type: 'object',
        properties: {
          ...obj.properties,
        },
      },
    }),
  );
};

export const ApiCreateResponse = (
  obj: SchemaObject & Partial<ReferenceObject>,
) => {
  return applyDecorators(
    ApiResponse({
      schema: {
        type: 'object',
        properties: {
          ...obj.properties,
        },
      },
    }),
  );
};

export function createApiOperation(summary: string, description: string) {
  return ApiOperation({ summary, description });
}
