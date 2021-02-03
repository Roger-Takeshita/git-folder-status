#!/usr/bin/env node

const chalk = require('chalk');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const gitStatus = (currentPath) => {
    const gitExists = `${currentPath}/.git`;

    if (gitExists) {
        try {
            let mode = '';
            const stagedOld = [];
            const stagedNew = [];
            const modified = [];
            const untracked = [];
            const files = Buffer.from(execSync('git status')).toString();
            const filesArray = files
                .replace(/\t/gm, '')
                .replace(/modified:[ ]*/gm, '')
                .split('\n');

            for (let i = 0; i < filesArray.length; i += 1) {
                switch (filesArray[i]) {
                    case 'Changes to be committed:':
                        mode = 'staged';
                        continue;
                    case 'Changes not staged for commit:':
                        mode = 'modified';
                        continue;
                    case 'Untracked files:':
                        mode = 'untracked';
                        continue;
                    default:
                        break;
                }

                if (mode === 'staged' && filesArray[i] !== '' && !filesArray[i].includes('(use')) {
                    const file = filesArray[i].replace(/new file:[ ]*/gm, '');
                    if (file) {
                        stagedNew.push(file);
                    } else {
                        stagedOld.push(filesArray[i]);
                    }
                } else if (
                    mode === 'modified' &&
                    filesArray[i] !== '' &&
                    !filesArray[i].includes('(use')
                ) {
                    modified.push(filesArray[i]);
                } else if (
                    mode === 'untracked' &&
                    filesArray[i] !== '' &&
                    !filesArray[i].includes('(use')
                ) {
                    untracked.push(filesArray[i]);
                }
            }

            console.log({
                stagedOld,
                stagedNew,
                modified,
                untracked,
            });

            // const newFiles = files.match(/new file: (.)*/gi);
            // console.log('new files', newFiles);

            // const modifiedFiles = files.match(/modified: (.)*/gi);
            // const modifiedFiles1 = modifiedFiles.map((file) => file.replace(/modified:[ ]*/i, ''));
            // console.log('modified', modifiedFiles1);

            // const untrackedFiles = files.match(/Untracked files:([[.\n\W\w]*)/gi);
            // const untrackedFiles1 = untrackedFiles[0].replace(/\t/gm, '');
            // const untrackedFiles2 = untrackedFiles1.split('\n');
            // const untrackedFiles3 = untrackedFiles2.slice(2, untrackedFiles2.length - 3);
            // console.log('untracked', untrackedFiles3);
        } catch (error) {
            console.log(error);
        }
    }
};

gitStatus(process.cwd());
