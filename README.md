X-Drawer [live demo](https://x-drawer.herokuapp.com/).

## Available Scripts

Runs the app in the development mode:
### `npm start`

Unit testing with Enzyme:
### `npm test`

E2E testing with Hermione:
### `hermione`
:warning:Hermione needs additional software installation<br />
[Check this](https://brainhub.eu/blog/regression-testing-with-selenium/) for more information.

## Сommands list 

`C 20 4` - creating canvas 20x4, max canvas size is 100x100, min size is 2x2<br /><br />
`L 1 2 6 2` - drawing line from (1, 2) to (6, 2), the second point coordinates must be always<br />
greater than start point coordinates. Only vertical and horizontal lines supported.<br /><br />
`R 16 1 20 3` - drawing rect from left top corner coordinates and right bottom corner coordinates<br /><br />
`B 10 3 o` - fill area by symbol "o"(only a-z supported) with point (10, 3)<br />
