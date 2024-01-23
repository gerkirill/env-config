import path from 'path';
import 'reflect-metadata';
import { IsNotEmpty, IsString, loadEnvConfig, MinLength } from '../src';

describe('Config validation', () => {
  test('missing @String() value throws', () => {
    class Environment {
      @IsString()
      MISSING: string;
    }
    expect(() => loadEnvConfig(path.resolve(__dirname, './config-samples'), Environment)).toThrow(
      'Configuration error: MISSING must be a string. Got value: undefined',
    );
  });

  test('empty @IsNotEmpty() value throws', () => {
    class Environment {
      @IsString()
      @IsNotEmpty()
      EMPTY: string;
    }
    expect(() => loadEnvConfig(path.resolve(__dirname, './config-samples'), Environment)).toThrow(
      `Configuration error: EMPTY should not be empty. Got value: ''`,
    );
  });

  test('two failed fields validation throws', () => {
    class Environment {
      @IsString()
      MISSING: string;

      @IsString()
      @IsNotEmpty()
      EMPTY: string;
    }

    expect(() => loadEnvConfig(path.resolve(__dirname, './config-samples'), Environment)).toThrow(
      `Configuration error: MISSING must be a string. Got value: undefined\nEMPTY should not be empty. Got value: ''`,
    );
  });

  test('two failed constraints validation throws', () => {
    class Environment {
      @IsString()
      @IsNotEmpty() // will fail
      @MinLength(20) // will also fail
      EMPTY: string;
    }

    expect(() => loadEnvConfig(path.resolve(__dirname, './config-samples'), Environment)).toThrow(
      `Configuration error: EMPTY must be longer than or equal to 20 characters; EMPTY should not be empty. Got value: ''`,
    );
  });
});
