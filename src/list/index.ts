import {
  FactoryAPI,
  Limit,
  ModelDefinition,
  ModelDictionary,
  Value,
} from '@mswjs/data/lib/glossary';
import { QueryOptions, QuerySelector } from '@mswjs/data/lib/query/queryTypes';
import { PathParams, rest, RestRequest } from 'msw';

const modelFilterList = (
  req: RestRequest<never, PathParams<string>>,
  filters: string[]
):
  | (QueryOptions & QuerySelector<Partial<Value<Limit<ModelDefinition>, ModelDictionary>>>)
  | undefined => {
  if (!filters.length) return undefined;

  return {
    where: {
      ...filters.reduce((prev, filter) => {
        const param = req.url.searchParams.get(filter);
        return {
          ...prev,
          [filter]:
            !param || typeof param !== 'number' ? { contains: param ?? '' } : { equals: +param },
        };
      }, {}),
    },
  };
};

export const modelListGenerator = (model: string, db: FactoryAPI<ModelDictionary>) => {
  return rest.get(`/${model}`, (req, res, ctx) => {
    const [...searchParams] = req.url.searchParams.keys();
    const filters = searchParams.filter(
      (param) => param !== 'itemsPerPage' && param !== 'currentPage' && param !== 'delay'
    );
    const itemsPerPage = +(req.url.searchParams.get('itemsPerPage') ?? 0);
    const currentPage = +(req.url.searchParams.get('currentPage') ?? 1);
    const filterData = modelFilterList(req, filters);

    const data =
      db[model]?.findMany({
        ...filterData,
        take: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
      }) ?? [];

    const delay = +(req.url.searchParams.get('delay') ?? 0);

    const totalModelItems = db[model]?.count(filterData) ?? 0;

    const totalPages = Math.ceil(totalModelItems / itemsPerPage);

    return res(
      ctx.delay(delay),
      ctx.json({
        totalPages,
        currentPage,
        itemsPerPage,
        data,
      })
    );
  });
};
