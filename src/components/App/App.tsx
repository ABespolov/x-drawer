import React from 'react';
import styles from './App.module.css';
import Canvas from '../Canvas/Canvas';
import CommandReader, { DrawCommand } from '../CommandReader/CommandReader';

interface AppState {
    drawCommands: DrawCommand[];
    drawComplete: boolean;
}

class App extends React.Component<any, AppState> {
    state = {
        drawCommands: [],
        drawComplete: true,
    };

    setDrawCommands = (drawCommands: DrawCommand[]) => {
        this.setState({ drawCommands });
    };

    setDrawComplete = (drawComplete: boolean) => {
        this.setState({ drawComplete });
    };

    render() {
        const { drawCommands, drawComplete } = this.state;

        return (
            <div className={styles.app}>
                <h1 className={`${styles.app__header} is-size-1 has-text-centered`}>X-Drawer</h1>
                <div className={styles.app__content}>
                    <Canvas key={JSON.stringify(drawCommands)} drawCommands={drawCommands} />
                    <CommandReader
                        updateDrawCommands={this.setDrawCommands.bind(this)}
                        setDrawComplete={this.setDrawComplete.bind(this)}
                        isDrawComplete={drawComplete}
                    />
                </div>
            </div>
        );
    }
}

export default App;
