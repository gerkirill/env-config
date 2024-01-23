import { config } from 'dotenv';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import util from 'util';

export function loadEnvConfig<T>(dir: string, classType: ClassConstructor<T>): T {
  const { parsed: parsedLocal } = config({ path: `${dir}/.env.local` });
  const { parsed } = config({ path: `${dir}/.env` });
  const { parsed: parsedDefault } = config({ path: `${dir}/.env.default` });

  const combinedConfig = { ...parsedDefault, ...parsed, ...parsedLocal };
  const finalConfig = Object.keys(combinedConfig)
    .reduce((result, key) => {
      result[key] = key in process.env ? process.env[key] : combinedConfig[key];
      return result;
    }, {}
  );

  const typedConfig = plainToInstance(classType, finalConfig, {
    // excludeExtraneousValues: true,
    // strategy: 'exposeAll',
  });
  const errors = validateSync((typedConfig as unknown) as object, { validationError: { target: false } });
  if (errors.length) {
    const errText = errors
      .map((err) => Object.values(err.constraints).join('; ') + '. Got value: ' + util.inspect(err.value))
      .join('\n');
    throw new Error('Configuration error: ' + errText);
  }
  return typedConfig;
}
