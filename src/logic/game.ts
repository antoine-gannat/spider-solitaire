import { IState, Rank, Suit } from "./state";

type OnUpdateListener = (state: IState) => void;

export class Game {
  state: IState;
  private listener: OnUpdateListener | null = null;

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

  moveCard() {}

  listenForUpdates(listener: OnUpdateListener) {
    this.listener = listener;
  }

  // Generate two standard decks of cards (104 cards total) for Spider Solitaire
  // then shuffle them and return.
  private generateDeck(): IState["deck"] {
    const suits: Suit[] = ["H", "S"];
    const ranks: Rank[] = [
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
    ];
    const deck: IState["deck"] = [];

    // generate
    for (let i = 0; i < 2; i++) {
      for (const suit of suits) {
        for (let i = 0; i < 2; i++) {
          for (const rank of ranks) {
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
    this.listener?.(this.state);
  }
}
