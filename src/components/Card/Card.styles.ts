import { makeStyles } from "@fluentui/react-components";
import { CARD_HEIGHT, CARD_WIDTH } from "../Constant";

export const useStyles = makeStyles({
  card: {
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
    position: "absolute",
    filter: "brightness(0.7)",
  },
  topCard: {
    cursor: "grab",
    filter: "brightness(1)",
  },
  dragging: {
    cursor: "grabbing",
  },
  img: {
    width: "100%",
    height: "100%",
  },
});
