import {
  COLUMN_COUNT,
  DECK_COUNT,
  RANKS_IN_ORDER,
  SUIT_COUNT,
} from "../components/Constant";
import { getNewGroupIndex } from "../utils/getNewGroupIndex";
import { ICard, IState, Suit } from "./state";

type OnUpdateListener = (state: IState) => void;

type CardMove = {
  type: "move";
  cardId: string;
  fromColumnIndex: number;
  groupIndex?: number;
};

type CardUncover = {
  type: "uncover";
  columnIndex: number;
};

type CardDeal = {
  type: "deal";
  columnIndex: number;
};

type CardMoveRecord = CardMove | CardUncover | CardDeal;

// if true:
// - deal only cards to half the tableau
// - make all cards visible
// - don't shuffle the deck
const DEBUG_MODE = true;

class Game {
  state: IState;
  private listener: OnUpdateListener | null = null;
  private moves: CardMoveRecord[] = [];

  constructor() {
    this.state = {
      deck: [],
      tableau: [],
      completedSets: 0,
    };
  }

  public listenForUpdates(listener: OnUpdateListener) {
    this.listener = listener;
  }

  public setup() {
    this.state.deck = this.generateDeck();

    const totalColumns = DEBUG_MODE ? COLUMN_COUNT / 2 : COLUMN_COUNT;

    // left part of the tableau is 6 columns of 6 cards, right part is 4 columns of 5 cards
    for (let columnIndex = 0; columnIndex < totalColumns; columnIndex++) {
      const column: IState["tableau"][number] = [];
      for (
        let cardIndex = 0;
        cardIndex < (columnIndex < 4 ? 6 : 5);
        cardIndex++
      ) {
        const card = this.state.deck.pop();
        if (!card) {
          throw new Error("Deck ran out of cards during setup");
        }
        card.position = { columnIndex, cardIndex };
        if (DEBUG_MODE) {
          card.visible = true;
        }
        column.push(card);
      }
      // set last card in column to visible
      column[column.length - 1].visible = true;
      this.state.tableau[columnIndex] = column;
    }

    // add one extra column per completed set, so that when completed they can be moved there
    for (let i = 0; i < DECK_COUNT * SUIT_COUNT; i++) {
      this.state.tableau.push([]);
    }

    this.update();
  }

  public moveCard(
    card: ICard,
    toColumnIndex: number,
    groupIndex: number | undefined = undefined,
    isUndo = false,
  ) {
    // check if we can do the move.
    // unless we are undoing, then bypass
    if (!isUndo && !this.canMoveCard(card, toColumnIndex)) {
      return;
    }
    const fromColumnIndex = card.position.columnIndex;
    // remove card using its ID
    const fromColumn = this.state.tableau[fromColumnIndex];
    const cardIndexInFromColumn = fromColumn.findIndex((c) => c.id === card.id);
    if (cardIndexInFromColumn === -1) {
      throw new Error("Card to move not found in from column");
    }
    fromColumn.splice(cardIndexInFromColumn, 1);

    this.state.tableau[toColumnIndex].push(card);
    card.position = {
      columnIndex: toColumnIndex,
      cardIndex: this.state.tableau[toColumnIndex].length - 1,
    };

    // skip recording the move if this move is being made as part of an undo, to avoid infinite loop
    !isUndo &&
      this.moves.push({
        type: "move",
        fromColumnIndex,
        cardId: card.id,
        groupIndex,
      });

    // check if we can uncover a card in the from column after moving this card
    this.tryToUncoverCard(fromColumnIndex);

    // if the destination column is one of the main tableau columns, check if we completed a set with this move
    // (if we moved to one of the completed set columns, we know we completed a set, so no need to check again here)
    if (toColumnIndex < COLUMN_COUNT) {
      this.checkForCompletedSet(toColumnIndex);
    }

    // finally, update the state for the UI
    this.update();
  }

  // Deal cards from the deck to the tableau
  public dealCards() {
    if (this.state.deck.length === 0) {
      console.warn("No more cards to draw");
      return;
    }
    for (let columnIndex = 0; columnIndex < COLUMN_COUNT; columnIndex++) {
      const card = this.state.deck.pop();
      if (!card) {
        console.warn("Ran out of cards while dealing");
        break;
      }
      card.position = {
        columnIndex,
        cardIndex: this.state.tableau[columnIndex].length,
      };
      card.visible = true;
      this.state.tableau[columnIndex].push(card);
      this.moves.push({ type: "deal", columnIndex });
      // check if we completed a set with this deal
      this.checkForCompletedSet(columnIndex);
    }
    this.update();
  }

  // Undo the last move. If the last move was moving a stack of cards, will undo the entire stack together
  public undoLastAction() {
    const lastMove = this.moves.pop();
    if (!lastMove) {
      console.warn("No moves to undo");
      return;
    }
    if (lastMove.type === "move") {
      // Get all moves that are part of the same group (i.e. all cards that were moved together in a stack)
      const movesToUndo: CardMove[] = [
        lastMove,
        ...this.getCardsFromMoveGroup(lastMove.groupIndex),
      ]
        // Then reverse the moves so that we undo in the correct order
        .reverse();

      movesToUndo.forEach((move) => {
        const card = this.getCard(move.cardId);
        if (!card) {
          throw new Error("Card to undo move not found");
        }
        this.moveCard(
          card,
          /* toColumnIndex */ lastMove.fromColumnIndex,
          move.groupIndex,
          /* isUndo */ true,
        );
      });
    } else if (lastMove.type === "uncover") {
      const { columnIndex } = lastMove;
      const column = this.state.tableau[columnIndex];
      if (column.length === 0) {
        throw new Error("No card to cover");
      }
      column[column.length - 1].visible = false;
      // In the case of uncovering a card, we want to undo the move that triggered that uncover as well
      this.undoLastAction();
    } else if (lastMove.type === "deal") {
      this.undoDeal(lastMove);
    }
  }

  public getCardStackFromCard(card: ICard) {
    const column = this.state.tableau[card.position.columnIndex];
    return column.slice(card.position.cardIndex).filter((c) => c.visible);
  }

  private tryToUncoverCard(columnIndex: number) {
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

  private checkForCompletedSet(columnIndex: number) {
    const column = this.state.tableau[columnIndex];
    if (column.length < RANKS_IN_ORDER.length) {
      return;
    }
    const topCards = column.slice(-RANKS_IN_ORDER.length);
    const isCompleteSet =
      topCards[0].rank === "K" &&
      topCards.every((card, index) => {
        return (
          card.rank === RANKS_IN_ORDER[RANKS_IN_ORDER.length - 1 - index] &&
          card.suit === topCards[0].suit &&
          card.visible
        );
      });
    if (isCompleteSet) {
      const groupIndex = getNewGroupIndex();
      // move to the next completed set column
      const newColumnIndex = COLUMN_COUNT + this.state.completedSets;
      // remove the completed set from the tableau
      column.slice(-RANKS_IN_ORDER.length).forEach((card) => {
        this.moveCard(
          card,
          /* toColumnIndex */ newColumnIndex,
          groupIndex,
          /* isUndo */ false,
        );
      });
    }
  }

  private canMoveCard(card: ICard, toColumnIndex: number) {
    const fromColumn = this.state.tableau[card.position.columnIndex];
    const toColumn = this.state.tableau[toColumnIndex];
    if (fromColumn.length === 0) {
      return false;
    }
    if (toColumn.length === 0) {
      return true;
    }
    const destinationTopCard = toColumn[toColumn.length - 1];
    // can only move if card to move is one rank lower than top card
    return (
      RANKS_IN_ORDER.indexOf(card.rank) ===
      RANKS_IN_ORDER.indexOf(destinationTopCard.rank) - 1
    );
  }

  private undoDeal(lastMove: CardDeal) {
    const moves = [lastMove, ...this.getAllDealtCardFromMoves()].reverse();
    moves.forEach((move) => {
      const { columnIndex } = move;
      const column = this.state.tableau[columnIndex];
      if (column.length === 0) {
        throw new Error("No card to undo deal");
      }
      const card = column.pop();
      if (!card) {
        throw new Error("Card to undo deal not found");
      }
      card.position = { columnIndex: -1, cardIndex: -1 };
      card.visible = false;
      this.state.deck.push(card);
    });
    this.update();
  }

  // Get all moves that are part of the same group (i.e. all cards that were moved together in a stack)
  private getCardsFromMoveGroup(groupIndex: number | undefined): CardMove[] {
    if (groupIndex === undefined) {
      return [];
    }

    const moves: CardMove[] = [];
    let move: CardMoveRecord | undefined;
    while ((move = this.moves.pop())) {
      if (move.type === "move" && move.groupIndex === groupIndex) {
        moves.push(move);
      } else {
        // put back the move that is not part of the group we want to undo
        this.moves.push(move);
        break;
      }
    }
    return moves;
  }

  private getAllDealtCardFromMoves(): CardDeal[] {
    const moves: CardDeal[] = [];
    let move: CardMoveRecord | undefined;
    while ((move = this.moves.pop())) {
      if (move.type === "deal") {
        moves.push(move);
      } else {
        // put back the move that is not part of the dealt cards
        this.moves.push(move);
        break;
      }
    }
    return moves;
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

    // skip shuffling
    if (DEBUG_MODE) {
      return deck;
    }

    // Fisher-Yates shuffle for an unbiased, in-place random order.
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  private update() {
    // update the completed set count
    this.state.completedSets = this.state.tableau
      .slice(COLUMN_COUNT)
      .filter((column) => column.length > 0).length;
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

export const game = new Game();
