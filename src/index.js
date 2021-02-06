#!/usr/bin/env node

const fs = require('fs');
const { gitStatus } = require('./git');

const folders = async (path) => {
    const dir = fs.opendirSync(path);
    let dirent;

    const gitFolder = await gitStatus(path);
    if (!gitFolder) {
        while ((dirent = dir.readSync()) !== null) {
            const nextPath = `${path}/${dirent.name}`;
            if (fs.lstatSync(nextPath).isDirectory()) {
                if (
                    dirent.name !== '.git' &&
                    dirent.name !== 'node_modules' &&
                    dirent.name !== 'node_modules.nosync'
                ) {
                    folders(nextPath);
                }
            }
        }
        dir.closeSync();
    }
};

folders(process.cwd());
