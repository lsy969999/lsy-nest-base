import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiGetResponse = <TModel extends Type<any>>(model: TModel) =>
  applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(model) }],
      },
    }),
  );

export default <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiCreatedResponse({
      schema: {
        allOf: [{ $ref: getSchemaPath(model) }],
      },
    }),
  );
};

/**
 * export const ApiGetItemsResponse = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiOkResponse({
            schema: {
                allOf: [
                    {$ref: getSchemaPath(PageResDto)},
                    {
                        properties: {
                            items: {
                                type: 'array',
                                items: {$ref:getSchemaPath(model)}
                            },
                        },
                        required: ['items']
                    }
                ]
            }
        })
    )
}
 */
