import {
  makeStaticStyles,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { CARD_HEIGHT, CARD_WIDTH } from "./components/Constant";

export const useStaticStyles = makeStaticStyles({
  body: {
    margin: 0,
  },
});

export const useStyles = makeStyles({
  app: {
    backgroundColor: tokens.colorNeutralBackground1,
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    display: "flex",
    flexDirection: "column",
    padding: "20px",
  },
  deck: {
    padding: "10px",
    position: "relative",
    cursor: "pointer",
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
  },
  deckCard: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  completedSets: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
  },
  tableau: {
    display: "flex",
    flexDirection: "row",
    padding: "50px 20px",
    gap: "10px",
  },
  column: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: `${CARD_WIDTH}px`,
    height: `100%`,
  },
  emptyColumn: {
    width: "100%",
  },
  undoButton: {
    position: "fixed",
    left: "20px",
    bottom: "20px",
    zIndex: 200,
    backgroundColor: tokens.colorPaletteRedBackground3,
    ":hover": {
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
    "> img": {
      width: "50px",
    },
  },
});
