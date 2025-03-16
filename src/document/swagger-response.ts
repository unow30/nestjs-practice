import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
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
