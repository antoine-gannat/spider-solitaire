import { makeStyles } from "@fluentui/react-components";
import { CARD_HEIGHT, CARD_WIDTH } from "../Constant";

export const useStyles = makeStyles({
  card: {
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
    position: "absolute",
  },
});
