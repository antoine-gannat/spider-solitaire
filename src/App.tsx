import React from "react";
import { Game } from "./logic/game";
import { Card } from "./components/Card/Card";
import { IState } from "./logic/state";
import { useStaticStyles, useStyles } from "./App.styles";
import { Button } from "@fluentui/react-components";
import { areCardsOrdered } from "./utils/areCardsOrdered";

const game = new Game();

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
      <div className={styles.decks}>
        Deck: {state.deck.length} cards remaining
        <Button>Deal cards</Button>
        <Button onClick={() => game.undoMove()}>Undo</Button>
      </div>
      <div className={styles.tableau}>
        {state.tableau.map((column, columnIndex) => (
          <div key={columnIndex}>
            {column.map((card, cardIndex) => (
              <Card
                key={`${card.name}-${cardIndex}`}
                moveCard={game.moveCard.bind(game)}
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
