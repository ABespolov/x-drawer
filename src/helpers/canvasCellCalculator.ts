import { CanvasSize } from '../components/CommandReader/CommandReader';
import { MAX_CANVAS_RESOLUTION } from '../components/Canvas/Canvas';

export const canvasCellCalculator = (canvasSize: CanvasSize): CanvasSize => {
    const scale = { width: 1, height: 1 };

    if (canvasSize.width > canvasSize.height) {
        scale.width = canvasSize.width / canvasSize.height;
    } else {
        scale.height = canvasSize.height / canvasSize.width;
    }

    const height = MAX_CANVAS_RESOLUTION.height / canvasSize.height / scale.width;
    const width = MAX_CANVAS_RESOLUTION.width / canvasSize.width / scale.height;

    return { width, height };
};
