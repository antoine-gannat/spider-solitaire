import { CARD_HORIZONTAL_OFFSET, CARD_WIDTH } from "../components/Constant";

export function getColumnFromXPos(x: number) {
  return Math.floor(x / (CARD_WIDTH + CARD_HORIZONTAL_OFFSET));
}
