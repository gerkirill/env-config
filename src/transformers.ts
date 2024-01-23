import { Transform } from 'class-transformer';

// a shortcut to @Transform which splits comma-delimited string into array
export function Split(delimiter: string) {
  return Transform(({ value }) => value.split(delimiter).map((v) => v.trim()), { toClassOnly: true });
}

export function ParseInt(base = 10) {
  return Transform(({ value }) => Number.parseInt(value, base), { toClassOnly: true });
}
