import { RANKS_IN_ORDER } from "../components/Constant";
import { IState, Suit } from "./state";

type OnUpdateListener = (state: IState) => void;

type CardMove = {
  type: "move";
  fromColumnIndex: number;
  toColumnIndex: number;
};
type CardUncover = {
  type: "uncover";
  columnIndex: number;
};

export class Game {
  state: IState;
  private listener: OnUpdateListener | null = null;
  private moves: (CardMove | CardUncover)[] = [];

  constructor() {
    this.state = {
      deck: [],
      tableau: [],
    };
  }

  setup() {
    this.state.deck = this.generateDeck();

    // left part of the tableau is 6 columns of 6 cards, right part is 4 columns of 5 cards
    for (let i = 0; i < 10; i++) {
      const column: IState["tableau"][number] = [];
      for (let j = 0; j < (i < 6 ? 6 : 5); j++) {
        const card = this.state.deck.pop();
        if (!card) {
          throw new Error("Deck ran out of cards during setup");
        }
        column.push(card);
      }
      // set last card in column to visible
      column[column.length - 1].visible = true;
      this.state.tableau[i] = column;
    }

    this.update();
  }

  tryToUncoverCard(columnIndex: number) {
    const column = this.state.tableau[columnIndex];
    if (column.length === 0) {
      return;
    }
    const topCard = column[column.length - 1];
    if (!topCard.visible) {
      topCard.visible = true;
      this.moves.push({ type: "uncover", columnIndex });
      this.update();
    }
  }

  canMoveCard(fromColumnIndex: number, toColumnIndex: number) {
    const fromColumn = this.state.tableau[fromColumnIndex];
    const toColumn = this.state.tableau[toColumnIndex];
    if (fromColumn.length === 0) {
      return false;
    }
    const cardToMove = fromColumn[fromColumn.length - 1];
    if (toColumn.length === 0) {
      return true;
    }
    const topCard = toColumn[toColumn.length - 1];
    // can only move if card to move is one rank lower than top card
    return (
      RANKS_IN_ORDER.indexOf(cardToMove.rank) ===
      RANKS_IN_ORDER.indexOf(topCard.rank) - 1
    );
  }

  moveCard(fromColumnIndex: number, toColumnIndex: number) {
    if (!this.canMoveCard(fromColumnIndex, toColumnIndex)) {
      console.warn("Invalid move");
      return;
    }
    const card = this.state.tableau[fromColumnIndex].pop();
    if (!card) {
      throw new Error("No card to move");
    }
    this.state.tableau[toColumnIndex].push(card);
    this.moves.push({ type: "move", fromColumnIndex, toColumnIndex });

    this.tryToUncoverCard(fromColumnIndex);
    this.update();
  }

  undoMove() {
    const lastMove = this.moves.pop();
    if (!lastMove) {
      console.warn("No moves to undo");
      return;
    }
    if (lastMove.type === "move") {
      const { fromColumnIndex, toColumnIndex } = lastMove;
      const card = this.state.tableau[toColumnIndex].pop();
      if (!card) {
        throw new Error("No card to undo move");
      }
      this.state.tableau[fromColumnIndex].push(card);
    } else if (lastMove.type === "uncover") {
      const { columnIndex } = lastMove;
      const column = this.state.tableau[columnIndex];
      if (column.length === 0) {
        throw new Error("No card to cover");
      }
      column[column.length - 1].visible = false;
      // In the case of uncovering a card, we want to undo the move that triggered that uncover as well
      this.undoMove();
    }
    this.update();
  }

  listenForUpdates(listener: OnUpdateListener) {
    this.listener = listener;
  }

  // Generate two standard decks of cards (104 cards total) for Spider Solitaire
  // then shuffle them and return.
  private generateDeck(): IState["deck"] {
    const suits: Suit[] = ["H", "S"];

    const deck: IState["deck"] = [];

    // generate
    for (let i = 0; i < 2; i++) {
      for (const suit of suits) {
        for (let i = 0; i < 2; i++) {
          for (const rank of RANKS_IN_ORDER) {
            deck.push({
              name: `${rank}${suit}`,
              suit,
              rank,
              visible: false,
            });
          }
        }
      }
    }

    // Fisher-Yates shuffle for an unbiased, in-place random order.
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  private update() {
    this.listener?.({ ...this.state });
  }
}
