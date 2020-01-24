import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import CommandReader from '../CommandReader/CommandReader';

describe('Command reader', () => {
    const commandReader = shallow(
        <CommandReader isDrawingComplete={true} setDrawingComplete={() => true} updateDrawCommands={() => []} />,
    );
    const instance = commandReader.instance() as CommandReader;

    it('Command validation', () => {
        const drawCommands = ['c 20  20', 'r 1  5 9 9', 'l 1  5 19 5', 'b 10 3 q'];
        const wrongCommands = ['c 20  20', 'r 1  5 9 9', 'l 5  5 19 5', 'p 10 3 q'];
        window.alert = jest.fn();

        expect(instance.commandValidation(drawCommands).length).to.equal(4);
        expect(() => instance.commandValidation(wrongCommands)).to.throw();
    });
});
