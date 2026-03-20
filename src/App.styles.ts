import {
  makeStaticStyles,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

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
  },
  deckCard: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  tableau: {
    padding: "50px 20px",
    position: "relative",
  },
});
