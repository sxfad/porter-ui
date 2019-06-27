/*eslint-disable*/
const fs = require('fs');
const exec = require('child_process').exec;

let packageString = fs.readFileSync('./package.json', 'utf-8');

const patt = /"version":[ ]*['"]([^'"]+)['"][,]/gm;
let block = null;
while ((block = patt.exec(packageString)) !== null) {
    if (block[0] && block[1]) {
        const vs = block[1].split('.').map(Number);
        const newVersion = `${vs[0]}.${vs[1]}.${(vs[2] + 1)}`;
        packageString = packageString.replace(block[1], newVersion);
        fs.writeFileSync('./package.json', packageString);

        exec("npm publish", function (error, stdout, stderr) {
            stdout && console.log(stdout);
            stderr && console.log(stderr);
        });
        console.log('publishing', newVersion);
    }
}
