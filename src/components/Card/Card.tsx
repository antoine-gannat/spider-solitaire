import React from "react";
import type { ICard } from "../../logic/state";
import { useStyles } from "./Card.styles";
import { mergeClasses } from "@fluentui/react-components";
import { getCardOffset, useCardMovements } from "../../hooks/useCardMovements";

type CardProps = {
  card: ICard;
  // index of the column in which the card is located, used to calculate horizontal position
  columnIndex: number;
  // index at which the card is located in its column, used to calculate vertical position
  cardIndex: number;
  isDraggable: boolean;
};

export function Card({ card, columnIndex, cardIndex, isDraggable }: CardProps) {
  const styles = useStyles();
  const { ref, onDrag, onDragEnd, onDragStart } = useCardMovements(
    card,
    isDraggable,
  );

  return (
    <div
      ref={ref}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      className={mergeClasses(styles.card, isDraggable && styles.topCard)}
      style={getCardOffset(columnIndex, cardIndex)}
    >
      <img
        className={styles.img}
        src={`./cards/${card.visible ? card.name : "back"}.png`}
        alt={card.visible ? card.name : "card back"}
      />
    </div>
  );
}
