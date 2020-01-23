import { Point } from '../components/Canvas/Canvas';
import { BucketFill, CanvasSize } from '../components/CommandReader/CommandReader';

export const Validators = {
    canvasValidator(command: string, maxCanvasSize: CanvasSize): CanvasSize | false {
        const canvasRegExp = new RegExp('^c +[0-9]{1,3} +[0-9]{1,3}$');

        if (canvasRegExp.test(command)) {
            const canvasSizeArr = command.split(/ +/).slice(-2);
            const canvasSize: CanvasSize = { width: +canvasSizeArr[0], height: +canvasSizeArr[1] };

            if (
                canvasSize.width > 0 &&
                canvasSize.height > 0 &&
                canvasSize.width <= maxCanvasSize.width &&
                canvasSize.height <= maxCanvasSize.height
            ) {
                return canvasSize;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    lineValidator(command: string, canvasSize: CanvasSize): Point[] | false {
        const lineRegExp = new RegExp('^l +[0-9]{1,3} +[0-9]{1,3} +[0-9]{1,3} +[0-9]{1,3}$');

        if (lineRegExp.test(command)) {
            const values = command.split(/ +/).slice(-4);
            const point1: Point = { x: +values[0], y: +values[1] };
            const point2: Point = { x: +values[2], y: +values[3] };

            if (point2.x < 0 || point2.x > canvasSize.width || point2.y < 0 || point2.y > canvasSize.height) {
                return false;
            } else if (point1.x > point2.x || point1.y > point2.y) {
                return false;
            } else if (point1.x !== point2.x && point1.y !== point2.y) {
                return false;
            } else {
                return [point1, point2];
            }
        } else {
            return false;
        }
    },
    rectValidator(command: string, canvasSize: CanvasSize): Point[] | false {
        const rectRegExp = new RegExp('^r +[0-9]{1,3} +[0-9]{1,3} +[0-9]{1,3} +[0-9]{1,3}$');
        if (rectRegExp.test(command)) {
            const values = command.split(/ +/).slice(-4);
            const point1: Point = { x: +values[0], y: +values[1] };
            const point2: Point = { x: +values[2], y: +values[3] };
            if (point2.x < 0 || point2.x > canvasSize.width || point2.y < 0 || point2.y > canvasSize.height) {
                return false;
            } else if (point1.x > point2.x || point1.y > point2.y) {
                return false;
            } else {
                return [point1, point2];
            }
        } else {
            return false;
        }
    },
    brushValidator(command: string, canvasSize: CanvasSize): BucketFill | false {
        const fillRegExp = new RegExp('^b +[0-9]{1,3} +[0-9]{1,3} +[a-z]$');

        if (fillRegExp.test(command)) {
            const fillPoint = command.split(/ +/).slice(1, -1);
            const color = command.split(/ +/).slice(-1)[0];
            const point: Point = { x: +fillPoint[0], y: +fillPoint[1] };

            if (point.x > 0 && point.y > 0 && point.x <= canvasSize.width && point.y <= canvasSize.height) {
                return [point, { color }];
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
};
