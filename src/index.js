#!/usr/bin/env node

const fs = require('fs');
const { gitStatus } = require('./git');
const { printFileStatus, printFolderStatus } = require('./print');

let counter = 0;

const checkCurrentFolder = async (currentPath, basePath, folderCount) => {
    try {
        const gitFolder = await gitStatus(currentPath, basePath);

        if (
            gitFolder &&
            (gitFolder.counter ||
                gitFolder.commitAheadMsg ||
                gitFolder.commitBehindMsg)
        ) {
            if (folderCount > 0) {
                printFolderStatus(currentPath, basePath, gitFolder);
            }

            printFileStatus(gitFolder);
            counter += 1;
        } else {
            const files = fs
                .readdirSync(currentPath)
                .sort((a, b) => a.localeCompare(b));

            for (let i = 0; i < files.length; i += 1) {
                const nextFile = `${currentPath}/${files[i]}`;
                if (
                    files[i] !== '.rvm' &&
                    files[i] !== '.vscode' &&
                    files[i] !== '.git' &&
                    files[i] !== 'node_modules' &&
                    files[i] !== 'node_modules.nosync' &&
                    fs.lstatSync(nextFile).isDirectory()
                ) {
                    const updateCount = folderCount + 1;
                    // eslint-disable-next-line no-await-in-loop
                    await checkCurrentFolder(nextFile, basePath, updateCount);
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const init = async () => {
    console.time('Done in');
    try {
        await checkCurrentFolder(process.cwd(), process.cwd(), 0);
        if (counter === 0) {
            const gitFolder = await gitStatus(
                process.cwd(),
                process.cwd(),
                true,
            );

            if (gitFolder) {
                printFileStatus(gitFolder);
                if (
                    !gitFolder.counter &&
                    !gitFolder.commitAheadMsg &&
                    !gitFolder.commitBehindMsg
                ) {
                    console.log();
                }
            } else {
                console.log();
            }
        }
    } catch (error) {
        console.log(error);
    }

    console.timeEnd('Done in');
    console.log();
};

init();
