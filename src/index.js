#!/usr/bin/env node

const fs = require('fs');

const fsPromises = fs.promises;
const { gitStatus } = require('./git');
const { printFileStatus, printFolderStatus } = require('./print');

const checkCurrentFolder = async (currentPath, counter) => {
    const gitFolder = await gitStatus(currentPath);

    if (!gitFolder) {
        const dir = await fsPromises.opendir(currentPath);
        let dirent = await dir.read();
        while (dirent !== null) {
            const nextPath = `${currentPath}/${dirent.name}`;
            // eslint-disable-next-line no-await-in-loop
            const nextDir = await fsPromises.lstat(nextPath);

            if (nextDir.isDirectory()) {
                if (
                    dirent.name !== '.git' &&
                    dirent.name !== 'node_modules' &&
                    dirent.name !== 'node_modules.nosync'
                ) {
                    checkCurrentFolder(nextPath, (counter += 1));
                }
            }
            // eslint-disable-next-line no-await-in-loop
            dirent = await dir.read();
        }

        await dir.close();
    }

    if (gitFolder && (gitFolder.counter || gitFolder.commitAheadMsg)) {
        if (counter > 0) printFolderStatus(currentPath, gitFolder);
        printFileStatus(gitFolder);
    }
};

checkCurrentFolder(process.cwd(), 0);
