import React from 'react';
import styles from './CanvasCell.module.css';

export interface Cell {
    filled: string;
}

interface CanvasCellProps {
    filled: string;
}

class CanvasCell extends React.Component<CanvasCellProps, {}> {
    render() {
        return <div className={`has-text-weight-bold ${styles.canvasCell}`}>{this.props.filled}</div>;
    }
}

export default CanvasCell;
