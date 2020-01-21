import React from 'react';
import styles from './Canvas.module.css';

import CanvasCell, { Cell } from '../CanvasCell/CanvasCell';

const MAX_CANVAS_SIZE = 500;
const CELL_SIZE = 20;

type Point = { x: number; y: number };
enum DrawDirections {
    'X',
    'Y',
}

interface CanvasState {
    canvasSize: { width: number; height: number };
    canvasCells: Cell[][];
}

class Canvas extends React.Component<{}, CanvasState> {
    state = {
        canvasSize: { width: 25, height: 25 },
        canvasCells: new Array<Array<Cell>>(),
    };

    componentDidMount() {
        this.generateCanvas();
    }

    generateCanvas = () => {
        const { width, height } = this.state.canvasSize;
        const canvasCells: CanvasState['canvasCells'] = [];

        for (let i = 0; i < height; i++) {
            canvasCells.push([]);
            for (let j = 0; j < width; j++) {
                canvasCells[i].push({ filled: '' });
            }
        }

        this.setState({ canvasCells });
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
                canvasCells[point1.y - 1][i - 1].filled = 'X';
            } else {
                canvasCells[i - 1][point1.x - 1].filled = 'X';
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
        const canvasCells = JSON.parse(JSON.stringify(this.state.canvasCells));

        const a: any = this.trampoline(this.fillCells);
        const newCells: any = a(point, canvasCells);

        this.setState({ canvasCells });
    };

    fillCells = ({ x, y }: Point, canvasCells: CanvasState['canvasCells']): any => {
        const { canvasSize } = this.state;
        const acc: any = [];
        const addFn = ({ x, y }: Point) => {
            if (!canvasCells[y][x].filled) {
                canvasCells[y][x].filled = '0';
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

        if (acc.length === 0) return [];
        return acc;
    };

    getCellElements = (): React.ReactElement[][] => {
        const { canvasCells } = this.state;
        const { width, height } = this.state.canvasSize;
        const cellElements: React.ReactElement[][] = [];

        if (canvasCells.length !== 0) {
            for (let i = 0; i < height; i++) {
                cellElements.push([]);
                for (let j = 0; j < width; j++) {
                    const filled = canvasCells[i][j].filled;

                    cellElements[i].push(<CanvasCell key={i + '' + j} filled={filled} />);
                }
            }
        }

        return cellElements;
    };

    render() {
        const { width, height } = this.state.canvasSize;
        const canvasStyle = {
            width: MAX_CANVAS_SIZE,
            height: MAX_CANVAS_SIZE,
            gridTemplate: `repeat(${height}, ${CELL_SIZE}px) / repeat(${width}, ${CELL_SIZE}px)`,
        };

        return (
            <div
                style={canvasStyle}
                className={styles.canvas}
                onClick={() => {
                    this.drawRect({ x: 16, y: 1 }, { x: 23, y: 15 });
                    this.bucketFill({ x: 1, y: 1 });
                }}
            >
                {this.getCellElements()}
            </div>
        );
    }
}

export default Canvas;
