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
  decks: {},
  tableau: {
    position: "relative",
  },
});
