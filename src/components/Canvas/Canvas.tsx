import React from 'react';
import styles from './Canvas.module.css';

import CanvasCell, { CanvasCellType } from '../CanvasCell/CanvasCell';
import { trampoline } from '../../helpers/trampoline';
import { BucketFill, CanvasSize, CommandTypes, DrawCommand } from '../CommandReader/CommandReader';
import { canvasCellCalculator } from '../../helpers/canvasCellCalculator';

export const MAX_CANVAS_SIZE = { width: 100, height: 100 }; // canvas maximum cells count
export const MAX_CANVAS_RESOLUTION = { width: 500, height: 500 }; // canvas size in px, cells size calculate dynamically in proportion to width and height
const DRAW_SYMBOL = 'x';

export type Point = { x: number; y: number };

enum DrawDirections {
    'X',
    'Y',
}

interface CanvasProps {
    drawCommands: DrawCommand[];
    isDrawingComplete: boolean;
}

interface CanvasState {
    canvasSize: CanvasSize;
    drawCommands: DrawCommand[];
}

// store elements and refs to them in the class fields, because an imperative approach
// for Canvas component is most likely the best solution despite react philosophy
class Canvas extends React.Component<CanvasProps, CanvasState> {
    canvasCellElements: React.ReactElement[][];
    canvasCells: CanvasCellType[][];
    drawingAsText: string;
    state = {
        canvasSize: { width: 1, height: 1 },
        drawCommands: this.props.drawCommands,
    };

    constructor(props: CanvasProps) {
        super(props);
        this.drawingAsText = '';
        this.canvasCells = new Array<Array<CanvasCellType>>();
        this.canvasCellElements = new Array<Array<React.ReactElement<CanvasCell>>>();
    }

    componentDidMount() {
        this.draw();
    }

    draw = () => {
        const drawCommands: DrawCommand[] = JSON.parse(JSON.stringify(this.state.drawCommands));
        const drawCommand = drawCommands.shift();

        if (drawCommand) {
            switch (drawCommand.command) {
                case CommandTypes.C:
                    this.generateCanvas(drawCommand.data as CanvasSize);
                    break;
                case CommandTypes.L:
                    this.drawLine(drawCommand.data as Point[]);
                    break;
                case CommandTypes.R:
                    this.drawRect(drawCommand.data as Point[]);
                    break;
                case CommandTypes.B:
                    this.bucketFill(drawCommand.data as BucketFill);
                    break;
                default:
                    break;
            }

            this.setState({ drawCommands }, () => {
                this.addDrawingAsText(drawCommand);
                this.draw();
            });
        }
    };

    addDrawingAsText = (drawCommand: DrawCommand) => {
        const drawingAsText = this.generateTextDrawing();

        if (drawCommand.command === CommandTypes.C) {
            this.drawingAsText = drawingAsText;
        } else {
            this.drawingAsText += drawingAsText;
        }
    };

    generateCanvas = (canvasSize: CanvasSize) => {
        const { width, height } = canvasSize;
        const cellFontSize =
            canvasSize.width >= canvasSize.height
                ? MAX_CANVAS_RESOLUTION.width / canvasSize.width
                : MAX_CANVAS_RESOLUTION.height / canvasSize.height;

        for (let i = 0; i < height; i++) {
            this.canvasCells.push([]);
            this.canvasCellElements.push([]);
            for (let j = 0; j < width; j++) {
                const cellRef = React.createRef<CanvasCell>();

                this.canvasCells[i].push({ cellRef });
                this.canvasCellElements[i].push(
                    <CanvasCell fontSize={cellFontSize} ref={this.canvasCells[i][j].cellRef} key={i + '' + j} />,
                );
            }
        }
        this.setState({ canvasSize });
    };

    drawLine = (points: Point[]) => {
        let lineLength = 0;
        let startPoint = 0;
        let drawDirection: DrawDirections = DrawDirections.X;
        const [point1, point2] = points;

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
                this.canvasCells[point1.y - 1][i - 1].cellRef!.current!.fillSelf(DRAW_SYMBOL);
            } else {
                this.canvasCells[i - 1][point1.x - 1].cellRef!.current!.fillSelf(DRAW_SYMBOL);
            }
        }
    };

    drawRect = (points: Point[]) => {
        const [point1, point2] = points;
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

        rectangleSides.forEach(side => this.drawLine([side.point1, side.point2]));
    };

    bucketFill = (fillData: BucketFill) => {
        const [point, fillColor] = fillData;
        const startPointColor = this.canvasCells[point.y - 1][point.x - 1].cellRef!.current!.getColor();

        // using trampoline helper to avoid stack overflow
        trampoline(this.fillCells)(
            startPointColor,
            { x: point.x - 1, y: point.y - 1 },
            fillColor.color,
            this.canvasCells,
        );
    };

    fillCells = (
        startPointColor: string,
        { x, y }: Point,
        fillColor: string,
        canvasCells: CanvasCellType[][],
    ): [] | Function[] => {
        const { canvasSize } = this.state;
        const acc: Function[] = [];
        const addFn = ({ x, y }: Point) => {
            const currCell = canvasCells[y][x].cellRef.current!;

            if (currCell.getColor() === startPointColor && startPointColor !== fillColor) {
                currCell.fillSelf(fillColor);
                acc.push(() => this.fillCells(startPointColor, { x, y }, fillColor, canvasCells));
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

        return acc.length === 0 ? [] : acc;
    };

    generateTextDrawing = (): string => {
        const { width, height } = this.state.canvasSize;
        const repeatCount = width > height ? width + 2 : height + 2;
        let str = '-'.repeat(repeatCount) + '\n';

        for (let i = 0; i < height; i++) {
            str += '|';
            for (let j = 0; j < width; j++) {
                const fill = this.canvasCells[i][j].cellRef!.current!.getColor() || ' ';
                str += fill;
            }
            str += '|\n';
        }
        str += '-'.repeat(repeatCount) + '\n';

        return str;
    };

    exportDrawing = () => {
        const element = document.createElement('a');
        const file = new Blob([this.drawingAsText], { type: 'text/plain' });

        element.href = URL.createObjectURL(file);
        element.download = 'drawing.txt';
        element.click();
    };

    render() {
        const { width, height } = this.state.canvasSize;
        const { canvasSize } = this.state;
        const cellSize = canvasCellCalculator(canvasSize);
        const canvasStyle = {
            width: MAX_CANVAS_RESOLUTION.width,
            height: MAX_CANVAS_RESOLUTION.height,
            gridTemplate: `repeat(${height}, ${cellSize.height}px) / repeat(${width}, ${cellSize.width}px)`,
        };

        return (
            <div>
                <div style={canvasStyle} className={styles.canvas}>
                    {this.canvasCellElements}
                </div>
                <button
                    disabled={!this.props.isDrawingComplete || this.canvasCells.length === 0}
                    onClick={this.exportDrawing}
                    className={`button ${styles.canvas__exportButton}`}
                >
                    Export
                </button>
            </div>
        );
    }
}

export default Canvas;
