import { RANKS_IN_ORDER } from "../components/Constant";

export type Suit = "H" | "S"; // Hearts, Spades

export type Rank = (typeof RANKS_IN_ORDER)[number];

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
