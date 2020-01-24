import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import App from './App';
import { CommandTypes } from '../CommandReader/CommandReader';

describe('App', () => {
    const app = shallow(<App />);
    const instance = app.instance() as App;

    it('Set drawing commands', () => {
        const drawCommands = [{ command: CommandTypes.C, data: { width: 1, height: 1 } }];

        instance.setDrawCommands(drawCommands);
        expect(app.state('drawCommands')).to.deep.equal(drawCommands);
    });

    it('Set drawing complete', () => {
        expect(app.state('isDrawingComplete')).to.equal(true);
        instance.setDrawingComplete(false);
        expect(app.state('isDrawingComplete')).to.equal(false);
    });
});
