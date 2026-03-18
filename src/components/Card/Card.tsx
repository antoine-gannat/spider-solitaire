import React from "react";
import type { ICard } from "../../logic/state";
import { useStyles } from "./Card.styles";
import { CARD_HORIZONTAL_OFFSET, CARD_VERTICAL_OFFSET } from "../Constant";

type CardProps = {
  card: ICard;
  // index of the column in which the card is located, used to calculate horizontal position
  columnIndex: number;
  // index at which the card is located in its column, used to calculate vertical position
  cardIndex: number;
};

export function Card({ card, columnIndex, cardIndex }: CardProps) {
  const styles = useStyles();

  return (
    <div
      className={styles.card}
      style={{
        top: cardIndex * CARD_VERTICAL_OFFSET,
        left: columnIndex * CARD_HORIZONTAL_OFFSET,
      }}
    >
      <img
        src={`./cards/${card.visible ? card.name : "back"}.png`}
        alt={card.visible ? card.name : "card back"}
      />
    </div>
  );
}
