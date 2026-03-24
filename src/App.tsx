import React from "react";
import { game } from "./logic/game";
import { Card } from "./components/Card/Card";
import { IState } from "./logic/state";
import { useStaticStyles, useStyles } from "./App.styles";
import { Button } from "@fluentui/react-components";
import { areCardsOrdered } from "./utils/areCardsOrdered";
import { COLUMN_COUNT, DECK_COUNT, SUIT_COUNT } from "./components/Constant";

const App: React.FC = () => {
  const [state, setState] = React.useState<IState | null>(null);
  const styles = useStyles();

  useStaticStyles();

  React.useEffect(() => {
    game.listenForUpdates(setState);
    game.setup();
  }, []);

  if (!state) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.app}>
      <div className={styles.topBar}>
        <div>
          <Button onClick={() => game.undoMove()}>Undo</Button>
        </div>
        <div className={styles.completedSets}>
          <div className={styles.deck} onClick={() => game.dealCards()}>
            {Array.from(
              { length: Math.ceil(state.deck.length / COLUMN_COUNT) },
              (_, i) => (
                <img
                  key={i}
                  src={`./cards/back.png`}
                  className={styles.deckCard}
                  style={{ top: i * 10 }}
                />
              ),
            )}
          </div>
          {Array.from({ length: DECK_COUNT * SUIT_COUNT }, (_, i) => (
            <img
              key={i}
              src={`./cards/${i >= state.completedSets ? "empty_card" : "back"}.png`}
            />
          ))}
        </div>
      </div>
      <div className={styles.tableau}>
        {state.tableau.slice(0, COLUMN_COUNT).map((column, columnIndex) => (
          <div key={columnIndex}>
            {column.map((card, cardIndex) => (
              <Card
                key={`${card.name}-${cardIndex}`}
                card={card}
                columnIndex={columnIndex}
                cardIndex={cardIndex}
                isDraggable={
                  cardIndex === column.length - 1 ||
                  (card.visible === true &&
                    areCardsOrdered(column.slice(cardIndex)))
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
