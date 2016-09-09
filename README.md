# webirc
Web IRC front end, intended to be used on OFTC.

### Installation

npm install

### Usage

./node_modules/.bin/webpack -p --config webpack.config.production.js
PORT={portnumber} NODE_ENV=production node .

### Development server
node .

The above will run on port 3000 and enable hot reloading

### Tests

./node_modules/.bin/karma start karma.config.js
