const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const rgb = {
    white: 'rgb(255,255,255)',
    green: 'rgb(51, 153, 51)',
    orange: 'rgb(255, 153, 51)',
    red: 'rgb(255, 77, 77)',
};

const bgRgb = {
    green: 'bgRgb(51, 153, 51)',
    greenD: 'bgRgb(0, 102, 0)',
    orange: 'bgRgb(255, 153, 51)',
    orangeD: 'bgRgb(255, 102, 0)',
    red: 'bgRgb(255, 77, 77)',
    redD: 'bgRgb(204, 0, 0)',
};

class FileStatus {
    constructor() {
        this.stagedModifiedFiles = [];
        this.stagedNewFiles = [];
        this.stagedDeletedFiles = [];
        this.notStagedModifiedActiveFiles = [];
        this.notStagedDeletedFiles = [];
        this.untrackedFiles = [];
        this.commitAheadMsg = '';
        this.counter = 0;
    }
    sortFile(file, mode) {
        switch (mode) {
            case 'staged':
                if (file.mode === 'modified-file') {
                    this.stagedModifiedFiles.push(file.name);
                } else if (file.mode === 'deleted-file') {
                    this.stagedDeletedFiles.push(file.name);
                } else {
                    this.stagedNewFiles.push(file.name);
                }
                break;
            case 'not-staged':
                if (file.mode === 'modified-file') {
                    this.notStagedModifiedActiveFiles.push(file.name);
                } else {
                    this.notStagedDeletedFiles.push(file.name);
                }
                break;
            default:
                this.untrackedFiles.push(file.name);
                break;
        }
    }
    updateCommitAheadMsg(msg) {
        this.commitAheadMsg = msg;
    }
}

const checkFileStatus = (file) => {
    let mode = 'modified-file';
    let name = file;

    if (file.includes('deleted:')) {
        mode = 'deleted-file';
        name = file.replace(/deleted:[ ]*/gm, '');
    } else if (file.includes('new file:')) {
        mode = 'new-file';
        name = file.replace(/new file:[ ]*/gm, '');
    }

    return { mode, name };
};

const printFileStatus = (files) => {
    console.log();
    if (files.commitAheadMsg) {
        console.log(
            chalk`    {${rgb.white}.${bgRgb.green}  C } {green ${files.commitAheadMsg}}`,
        );
    }
    files.stagedModifiedFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.white}.${bgRgb.green}  M } {green ${file}}`,
        ),
    );
    files.stagedNewFiles.forEach((file) =>
        console.log(
            chalk`    {${rgb.white}.${bgRgb.green}  N } {green ${file}}`,
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

const gitStatus = async (currentPath) => {
    if (fs.existsSync(`${currentPath}/.git`)) {
        try {
            process.chdir(currentPath);
            const folder = new FileStatus();
            let mode = '';
            const { stdout } = await exec('git status');
            const filesArray = stdout
                .replace(/\t/gm, '')
                .replace(/modified:[ ]*/gm, '')
                .split('\n');

            for (let i = 0; i < filesArray.length; i += 1) {
                if (mode === '') {
                    const ahead = filesArray[i].match(/Your branch is ahead.+/);

                    if (ahead) {
                        folder.updateCommitAheadMsg(ahead[0]);
                        continue;
                    }
                }

                switch (filesArray[i]) {
                    case 'Changes to be committed:':
                        mode = 'staged';
                        continue;
                    case 'Changes not staged for commit:':
                        mode = 'not-staged';
                        continue;
                    case 'Untracked files:':
                        mode = 'untracked';
                        continue;
                    default:
                        break;
                }

                if (mode && filesArray[i] && !filesArray[i].includes('(use')) {
                    folder.sortFile(checkFileStatus(filesArray[i]), mode);
                    folder.counter++;
                }
            }

            if (folder.counter || folder.commitAheadMsg) {
                printFolderStatus(currentPath, folder);
                printFileStatus(folder);
            }

            return true;
        } catch (error) {
            const folderName = path.basename(path.resolve(currentPath));
            console.log(
                chalk`{${rgb.white}.${bgRgb.redD}.bold  ${folderName} }{${rgb.red} }`,
            );
            console.log();
            console.log(
                chalk.red.bold('    ERROR: ') +
                    `Not a git repository ` +
                    chalk.rgb(0, 102, 255)(currentPath),
            );
            console.log();
        }
    }

    return false;
};

module.exports = {
    gitStatus,
};
