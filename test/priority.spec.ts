import 'reflect-metadata';

import path from 'path';
import { IsString, loadEnvConfig } from '../src';

class Environment {
  @IsString()
  DEFINED_IN_3_PLACES: string;

  @IsString()
  DEFINED_IN_2_PLACES: string;

  @IsString()
  DEFINED_IN_1_PLACE: string;
}

describe('Config files priority', () => {
  let env: Environment;
  beforeEach(() => {
    env = loadEnvConfig(path.resolve(__dirname, './config-samples'), Environment);
    // console.log(process.env);
  });

  test('.env.local value wins', () => {
    expect(env.DEFINED_IN_3_PLACES).toEqual('.env.local config value');
    console.log(env);
  });

  test('.env value wins', () => {
    expect(env.DEFINED_IN_2_PLACES).toEqual('.env config value');
  });

  test('.env.default value wins', () => {
    expect(env.DEFINED_IN_1_PLACE).toEqual('.env.default config value');
  });
});
