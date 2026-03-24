import React from "react";
import { ICard } from "../logic/state";
import {
  CARD_HORIZONTAL_OFFSET,
  CARD_VERTICAL_OFFSET,
  CARD_WIDTH,
} from "../components/Constant";
import { getColumnFromXPos } from "../utils/getColumnFromXPos";
import { hideDraggedElement } from "../utils/hideDraggedElement";
import { game } from "../logic/game";
import { getNewGroupIndex } from "../utils/getNewGroupIndex";

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
      // get parent
      const parentRect =
        cardRef.current?.parentElement?.getBoundingClientRect();

      // calculate the offset of the dragged card relative to the parent element
      const parentOffsetX = parentRect ? parentRect.left : 0;
      const parentOffsetY = parentRect ? parentRect.top : 0;

      draggedStackRef.current.forEach(({ ref }, index) => {
        const offsetX = CARD_HORIZONTAL_OFFSET - CARD_WIDTH / 2;
        const offsetY = index * CARD_VERTICAL_OFFSET;
        ref.current?.style.setProperty(
          "left",
          `${ev.clientX + offsetX - parentOffsetX}px`,
        );
        ref.current?.style.setProperty(
          "top",
          `${ev.clientY + offsetY - parentOffsetY}px`,
        );
        // increase the z-index of the dragged card so that it appears above other cards while dragging
        ref.current?.style.setProperty("z-index", (100 + index).toString());
      });
    },

    [isDragging],
  );

  const onDragEnd = React.useCallback((ev: React.DragEvent) => {
    setIsDragging(false);

    const groupIndex = getNewGroupIndex();

    draggedStackRef.current.forEach(({ ref, card }) => {
      const offset = getCardOffset(
        card.position.columnIndex,
        card.position.cardIndex,
      );
      ref.current?.style.setProperty("left", `${offset.left}px`);
      ref.current?.style.setProperty("top", `${offset.top}px`);
      ref.current?.style.removeProperty("z-index");

      game.moveCard(
        card,
        getColumnFromXPos(ev.clientX),
        groupIndex,
        /* isUndo */ false,
      );
    });
  }, []);

  return {
    ref: cardRef,
    onDragStart,
    onDrag,
    onDragEnd,
  };
}
