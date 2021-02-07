const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

const printStatus = (files) => {
    console.log();
    if (files.commitAheadMsg) {
        console.log(
            chalk`    {rgb(255,255,255).bgRgb(51, 153, 51)  C } {green ${files.commitAheadMsg}}`,
        );
    }
    files.stagedModifiedFiles.forEach((file) =>
        console.log(
            chalk`    {rgb(255,255,255).bgRgb(51, 153, 51)  M } {green ${file}}`,
        ),
    );
    files.stagedNewFiles.forEach((file) =>
        console.log(
            chalk`    {rgb(255,255,255).bgRgb(51, 153, 51)  N } {green ${file}}`,
        ),
    );
    files.stagedDeletedFiles.forEach((file) =>
        console.log(
            chalk`    {rgb(255,255,255).bgRgb(51, 153, 51)  D } {green ${file}}`,
        ),
    );
    files.notStagedModifiedActiveFiles.forEach((file) =>
        console.log(
            chalk`    {rgb(255,255,255).bgRgb(255, 77, 77)  M } {red ${file}}`,
        ),
    );
    files.notStagedDeletedFiles.forEach((file) =>
        console.log(
            chalk`    {rgb(255,255,255).bgRgb(255, 77, 77)  D } {red ${file}}`,
        ),
    );
    files.untrackedFiles.forEach((file) =>
        console.log(
            chalk`    {rgb(255,255,255).bgRgb(230, 138, 0)  ? } {rgb(230, 138, 0) ${file}}`,
        ),
    );
    console.log();
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
                const folderName = path.basename(path.resolve(currentPath));
                console.log(
                    chalk`{rgb(255, 255, 255).bgRgb(128, 179, 255)  }{rgb(255, 0, 0).bgRgb(128, 179, 255).bold ${folderName} }{rgb(26, 117, 255) }`,
                );
                printStatus(folder);
            }

            return true;
        } catch (error) {
            const folderName = path.basename(path.resolve(currentPath));
            console.log(
                chalk`{rgb(255, 255, 255).bgRgb(128, 179, 255)  }{rgb(255, 0, 0).bgRgb(128, 179, 255).bold ${folderName} }{rgb(26, 117, 255) }`,
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
