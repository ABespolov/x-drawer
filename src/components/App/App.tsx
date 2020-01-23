import React from 'react';
import styles from './App.module.css';
import Canvas from '../Canvas/Canvas';
import CommandReader, { DrawCommand } from '../CommandReader/CommandReader';

interface AppState {
    drawCommands: DrawCommand[];
}

class App extends React.Component<{}, AppState> {
    state = {
        drawCommands: [],
    };

    setDrawCommands = (drawCommands: DrawCommand[]) => {
        this.setState({ drawCommands });
    };

    render() {
        const { drawCommands } = this.state;

        return (
            <div className={styles.app}>
                <h1 className={`${styles.app__header} is-size-1 has-text-centered`}>X-Drawer</h1>
                <div className={styles.app__content}>
                    <Canvas key={JSON.stringify(drawCommands)} drawCommands={drawCommands} />
                    <CommandReader updateDrawCommands={this.setDrawCommands.bind(this)} />
                </div>
            </div>
        );
    }
}

export default App;
