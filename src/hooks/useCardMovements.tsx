import React from "react";
import { ICard } from "../logic/state";
import {
  CARD_HEIGHT,
  CARD_HORIZONTAL_OFFSET,
  CARD_VERTICAL_OFFSET,
  CARD_WIDTH,
} from "../components/Constant";
import { getColumnFromXPos } from "../utils/getColumnFromXPos";
import { hideDraggedElement } from "../utils/hideDraggedElement";

const registeredCards: Record<string, React.RefObject<HTMLDivElement>> = {};

export const getCardOffset = (columnIndex: number, cardIndex: number) => {
  return {
    top: cardIndex * CARD_VERTICAL_OFFSET,
    left: columnIndex * (CARD_WIDTH + CARD_HORIZONTAL_OFFSET),
  };
};

export function useCardMovements(
  card: ICard,
  isDraggable: boolean,
  moveCard: (card: ICard, toColumnIndex: number) => void,
) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    registeredCards[card.id] = cardRef;
    return () => {
      delete registeredCards[card.id];
    };
  }, [card.id]);

  const onDragStart = React.useCallback(
    (ev: React.DragEvent) => {
      hideDraggedElement(ev);
      if (!isDraggable) {
        ev.preventDefault();
        return;
      }
      setIsDragging(true);
      // increase the z-index of the dragged card so that it appears above other cards while dragging
      cardRef.current?.style.setProperty("z-index", "100");
    },
    [isDraggable],
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
      // reset z-index
      cardRef.current?.style.removeProperty("z-index");
      const offset = getCardOffset(
        card.position.columnIndex,
        card.position.cardIndex,
      );
      cardRef.current?.style.setProperty("left", `${offset.left}px`);
      cardRef.current?.style.setProperty("top", `${offset.top}px`);
      // update the card position in the game state
      moveCard(card, getColumnFromXPos(ev.clientX));
    },
    [card, moveCard],
  );

  return {
    ref: cardRef,
    onDragStart,
    onDrag,
    onDragEnd,
  };
}
