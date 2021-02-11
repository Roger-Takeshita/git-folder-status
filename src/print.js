const chalk = require('chalk');
const path = require('path');
const { rgb, bgRgb } = require('./colors');

const printFileStatus = (files) => {
    if (files.commitAheadMsg || files.counter) console.log();
    if (files.commitAheadMsg) {
        console.log(
            chalk`    {${rgb.white}.${bgRgb.greenD}  C } {${rgb.greenD}.bold ${files.commitAheadMsg}}`,
        );
    }
    files.stagedNewFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.white}.${bgRgb.green}  N } {green ${file}}`,
        ),
    );
    files.stagedModifiedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.white}.${bgRgb.green}  M } {green ${file}}`,
        ),
    );
    files.stagedDeletedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.white}.${bgRgb.green}  D } {green ${file}}`,
        ),
    );
    files.notStagedModifiedActiveFiles.forEach((file) =>
        console.log(chalk`    {${rgb.white}.${bgRgb.red}  M } {red ${file}}`),
    );
    files.notStagedDeletedFiles.forEach((file) =>
        console.log(chalk`    {${rgb.white}.${bgRgb.red}  D } {red ${file}}`),
    );
    files.untrackedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.white}.${bgRgb.orange}  ? } {${rgb.orange} ${file}}`,
        ),
    );
    files.unmergedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.white}.${bgRgb.blue}  U } {${rgb.blue} ${file}}`,
        ),
    );
    if (files.commitAheadMsg || files.counter) console.log();
};

const printFolderStatus = (currentPath, basePath, gitFolder) => {
    const folderName = path.relative(basePath, currentPath);

    if (gitFolder.counter) {
        if (gitFolder.untrackedFiles.length === gitFolder.counter) {
            console.log(
                chalk`{${rgb.white}.${bgRgb.orangeD}.bold  ${folderName} }{${rgb.orange} }`,
            );
        } else {
            console.log(
                chalk`{${rgb.white}.${bgRgb.redD}.bold  ${folderName} }{${rgb.red} }`,
            );
        }
    } else if (gitFolder.commitAheadMsg) {
        console.log(
            chalk`{${rgb.white}.${bgRgb.greenD}.bold  ${folderName} }{${rgb.green} }`,
        );
    }
};

module.exports = {
    printFileStatus,
    printFolderStatus,
};
