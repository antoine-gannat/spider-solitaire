import { RANKS_IN_ORDER } from "../components/Constant";

export type Suit = "H" | "S"; // Hearts, Spades

export type Rank = (typeof RANKS_IN_ORDER)[number];

export type CardPosition = {
  columnIndex: number;
  cardIndex: number;
};

type CardName = `${Rank}${Suit}`;

export interface ICard {
  id: string;
  name: CardName;
  suit: Suit;
  rank: Rank;
  visible: boolean;
  position: CardPosition;
}

export interface IState {
  deck: ICard[];
  tableau: ICard[][];
}
