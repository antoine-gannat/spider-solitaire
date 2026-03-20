import { EMPTY_IMAGE } from "../components/Constant";

export function hideDraggedElement(ev: React.DragEvent) {
  // Hide the drag image by setting a transparent image
  const emptyImage = new Image();
  emptyImage.src = EMPTY_IMAGE;
  ev.dataTransfer?.setDragImage(emptyImage, 0, 0);
}
