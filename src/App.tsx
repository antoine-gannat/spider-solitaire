import React from "react";
import { Game } from "./logic/game";
import { Card } from "./components/Card/Card";
import { IState } from "./logic/state";
import { useStaticStyles, useStyles } from "./App.styles";

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
      {state.tableau.map((column, columnIndex) => (
        <div key={columnIndex}>
          {column.map((card, cardIndex) => (
            <Card
              card={card}
              key={`${card.name}-${cardIndex}`}
              columnIndex={columnIndex}
              cardIndex={cardIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;
