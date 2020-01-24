import React from 'react';
import styles from './App.module.css';
import Canvas from '../Canvas/Canvas';
import CommandReader, { DrawCommand } from '../CommandReader/CommandReader';

interface AppState {
    drawCommands: DrawCommand[];
    isDrawingComplete: boolean;
}

class App extends React.Component<{}, AppState> {
    state = {
        drawCommands: [],
        isDrawingComplete: true,
    };

    setDrawCommands = (drawCommands: DrawCommand[]) => {
        this.setState({ drawCommands });
    };

    setDrawingComplete = (isDrawingComplete: boolean) => {
        this.setState({ isDrawingComplete });
    };

    render() {
        const { drawCommands, isDrawingComplete } = this.state;

        return (
            <div className={styles.app}>
                <h1 className={`${styles.app__header} is-size-1 has-text-centered`}>X-Drawer</h1>
                <div className={styles.app__content}>
                    <Canvas
                        key={JSON.stringify(drawCommands)}
                        isDrawingComplete={isDrawingComplete}
                        drawCommands={drawCommands}
                    />
                    <CommandReader
                        isDrawingComplete={isDrawingComplete}
                        setDrawingComplete={this.setDrawingComplete.bind(this)}
                        updateDrawCommands={this.setDrawCommands.bind(this)}
                    />
                </div>
                <h2 className={`${styles.app__help} is-size-7 has-text-centered`}>
                    <a
                        href="https://github.com/ABespolov/x-drawer#%D1%81ommands-list"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Commands list
                    </a>
                    <br />
                    <strong>Author: </strong>
                    <a href="https://github.com/ABespolov" rel="noopener noreferrer" target="_blank">
                        Artem Bespolov
                    </a>
                </h2>
            </div>
        );
    }
}

export default App;
