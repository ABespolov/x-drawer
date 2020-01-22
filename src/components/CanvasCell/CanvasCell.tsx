import React from 'react';
import styles from './CanvasCell.module.css';

export interface CanvasCellType {
    cellRef: React.RefObject<CanvasCell>;
}

class CanvasCell extends React.Component<any, any> {
    myRef: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);

        this.myRef = React.createRef();
    }
    state = {
        filled: '',
    };

    fillSelf = (symbol: string) => {
        this.myRef.current!.innerHTML = symbol;
    };

    checkFill = () => {
        return this.myRef.current!.innerHTML;
    }

    render() {
        //const style = {fontSize: `calc()`}
        return <div ref={this.myRef} className={`${styles.canvasCell}`}></div>;
    }
}

export default CanvasCell;
