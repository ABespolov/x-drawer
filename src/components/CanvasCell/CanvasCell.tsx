import React from 'react';
import styles from './CanvasCell.module.css';

export interface CanvasCellType {
    cellRef: React.RefObject<CanvasCell>;
}

interface CanvasCellProps {
    fontSize: number;
}

class CanvasCell extends React.Component<CanvasCellProps, {}> {
    myRef: React.RefObject<HTMLDivElement>;

    constructor(props: CanvasCellProps) {
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
        return <div ref={this.myRef} style={{ fontSize: this.props.fontSize }} className={`${styles.canvasCell}`} />;
    }
}

export default CanvasCell;
