import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Canvas from './Canvas';
import CanvasCell, { CanvasCellType } from '../CanvasCell/CanvasCell';
import { CanvasSize } from '../CommandReader/CommandReader';

describe('Canvas', () => {
    const canvasSize = { width: 20, height: 4 };
    const canvas = shallow(<Canvas key="1" isDrawingComplete={true} drawCommands={[]} />);
    const instance = canvas.instance() as Canvas;

    instance.generateCanvas(canvasSize);

    it('Canvas generation', () => {
        expect(canvas.state('canvasCells')).to.have.lengthOf(canvasSize.height);
        expect((canvas.state('canvasCells') as CanvasCellType[][])[0]).to.have.lengthOf(canvasSize.width);
        expect((canvas.state('canvasCells') as CanvasCellType[][])[0][0]).to.deep.equal({
            cellRef: React.createRef<CanvasCell>(),
        });

        expect(canvas.state('canvasCellElements')).to.have.lengthOf(canvasSize.height);
        expect((canvas.state('canvasCellElements') as CanvasCellType[][])[0]).to.have.lengthOf(canvasSize.width);
        expect((canvas.state('canvasCellElements') as CanvasCellType[][])[0][0]).to.have.property('type', CanvasCell);

        expect(canvas.state('canvasSize') as CanvasSize).to.deep.equal(canvasSize);
    });

    it('Line drawing', () => {
        expect(instance.drawLine).to.be.an('Function');
        /*** there is no way to test because of refs ***/
    });

    it('Rect drawing', () => {
        expect(instance.drawRect).to.be.an('Function');
        /*** there is no way to test because of refs ***/
    });

    it('Bucket fill', () => {
        expect(instance.bucketFill).to.be.an('Function');
        /*** there is no way to test because of refs ***/
    });

    it('Generate text from drawing', () => {
        expect(instance.generateTextDrawing).to.be.an('Function');
        /*** there is no way to test because of refs ***/
    });
});
