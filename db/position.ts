export const POSITION_VALUES = [
  "manager",
  "specialist",
  "intern",
  "contractor",
  "director",
] as const;

export type Position = (typeof POSITION_VALUES)[number];
