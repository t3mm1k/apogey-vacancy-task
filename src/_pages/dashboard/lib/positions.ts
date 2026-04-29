import type { Position } from "@db/position";
import { POSITION_VALUES } from "@db/position";

export const POSITION_LABELS: Record<Position, string> = {
  manager: "Руководитель",
  specialist: "Специалист",
  intern: "Стажёр",
  contractor: "Подрядчик",
  director: "Директор",
};

export { POSITION_VALUES };
