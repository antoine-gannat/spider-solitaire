import React from "react";
import type { ICard } from "../../logic/state";
import { useStyles } from "./Card.styles";
import {
  CARD_HEIGHT,
  CARD_HORIZONTAL_OFFSET,
  CARD_VERTICAL_OFFSET,
  CARD_WIDTH,
  EMPTY_IMAGE,
} from "../Constant";
import { getColumnFromXPos } from "../../utils/getColumnFromXPos";
import { mergeClasses } from "@fluentui/react-components";

type CardProps = {
  card: ICard;
  // index of the column in which the card is located, used to calculate horizontal position
  columnIndex: number;
  // index at which the card is located in its column, used to calculate vertical position
  cardIndex: number;
  onMoveCard: (fromColumnIndex: number, toColumnIndex: number) => void;
  isTopCard: boolean;
};

const getCardOffset = (columnIndex: number, cardIndex: number) => {
  return {
    top: cardIndex * CARD_VERTICAL_OFFSET,
    left: columnIndex * (CARD_WIDTH + CARD_HORIZONTAL_OFFSET),
  };
};

export function Card({
  card,
  columnIndex,
  cardIndex,
  onMoveCard,
  isTopCard,
}: CardProps) {
  const styles = useStyles();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const onDragStart = React.useCallback(
    (ev: React.DragEvent) => {
      // Hide the drag image by setting a transparent image
      const emptyImage = new Image();
      emptyImage.src = EMPTY_IMAGE;
      ev.dataTransfer?.setDragImage(emptyImage, 0, 0);

      if (!isTopCard) {
        ev.preventDefault();
        return;
      }
      setIsDragging(true);
      cardRef.current?.style.setProperty("z-index", "1000");
    },
    [isTopCard],
  );

  const onDrag = React.useCallback(
    (ev: React.DragEvent) => {
      if (!isDragging || ev.clientX === 0 || ev.clientY === 0) {
        return;
      }
      cardRef.current?.style.setProperty(
        "left",
        `${ev.clientX - CARD_WIDTH / 2}px`,
      );
      cardRef.current?.style.setProperty(
        "top",
        `${ev.clientY - CARD_HEIGHT / 2}px`,
      );
    },
    [isDragging],
  );

  const onDragEnd = React.useCallback(
    (ev: React.DragEvent) => {
      setIsDragging(false);
      onMoveCard(columnIndex, getColumnFromXPos(ev.clientX));
      cardRef.current?.style.removeProperty("z-index");
      const offset = getCardOffset(columnIndex, cardIndex);
      cardRef.current?.style.setProperty("left", `${offset.left}px`);
      cardRef.current?.style.setProperty("top", `${offset.top}px`);
    },
    [columnIndex, cardIndex, onMoveCard],
  );

  return (
    <div
      ref={cardRef}
      draggable={isTopCard}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      className={mergeClasses(styles.card, isTopCard && styles.topCard)}
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
