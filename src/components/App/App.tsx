import React from 'react';
import styles from './App.module.css';
import Canvas from '../Canvas/Canvas';

const App: React.FC = () => {
    return (
        <div className={styles.app}>
            <h1 className={`${styles.app__header} is-size-1 has-text-centered`}>X-Drawer</h1>
            <div className={styles.app__content}>
                <Canvas />
            </div>
        </div>
    );
};

export default App;
