#!/usr/bin/env node

const fs = require('fs');
const fsPromises = fs.promises;
const { gitStatus } = require('./git');

const folders = async (currentPath) => {
    const gitFolder = await gitStatus(currentPath);

    if (!gitFolder) {
        const dir = await fsPromises.opendir(currentPath);
        let dirent = await dir.read();

        while (dirent !== null) {
            const nextPath = `${currentPath}/${dirent.name}`;
            const nextDir = await fsPromises.lstat(nextPath);

            if (nextDir.isDirectory()) {
                if (
                    dirent.name !== '.git' &&
                    dirent.name !== 'node_modules' &&
                    dirent.name !== 'node_modules.nosync'
                ) {
                    folders(nextPath);
                }
            }

            dirent = await dir.read();
        }

        await dir.close();
    }
};

folders(process.cwd());
