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
    setDrawComplete: (v: boolean) => void;
    isDrawComplete: boolean;
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

        console.log(commands);
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
        const commands = this.state.commands.slice().trim();
        const separateCommands = commands
            .split(/\n+/)
            .map(command => command.toLocaleLowerCase())
            .filter(command => !/^\s*$/.test(command));

        this.props.setDrawComplete(false);

        // avoiding UI freeze
        setTimeout(() => {
            try {
                const drawCommands = this.commandValidation(separateCommands);

                this.props.updateDrawCommands(drawCommands);
                this.props.setDrawComplete(true);
                this.setState({ parsingError: false });
            } catch (e) {
                console.log(e);
                this.props.setDrawComplete(true);
            }
        });
    };

    handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ commands: e.target.value });
    };

    loadFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = async (e: ProgressEvent<FileReader>) => this.setState({ commands: String(e.target!.result) });
        reader.readAsText(e.target.files![0]);
    };

    render() {
        const { isDrawComplete } = this.props;

        return (
            <div className={styles.commandInput}>
                <div className={`control ${styles.commandInput__control} ${!isDrawComplete ? 'is-loading' : ''}`}>
                    <textarea
                        disabled={!isDrawComplete}
                        className={`textarea has-fixed-size ${this.state.parsingError ? 'is-danger' : ''}`}
                        placeholder="Enter commands here"
                        onChange={this.handleChange}
                        value={this.state.commands}
                    ></textarea>
                </div>
                <div className={styles.commandInput__controls}>
                    <button
                        disabled={!isDrawComplete}
                        onClick={this.executeCommands}
                        className={`${styles.commandInput__button} ${
                            !isDrawComplete ? 'is-loading' : ''
                        } button is-primary`}
                    >
                        Let&apos;s draw
                    </button>
                    <div className="file">
                        <label className="file-label">
                            <input
                                disabled={!isDrawComplete}
                                className="file-input"
                                type="file"
                                name="resume"
                                onChange={this.loadFromFile.bind(this)}
                            />
                            <span className="file-cta">
                                <span className="file-icon">
                                    <i className="fas fa-upload"></i>
                                </span>
                                <span className="file-label">Load config...</span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        );
    }
}

export default CommandReader;
