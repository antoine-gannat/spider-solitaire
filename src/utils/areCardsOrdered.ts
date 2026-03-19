import { RANKS_IN_ORDER } from "../components/Constant";
import { ICard } from "../logic/state";

/**
 * Check if all cards are in the same suit and in descending order (e.g. 5H, 4H, 3H)
 */
export function areCardsOrdered(cards: ICard[]) {
  for (let i = 0; i < cards.length - 1; i++) {
    const currentCard = cards[i];
    const nextCard = cards[i + 1];

    // Check if suits match
    if (currentCard.suit !== nextCard.suit) {
      return false;
    }
    // if one of the cards is not visible, we consider them ordered to allow moving a sequence of cards with some face down cards in between
    if (!currentCard.visible || !nextCard.visible) {
      return false;
    }
    // Check if ranks are in descending order
    if (
      RANKS_IN_ORDER.indexOf(currentCard.rank) !==
      RANKS_IN_ORDER.indexOf(nextCard.rank) + 1
    ) {
      return false;
    }
  }
  return true;
}
