import React from 'react';
import styles from './Canvas.module.css';

import CanvasCell, { CanvasCellType } from '../CanvasCell/CanvasCell';
import { trampoline } from '../../helpers/trampoline';
import { BucketFill, CanvasSize, CommandTypes, DrawCommand } from '../CommandReader/CommandReader';

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
    canvasCells: CanvasCellType[][];
    canvasCellElements: React.ReactElement<CanvasCell>[][];
    drawCommands: DrawCommand[];
    prevColor: string;
    drawingAsText: string;
}

class Canvas extends React.Component<CanvasProps, CanvasState> {
    state = {
        canvasSize: { width: 1, height: 1 },
        canvasCells: new Array<Array<CanvasCellType>>(),
        canvasCellElements: new Array<Array<React.ReactElement<CanvasCell>>>(),
        drawCommands: this.props.drawCommands,
        prevColor: ' ',
        drawingAsText: '',
    };

    componentDidMount() {
        this.draw();
    }

    draw = () => {
        const { prevColor, canvasCells } = this.state;
        const drawCommands: DrawCommand[] = JSON.parse(JSON.stringify(this.state.drawCommands));
        const drawCommand = drawCommands.shift();
        let drawColor = ' ';

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
                    // avoiding same area with same color repainting
                    const point = (drawCommand.data as BucketFill)[0];
                    const startPointColor = canvasCells[point.y - 1][point.x - 1].cellRef!.current!.getFill();

                    drawColor = (drawCommand.data as BucketFill)[1].color;
                    if (prevColor !== drawColor || startPointColor !== drawColor) {
                        this.bucketFill(drawCommand.data as BucketFill, startPointColor);
                    }
                    break;
                default:
                    break;
            }

            // after drawing command completed, updating state first, than continue drawing
            this.setState({ prevColor: drawColor, drawCommands }, () => {
                this.addDrawingAsText(drawCommand);
                this.draw();
            });
        }
    };

    addDrawingAsText = (drawCommand: DrawCommand) => {
        const drawingAsText = this.generateTextDrawing();

        if (drawCommand.command === CommandTypes.C) {
            this.setState({ drawingAsText });
        } else {
            let prevDrawingAsText = this.state.drawingAsText.slice();

            prevDrawingAsText += drawingAsText;
            this.setState({ drawingAsText: prevDrawingAsText });
        }
    };

    generateCanvas = (canvasSize: CanvasSize) => {
        const { width, height } = canvasSize;
        const canvasCells: CanvasState['canvasCells'] = [];
        const canvasCellElements: React.ReactElement[][] = [];

        for (let i = 0; i < height; i++) {
            canvasCells.push([]);
            canvasCellElements.push([]);
            for (let j = 0; j < width; j++) {
                const cellRef = React.createRef<CanvasCell>();
                const cellFontSize =
                    canvasSize.width >= canvasSize.height
                        ? MAX_CANVAS_RESOLUTION.width / canvasSize.width
                        : MAX_CANVAS_RESOLUTION.height / canvasSize.height;

                canvasCells[i].push({ cellRef });
                canvasCellElements[i].push(
                    <CanvasCell fontSize={cellFontSize} ref={canvasCells[i][j].cellRef} key={i + '' + j} />,
                );
            }
        }

        this.setState({ canvasCells, canvasCellElements, canvasSize });
    };

    drawLine = (points: Point[]) => {
        let lineLength = 0;
        let startPoint = 0;
        let drawDirection: DrawDirections = DrawDirections.X;
        const canvasCells = [...this.state.canvasCells];
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
                canvasCells[point1.y - 1][i - 1].cellRef!.current!.fillSelf(DRAW_SYMBOL);
            } else {
                canvasCells[i - 1][point1.x - 1].cellRef!.current!.fillSelf(DRAW_SYMBOL);
            }
        }

        this.setState({ canvasCells });
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

    // using trampoline helper to avoid stack overflow
    bucketFill = (fillData: BucketFill, startPointColor: string) => {
        const { canvasCells } = this.state;
        const [point, color] = fillData;

        trampoline(this.fillCells)(startPointColor, { x: point.x - 1, y: point.y - 1 }, color.color, canvasCells);
    };

    fillCells = (
        startPointContent: string,
        { x, y }: Point,
        color: string,
        canvasCells: CanvasState['canvasCells'],
    ): [] | Function[] => {
        const { canvasSize } = this.state;
        const acc: Function[] = [];
        const addFn = ({ x, y }: Point) => {
            if (canvasCells[y][x].cellRef.current!.getFill() === startPointContent) {
                canvasCells[y][x].cellRef.current!.fillSelf(color);
                acc.push(() => this.fillCells(startPointContent, { x, y }, color, canvasCells));
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
        const { canvasCells } = this.state;
        const repeatCount = width > height ? width + 2 : height + 2;
        let str = '-'.repeat(repeatCount) + '\n';

        for (let i = 0; i < height; i++) {
            str += '|';
            for (let j = 0; j < width; j++) {
                const fill = canvasCells[i][j].cellRef!.current!.getFill() || ' ';
                str += fill;
            }
            str += '|\n';
        }
        str += '-'.repeat(repeatCount) + '\n';

        return str;
    };

    exportDrawing = () => {
        const element = document.createElement('a');
        const file = new Blob([this.state.drawingAsText], { type: 'text/plain' });

        element.href = URL.createObjectURL(file);
        element.download = 'drawing.txt';
        element.click();
    };

    render() {
        const { width, height } = this.state.canvasSize;
        const { canvasCellElements, canvasSize, canvasCells } = this.state;
        const scale = { width: 1, height: 1 };

        if (canvasSize.width > canvasSize.height) {
            scale.width = canvasSize.width / canvasSize.height;
        } else {
            scale.height = canvasSize.height / canvasSize.width;
        }

        const canvasStyle = {
            width: MAX_CANVAS_RESOLUTION.width,
            height: MAX_CANVAS_RESOLUTION.height,
            gridTemplate: `repeat(${height}, ${MAX_CANVAS_RESOLUTION.height /
                canvasSize.height /
                scale.width}px) / repeat(${width}, ${MAX_CANVAS_RESOLUTION.width / canvasSize.width / scale.height}px)`,
        };

        return (
            <div>
                <div style={canvasStyle} className={styles.canvas}>
                    {canvasCellElements}
                </div>
                <button
                    disabled={!this.props.isDrawingComplete || canvasCells.length === 0}
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
