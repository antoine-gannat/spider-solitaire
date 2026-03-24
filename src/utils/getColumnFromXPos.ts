import {
  CARD_HORIZONTAL_OFFSET,
  CARD_WIDTH,
  COLUMN_COUNT,
} from "../components/Constant";

export function getColumnFromXPos(x: number) {
  return Math.min(
    COLUMN_COUNT - 1,
    Math.max(0, Math.floor(x / (CARD_WIDTH + CARD_HORIZONTAL_OFFSET))),
  );
}
