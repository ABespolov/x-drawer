import React from 'react';
import styles from './CanvasCell.module.css';

export interface CanvasCellType {
    cellRef: React.RefObject<CanvasCell>;
}

class CanvasCell extends React.Component<{}, {}> {
    myRef: React.RefObject<HTMLDivElement>;

    constructor(props: {}) {
        super(props);

        this.myRef = React.createRef();
    }

    fillSelf = (symbol: string) => {
        this.myRef.current!.innerHTML = symbol;
    };

    getFill = () => {
        return this.myRef.current!.innerHTML;
    };

    render() {
        return <div ref={this.myRef} className={`${styles.canvasCell}`}></div>;
    }
}

export default CanvasCell;
