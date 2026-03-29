export function pluralize(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  let form: string;

  if (mod100 >= 11 && mod100 <= 19) {
    form = many;
  } else if (mod10 === 1) {
    form = one;
  } else if (mod10 >= 2 && mod10 <= 4) {
    form = few;
  } else {
    form = many;
  }

  return `${count} ${form}`;
}
