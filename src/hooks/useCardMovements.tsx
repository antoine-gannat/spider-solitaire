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
import { game } from "../logic/game";

const registeredCards: Record<string, React.RefObject<HTMLDivElement>> = {};

export const getCardOffset = (columnIndex: number, cardIndex: number) => {
  return {
    top: cardIndex * CARD_VERTICAL_OFFSET,
    left: columnIndex * (CARD_WIDTH + CARD_HORIZONTAL_OFFSET),
  };
};

export function useCardMovements(card: ICard, isDraggable: boolean) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const draggedStackRef = React.useRef<
    { card: ICard; ref: React.RefObject<HTMLDivElement> }[]
  >([]);
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
      draggedStackRef.current = game
        .getCardStackFromCard(card)
        .map((c) => ({ card: c, ref: registeredCards[c.id] }));

      setIsDragging(true);
    },
    [isDraggable, card],
  );

  const onDrag = React.useCallback(
    (ev: React.DragEvent) => {
      if (!isDragging || ev.clientX === 0 || ev.clientY === 0) {
        return;
      }
      draggedStackRef.current.forEach(({ ref }, index) => {
        const offsetX = CARD_HORIZONTAL_OFFSET;
        const offsetY = index * CARD_VERTICAL_OFFSET;
        ref.current?.style.setProperty(
          "left",
          `${ev.clientX - CARD_WIDTH / 2 + offsetX}px`,
        );
        ref.current?.style.setProperty(
          "top",
          `${ev.clientY - CARD_HEIGHT / 2 + offsetY}px`,
        );
        // increase the z-index of the dragged card so that it appears above other cards while dragging
        ref.current?.style.setProperty("z-index", (100 + index).toString());
      });
    },

    [isDragging],
  );

  const onDragEnd = React.useCallback((ev: React.DragEvent) => {
    setIsDragging(false);

    draggedStackRef.current.forEach(({ ref, card }) => {
      const offset = getCardOffset(
        card.position.columnIndex,
        card.position.cardIndex,
      );
      ref.current?.style.setProperty("left", `${offset.left}px`);
      ref.current?.style.setProperty("top", `${offset.top}px`);
      ref.current?.style.removeProperty("z-index");
      game.moveCard(card, getColumnFromXPos(ev.clientX));
    });
  }, []);

  return {
    ref: cardRef,
    onDragStart,
    onDrag,
    onDragEnd,
  };
}
