import {
  AddressModule,
  AnimalModule,
  ColorModule,
  CommerceModule,
  CompanyModule,
  DatabaseModule,
  DatatypeModule,
  DateModule,
  Faker,
  FinanceModule,
  GitModule,
  HackerModule,
  HelpersModule,
  ImageModule,
  InternetModule,
  LoremModule,
  MusicModule,
  NameModule,
  PhoneModule,
  RandomModule,
  ScienceModule,
  SystemModule,
  VehicleModule,
  WordModule,
} from '@faker-js/faker';
import {
  Limit,
  ModelDefinition,
  ModelDefinitionValue,
  ModelDictionary,
  Value,
} from '@mswjs/data/lib/glossary';

import { FakerLocale } from './locale';

export type FakerMethod<T> = T extends 'animal'
  ? keyof AnimalModule
  : T extends 'git'
  ? keyof GitModule
  : T extends 'date'
  ? keyof DateModule
  : T extends 'name'
  ? keyof NameModule
  : T extends 'word'
  ? keyof WordModule
  : T extends 'music'
  ? keyof MusicModule
  : T extends 'color'
  ? keyof ColorModule
  : T extends 'image'
  ? keyof ImageModule
  : T extends 'lorem'
  ? keyof LoremModule
  : T extends 'phone'
  ? keyof PhoneModule
  : T extends 'hacker'
  ? keyof HackerModule
  : T extends 'random'
  ? keyof RandomModule
  : T extends 'system'
  ? keyof SystemModule
  : T extends 'address'
  ? keyof AddressModule
  : T extends 'company'
  ? keyof CompanyModule
  : T extends 'finance'
  ? keyof FinanceModule
  : T extends 'helpers'
  ? keyof HelpersModule
  : T extends 'science'
  ? keyof ScienceModule
  : T extends 'vehicle'
  ? keyof VehicleModule
  : T extends 'commerce'
  ? keyof CommerceModule
  : T extends 'database'
  ? keyof DatabaseModule
  : T extends 'datatype'
  ? keyof DatatypeModule
  : T extends 'internet'
  ? keyof InternetModule
  : never;

export type FakerData<TModule extends keyof Faker> = {
  module: TModule;
  method: FakerMethod<TModule>;
  language?: FakerLocale;
};

export type ModelData =
  | FakerData<keyof Faker>
  | Partial<Value<ModelDefinitionValue, ModelDictionary>>
  | (() => Partial<Value<Limit<ModelDefinition>, ModelDictionary>>);

export type MockDatabaseData = {
  [key: string]: Record<string, ModelData>[];
};

export type MockDatabaseDataOptions = {
  repeat?: number;
  autoIncrement?: boolean;
};
