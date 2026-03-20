export const CARD_IMG_ORIGINAL_WIDTH = 138;
export const CARD_IMG_ORIGINAL_HEIGHT = 206;
export const CARD_WIDTH = 150;
// Calculate the card height based on the original aspect ratio
export const CARD_HEIGHT =
  CARD_WIDTH * (CARD_IMG_ORIGINAL_HEIGHT / CARD_IMG_ORIGINAL_WIDTH);
export const CARD_VERTICAL_OFFSET = 50;
export const CARD_HORIZONTAL_OFFSET = 15;

export const EMPTY_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

export const RANKS_IN_ORDER = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;

export const DECK_COUNT = 4;
