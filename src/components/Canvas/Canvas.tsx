import React from 'react';
import styles from './Canvas.module.css';

import CanvasCell, { CanvasCellType } from '../CanvasCell/CanvasCell';

const MAX_CANVAS_SIZE = { width: 600, height: 500 };
const CANVAS_SIZE = { width: 300, height: 250 };

type Point = { x: number; y: number };
enum DrawDirections {
    'X',
    'Y',
}

interface CanvasState {
    canvasSize: { width: number; height: number };
    canvasCells: CanvasCellType[][];
    canvasCellElements: React.ReactElement<CanvasCell>[][];
}

class Canvas extends React.Component<{}, CanvasState> {
    state = {
        canvasSize: CANVAS_SIZE,
        canvasCells: new Array<Array<CanvasCellType>>(),
        canvasCellElements: new Array<Array<React.ReactElement<CanvasCell>>>(),
    };

    componentDidMount() {
        this.generateCanvas();
    }

    generateCanvas = () => {
        const { width, height } = this.state.canvasSize;
        const canvasCells: CanvasState['canvasCells'] = [];
        const canvasCellElements: React.ReactElement[][] = [];

        for (let i = 0; i < height; i++) {
            canvasCells.push([]);
            canvasCellElements.push([]);
            for (let j = 0; j < width; j++) {
                const cellRef = React.createRef<CanvasCell>();

                canvasCells[i].push({ cellRef });
                canvasCellElements[i].push(<CanvasCell ref={canvasCells[i][j].cellRef} key={i + '' + j} />);
            }
        }

        this.setState({ canvasCells, canvasCellElements });
    };

    drawLine = (point1: Point, point2: Point) => {
        let lineLength = 0;
        let startPoint = 0;
        let drawDirection: DrawDirections = DrawDirections.X;
        const canvasCells = [...this.state.canvasCells];

        if (point2.x - point1.x !== 0) {
            lineLength = point2.x - point1.x;
            startPoint = point1.x;
        } else {
            lineLength = point2.y - point1.y;
            startPoint = point1.y;
            drawDirection = DrawDirections.Y;
        }

        for (let i = startPoint; i <= lineLength + startPoint; i++) {
            if (drawDirection === DrawDirections.X) {
                canvasCells[point1.y - 1][i - 1].cellRef!.current!.fillSelf('X');
            } else {
                canvasCells[i - 1][point1.x - 1].cellRef!.current!.fillSelf('X');
            }
        }

        this.setState({ canvasCells });
    };

    drawRect = (point1: Point, point2: Point) => {
        const basisPoints = [
            { x: point1.x, y: point1.y },
            { x: point2.x, y: point1.y },
            { x: point2.x, y: point2.y },
            { x: point1.x, y: point2.y },
        ];
        const rectangleSides = [
            { point1: basisPoints[0], point2: basisPoints[1] }, // top
            { point1: basisPoints[0], point2: basisPoints[3] }, // left
            { point1: basisPoints[1], point2: basisPoints[2] }, // right
            { point1: basisPoints[3], point2: basisPoints[2] }, // bottom
        ];

        rectangleSides.forEach(side => this.drawLine(side.point1, side.point2));
    };

    trampoline = (fn: Function) => (...args: any) => {
        let result = fn(...args);
        const checkComplete = () => result.some((fn: any) => typeof fn === 'function');

        while (result.length && checkComplete()) {
            result = result.reduce((acc: any, fn: any) => (typeof fn === 'function' ? [...acc, ...fn()] : acc), []);
        }

        return result;
    };

    bucketFill = (point: Point) => {
        const { canvasCells } = this.state;

        this.trampoline(this.fillCells)(point, canvasCells);
    };

    fillCells = ({ x, y }: Point, canvasCells: CanvasState['canvasCells']): any => {
        const { canvasSize } = this.state;
        const acc: any = [];
        const addFn = ({ x, y }: Point) => {
            if (!canvasCells[y][x].cellRef.current!.checkFill()) {
                canvasCells[y][x].cellRef.current!.fillSelf('o');
                acc.push(() => this.fillCells({ x: x, y }, canvasCells));
            }
        };

        if (x - 1 >= 0) {
            addFn({ x: x - 1, y });
        }
        if (x + 1 < canvasSize.width) {
            addFn({ x: x + 1, y });
        }
        if (y - 1 >= 0) {
            addFn({ x, y: y - 1 });
        }
        if (y + 1 < canvasSize.height) {
            addFn({ x, y: y + 1 });
        }

        if (acc.length === 0) {
            return [];
        } else {
            return acc;
        }
    };

    render() {
        const { width, height } = this.state.canvasSize;
        const { canvasCellElements } = this.state;
        const scale = { width: 1, height: 1 };

        if(CANVAS_SIZE.width > CANVAS_SIZE.height) {
            scale.width = CANVAS_SIZE.width / CANVAS_SIZE.height;
        } else {
            scale.height = CANVAS_SIZE.height / CANVAS_SIZE.width;
        }

        const canvasStyle = {
            width: MAX_CANVAS_SIZE,
            height: MAX_CANVAS_SIZE,
            gridTemplate: `repeat(${height}, ${MAX_CANVAS_SIZE.height /
                CANVAS_SIZE.height /
                scale.width}px) / repeat(${width}, ${MAX_CANVAS_SIZE.width / CANVAS_SIZE.width / scale.height}px)`,
        };

        return (
            <div
                // @ts-ignore
                style={canvasStyle}
                className={styles.canvas}
                onClick={() => {
                    this.drawRect({ x: 1, y: 1 }, { x: 5, y: 5 });
                    this.bucketFill({ x: 9, y: 9 });
                }}
            >
                {canvasCellElements}
            </div>
        );
    }
}

export default Canvas;
