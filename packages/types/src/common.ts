export interface OptionItem<T extends string | number = string | number> {
  label: string;
  value: T;
}
