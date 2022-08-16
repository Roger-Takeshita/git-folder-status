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

            for (const file of files) {
                const nextFile = `${currentPath}/${file}`;

                if (
                    fs.lstatSync(nextFile).isDirectory() &&
                    ![
                        '.git',
                        '.rvm',
                        '.vscode',
                        'build',
                        'coverage',
                        'dist',
                        'node_modules',
                        'node_modules.nosync',
                        'site-packages',
                        'tmp',
                    ].includes(file)
                ) {
                    const updateCount = folderCount + 1;
                    // eslint-disable-next-line no-await-in-loop
                    await checkCurrentFolder(nextFile, basePath, updateCount);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const init = async () => {
    console.time('  Done in');

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
            } else {
                console.log();
            }
        }
    } catch (error) {
        console.error(error);
    }

    console.timeEnd('  Done in');
    console.log();
    process.exit(0);
};

init();
