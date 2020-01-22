import React from 'react';
import styles from './CommandReader.module.css';
import { MAX_CANVAS_SIZE, Point } from '../Canvas/Canvas';
import { Validators } from '../../helpers/validators';

export enum CommandTypes {
    'C' = 'c',
    'L' = 'l',
    'R' = 'r',
    'B' = 'b',
}

export type CanvasSize = { width: number; height: number };
export type BucketFill = [Point, { color: string }];
export type DrawCommand = { command: CommandTypes; data: Point[] | BucketFill | CanvasSize };

interface CommandReaderProps {
    updateDrawCommands: (drawCommands: DrawCommand[]) => void;
}

interface CommandReaderState {
    commands: string;
    parsingError: boolean;
}

class CommandReader extends React.Component<CommandReaderProps, CommandReaderState> {
    state = {
        commands: '',
        parsingError: false,
    };

    commandValidation = (commands: string[]): DrawCommand[] => {
        const drawCommands: DrawCommand[] = [];
        let canvasSize = { width: 0, height: 0 };
        let validationData: DrawCommand['data'] | false = { width: 0, height: 0 };

        commands.forEach((command, index) => {
            switch (command[0]) {
                case CommandTypes.C:
                    validationData = Validators.canvasValidator(command, MAX_CANVAS_SIZE);
                    if (!canvasSize.width && validationData) {
                        drawCommands.push({ command: CommandTypes.C, data: validationData });
                        canvasSize = validationData as CanvasSize;
                    } else {
                        this.showError(index, command);
                    }
                    break;
                case CommandTypes.L:
                    validationData = Validators.lineValidator(command, canvasSize);
                    if (validationData) {
                        drawCommands.push({ command: CommandTypes.L, data: validationData });
                    } else {
                        this.showError(index, command);
                    }
                    break;
                case CommandTypes.R:
                    validationData = Validators.rectValidator(command, canvasSize);
                    if (validationData) {
                        drawCommands.push({ command: CommandTypes.R, data: validationData });
                    } else {
                        this.showError(index, command);
                    }
                    break;
                case CommandTypes.B:
                    validationData = Validators.brushValidator(command, canvasSize);
                    if (validationData) {
                        drawCommands.push({ command: CommandTypes.B, data: validationData });
                    } else {
                        this.showError(index, command);
                    }
                    break;
                default:
                    this.showError(index, command);
            }
        });

        return drawCommands;
    };

    showError = (lineIndex: number, command: string) => {
        this.setState({ parsingError: true });
        alert(`Parsing commands error on line ${++lineIndex} with command\n"${command}"`);
        throw Error('Parsing error');
    };

    executeCommands = () => {
        const commands = this.state.commands;
        const separateCommands = commands.split('\n').map((command: string) => command.trim().toLocaleLowerCase());

        try {
            const drawCommands = this.commandValidation(separateCommands);

            this.props.updateDrawCommands(drawCommands);
            this.setState({ parsingError: false });
        } catch (e) {
            console.log(e);
        }
    };

    handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ commands: e.target.value });
    };

    render() {
        return (
            <div className={styles.commandInput}>
                <textarea
                    className={`textarea has-fixed-size ${this.state.parsingError ? 'is-danger' : ''}`}
                    placeholder="Enter commands here"
                    onChange={this.handleChange}
                    value={this.state.commands}
                ></textarea>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <button onClick={this.executeCommands} className={`${styles.commandInput__button} button is-primary`}>
                    Let&apos;s draw
                </button>
            </div>
        );
    }
}

export default CommandReader;
