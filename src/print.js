const chalk = require('chalk');
const path = require('path');
const { rgb, rgbBG } = require('./colors');

const printFileStatus = (files) => {
    if (files.commitAheadMsg || files.commitBehindMsg || files.counter) {
        console.log();
    }
    if (files.commitAheadMsg) {
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.GND}  C } {${rgb.GND}.bold ${files.commitAheadMsg}}`,
        );
    }
    if (files.commitBehindMsg) {
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.BLD}  B } {${rgb.BL}.bold ${files.commitBehindMsg}}`,
        );
    }
    files.stagedNewFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.GN}  N } {${rgb.GN} ${file}}`,
        ),
    );
    files.stagedModifiedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.GN}  M } {${rgb.GN} ${file}}`,
        ),
    );
    files.stagedDeletedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.GN}  D } {${rgb.GN} ${file}}`,
        ),
    );
    files.notStagedModifiedActiveFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.RD}  M } {${rgb.RD} ${file}}`,
        ),
    );
    files.notStagedDeletedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.RD}  D } {${rgb.RD} ${file}}`,
        ),
    );
    files.untrackedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.OG}  ? } {${rgb.OG} ${file}}`,
        ),
    );
    files.unmergedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.WHT}.${rgbBG.BL}  C } {${rgb.BL} ${file}}`,
        ),
    );
    if (files.commitAheadMsg || files.commitBehindMsg || files.counter) {
        console.log();
    }
};

const printFolderStatus = (currentPath, basePath, gitFolder) => {
    const folderName = path.relative(basePath, currentPath);

    if (gitFolder.counter) {
        if (gitFolder.untrackedFiles.length === gitFolder.counter) {
            console.log(
                chalk`{${rgb.WHT}.${rgbBG.OGD}.bold  ${folderName} }{${rgb.OG} }`,
            );
        } else {
            console.log(
                chalk`{${rgb.WHT}.${rgbBG.RDD}.bold  ${folderName} }{${rgb.RD} }`,
            );
        }
    } else if (gitFolder.commitAheadMsg) {
        console.log(
            chalk`{${rgb.WHT}.${rgbBG.GND}.bold  ${folderName} }{${rgb.GN} }`,
        );
    } else if (gitFolder.commitBehindMsg) {
        console.log(
            chalk`{${rgb.WHT}.${rgbBG.BLD}.bold  ${folderName} }{${rgb.BL} }`,
        );
    }
};

module.exports = {
    printFileStatus,
    printFolderStatus,
};
