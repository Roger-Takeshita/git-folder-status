#!/usr/bin/env node

const fs = require('fs');

const { gitStatus } = require('./git');
const { printFileStatus, printFolderStatus } = require('./print');

const checkCurrentFolder = async (currentPath, basePath, counter) => {
    try {
        const gitFolder = await gitStatus(currentPath, basePath);

        if (gitFolder && (gitFolder.counter || gitFolder.commitAheadMsg)) {
            if (counter > 0) {
                printFolderStatus(currentPath, basePath, gitFolder);
            }

            printFileStatus(gitFolder);
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
                    const newCounter = counter + 1;
                    // eslint-disable-next-line no-await-in-loop
                    await checkCurrentFolder(nextFile, basePath, newCounter);
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const init = async () => {
    console.time('Done in');
    await checkCurrentFolder(process.cwd(), process.cwd(), 0);
    console.log();
    console.timeEnd('Done in');
    console.log();
};

init();
