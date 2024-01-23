# Standard configuration library

This module implements configuration management. The configuration is stored in .env format.

## Usage

### Installation

```bash
npm install @gerkirill/config
```

```typescript
import path from 'path';
import { loadEnvConfig } from '@gerkirill/config';
import { Environment } from '../models';

const env = loadEnvConfig(path.resolve(__dirname, '../environment'), Environment);
```

###### Example model file

```typescript
import { IsPort } from '@gerkirill/config';

export class Environment {
  @IsPort()
  API_PORT!: number;
}
```

###### Example .env file

```
API_PORT=3000
```


### Folder with .env files

In the code above - `../environment` is a relative path to the _environment_ folder, containing three .env files:

- _.env.default_ — Contains all env variables. The variables having common values for different environments (prod/qae/int) MUST have a value set. Other variables must be mentioned but have an empty value in this file.
- _.env_ — Contains only environment-specific variables, e.g. Kafka instance host/login/password. We store credentials for the INT env in this file.
- _.env.local_ — Empty by default. The file is used for the development at the local machine only. The library guarantees values from these files will not be ever used in the cloud, because Dockerfile contains `NODE_ENV=production` which makes the library ignore this file.

### Configuration files priority

The priority is the following:

- First - values are read from _.env.default_.
- Second - values present in _.env_ override values from _.env.default_.
- If `NODE_ENV` isn't set to `production` - values from _.env.local_ override values from the previous two files.

### Configuration validation

It is important to shut down micro-service early in a case no proper configuration provided.
`Environment` from the example above is a class with [class-validator](https://github.com/typestack/class-validator) annotations. It is used to validate the configuration. E.g.:

```typescript
export class Environment {
  @IsPort()
  API_PORT!: number;

  @IsString()
  BUCKET_NAME!: string;
  @IsString()
  BUCKET_PROJECT_ID!: string;
  @IsString()
  @IsUrl()
  BUCKET_PROXY!: string;
}
```

### Configuration transformation

All the values in the env files are strings. But `Environment` must declare them with a proper target type, which could be e.g. number or array of strings. To convert strings to some other representation here is a [@Transform](https://github.com/typestack/class-transformer#additional-data-transformation) annotation provided by the class-transformer. The annotation is re-exported by the @gerkirill/config library. But in order to perform some widely-used transformations - the @gerkirill/config library declares more helper functions, like @Split and @ParseInt:

```typescript
import { ParseInt, Split, Contains, EACH } from '@gerkirill/config';

export class Environment {
  @ParseInt()
  S3_PART_SIZE!: number;

  @Contains(':', EACH)
  @Split(',')
  KAFKA_BROKERS!: string[];
}
```

Above you can also see `EACH` constant, defined by the @gerkirill/config library. It is just a handy shortcut to `{ each: true }` flag used to instruct class validator to apply the rule to each element in the array.

## Reasons behind the three .env files

### .env.default

```
API_PORT=5000

BUCKET_NAME=
BUCKET_PROJECT_ID=
BUCKET_PROXY=
```

_.env_ file exists for two main reasons:

1. _It contains a full list of all config options available._ As we have three configuration files - gathering a list of all options required - can be a hard task for the DevOps. Assuming each file has a set of config options, which may (or may not) overlap with options in other files.

2. _It provides default values for the options which aren't environment-specific._ This point has two pros. DevOps can write less configuration, in order to provide only environment-specific values. And developers can change default values in one place, w/o the need to update each env-specific configuration in helm files. Even more - no helm update required at all in order to add or change a default value.

### .env

This file contains options having environment-specific values. e.g. resource URLs, usernames, passwords (assuming they are different across environments).

```
BUCKET_NAME=int-ba-origin.sinclairplatform.com
BUCKET_PROJECT_ID=common-int
BUCKET_PROXY=https://int-ba-gateway.sinclairplatform.com
```

**IMPORTANT!** We store only INT environment values here, including usernames and passwords. The reason for that is an easy development process. E.g. to develop micro-service locally - the developer just needs to clone the repository, install dependencies and execute `npm start`. The micro-service will connect to the INT environment and will be up and running in seconds.

Values for the other environments are set in corresponding .helm files. Secret information, like e.g. passwords and keys - can be stored in some kind of _secrets store_.

### .env.local

Sometimes when you develop locally - you need to adjust some config parameters. E.g. if you want to connect to the local Redis instance instead of the one in INT environment.

Changing _.env_ or _.env.default_ can be dangerous - the changes can be committed to git accidentally, leak to the cloud environment and break something. Despite we keep _env.local_ empty in git (not ignored, just empty) - even if you commit the changes - nothing will happen in the cloud. That's because in the cloud the code is executed in a docker container, which is configured like that:

```
ENV NODE_ENV=production
```

And the library ignores _env.local_ in the production environment.
