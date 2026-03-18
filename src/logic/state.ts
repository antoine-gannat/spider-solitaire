export type Suit = "H" | "S"; // Hearts, Spades

export type Rank =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

type CardName = `${Rank}${Suit}`;

export interface ICard {
  name: CardName;
  suit: Suit;
  rank: Rank;
  visible: boolean;
}

export interface IState {
  deck: ICard[];
  tableau: ICard[][];
}
