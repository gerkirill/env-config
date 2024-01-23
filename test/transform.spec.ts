import path from 'path';
import 'reflect-metadata';
import { Contains, EACH, IsInt, loadEnvConfig, ParseInt, Split, Transform } from '../src';

describe('@Transform and related helper functions', () => {
  test('transform to host:port array with @Transform', () => {
    class Environment {
      @Contains(':', EACH)
      @Transform(({ value }) => value.split(',').map((v) => v.trim()), { toClassOnly: true })
      KAFKA_BROKERS!: string[];
    }
    const env = loadEnvConfig(path.resolve(__dirname, './config-samples'), Environment);

    expect(env.KAFKA_BROKERS).toEqual(['localhost:1010', 'localhost:2020']);
  });

  test('transform to host:port array with @Split', () => {
    class Environment {
      @Contains(':', EACH)
      @Split(',')
      KAFKA_BROKERS!: string[];
    }
    const env = loadEnvConfig(path.resolve(__dirname, './config-samples'), Environment);

    expect(env.KAFKA_BROKERS).toEqual(['localhost:1010', 'localhost:2020']);
  });

  test('parse integer value with @ParseInt', () => {
    // in this example @IsInt() validation annotation is required, as otherwise class validator will fail 
    // with 'Configuration error: an unknown value was passed to the validate function. Got value: undefined'
    // as described here https://github.com/typestack/class-validator/issues/1873
    class Environment {
      @IsInt()
      @ParseInt()
      PORT!: number;
    }
    const env = loadEnvConfig(path.resolve(__dirname, './config-samples'), Environment);

    expect(env.PORT).toEqual(5000);
  });
});
