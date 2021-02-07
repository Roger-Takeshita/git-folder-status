const chalk = require('chalk');
const path = require('path');
const { rgb, bgRgb } = require('./colors');

const printFileStatus = (files) => {
    console.log();
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
    console.log();
};

const printFolderStatus = (currentPath, folder) => {
    const folderName = path.basename(path.resolve(currentPath));

    if (folder.counter) {
        if (folder.untrackedFiles.length === folder.counter) {
            console.log(
                chalk`{${rgb.white}.${bgRgb.orangeD}.bold  ${folderName} }{${rgb.orange} }`,
            );
        } else {
            console.log(
                chalk`{${rgb.white}.${bgRgb.redD}.bold  ${folderName} }{${rgb.red} }`,
            );
        }
    } else if (folder.commitAheadMsg) {
        console.log(
            chalk`{${rgb.white}.${bgRgb.greenD}.bold  ${folderName} }{${rgb.green} }`,
        );
    }
};

module.exports = {
    printFileStatus,
    printFolderStatus,
};
