#!/usr/bin/env node

const chalk = require('chalk');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { gitStatus } = require('./git');

const folders = (path) => {
    const dir = fs.opendirSync(path);
    let dirent;

    console.log(path);
    gitStatus(path);
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
};

folders(process.cwd());
