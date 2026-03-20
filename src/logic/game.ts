import { DECK_COUNT, RANKS_IN_ORDER } from "../components/Constant";
import { ICard, IState, Suit } from "./state";

type OnUpdateListener = (state: IState) => void;

type CardMove = {
  type: "move";
  cardId: string;
  fromColumnIndex: number;
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
    for (let columnIndex = 0; columnIndex < 10; columnIndex++) {
      const column: IState["tableau"][number] = [];
      for (
        let cardIndex = 0;
        cardIndex < (columnIndex < 6 ? 6 : 5);
        cardIndex++
      ) {
        const card = this.state.deck.pop();
        if (!card) {
          throw new Error("Deck ran out of cards during setup");
        }
        card.position = { columnIndex, cardIndex };
        column.push(card);
      }
      // set last card in column to visible
      column[column.length - 1].visible = true;
      this.state.tableau[columnIndex] = column;
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

  moveCard(card: ICard, toColumnIndex: number, isUndo = false) {
    const fromColumnIndex = card.position.columnIndex;
    // check if we can do the move.
    // unless we are undoing, then bypass
    if (!isUndo && !this.canMoveCard(fromColumnIndex, toColumnIndex)) {
      console.warn("Invalid move");
      return;
    }
    this.state.tableau[toColumnIndex].push(card);
    card.position = {
      columnIndex: toColumnIndex,
      cardIndex: this.state.tableau[toColumnIndex].length - 1,
    };
    this.state.tableau[fromColumnIndex].pop();
    this.moves.push({ type: "move", fromColumnIndex, cardId: card.id });

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
      const card = this.getCard(lastMove.cardId);
      if (!card) {
        throw new Error("Card to undo move not found");
      }
      this.moveCard(card, lastMove.fromColumnIndex, /* isUndo */ true);
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
    for (let deckIndex = 0; deckIndex < DECK_COUNT; deckIndex++) {
      for (const suit of suits) {
        for (const rank of RANKS_IN_ORDER) {
          deck.push({
            name: `${rank}${suit}`,
            suit,
            rank,
            visible: false,
            id: `${rank}${suit}-${deckIndex}`,
            position: { columnIndex: -1, cardIndex: -1 },
          });
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

  private getCard(cardId: string) {
    for (const column of this.state.tableau) {
      for (const card of column) {
        if (card.id === cardId) {
          return card;
        }
      }
    }
  }
}
