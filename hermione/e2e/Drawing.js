// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const filePath = path.join(__dirname, 'input.txt');

it('Set the value of textarea and drawing', function() {
    return this.browser
        .url('/')
        .setValue('textarea', 'C 20 4\n' + 'L 1 2 6 2\n' + 'L 6 3 6 4\n' + 'R 16 1 20 3\n' + 'B 10 3 o')
        .click('[class*="commandInput__button"]')
        .assertView('Canvas', '[class*="canvas"]');
});

it('Set the value of textarea from file and drawing', function() {
    return this.browser
        .url('/')
        .chooseFile('.file-input', filePath)
        .click('[class*="commandInput__button"]')
        .assertView('Canvas', '[class*="canvas"]');
});

it('Try drawing with wrong commands', function() {
    return this.browser
        .url('/')
        .setValue('textarea', 'C 20 4\n' + 'L 1 2 16 2\n' + 'L 6 3 6 4\n' + 'R 16 1 0 3\n' + 'B 10 3 1')
        .click('[class*="commandInput__button"]')
        .alertAccept()
        .assertView('Text area 1', 'textarea')
        .setValue('textarea', 'L 1 2 1 5\n' + 'L 6 3 6 4\n' + 'R 10 1 15 3\n' + 'B 10 3 a')
        .click('[class*="commandInput__button"]')
        .alertAccept()
        .assertView('Text area 2', 'textarea');
});
