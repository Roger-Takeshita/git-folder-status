const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { rgb, bgRgb } = require('./colors');

class FileStatus {
    constructor() {
        this.stagedModifiedFiles = [];
        this.stagedNewFiles = [];
        this.stagedDeletedFiles = [];
        this.notStagedModifiedActiveFiles = [];
        this.notStagedDeletedFiles = [];
        this.untrackedFiles = [];
        this.unmergedFiles = [];
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
            case 'unmerged':
                this.unmergedFiles.push(file.name);
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
    let mode = '';
    let name = file;

    if (file.includes('deleted:')) {
        mode = 'deleted-file';
        name = file.replace(/deleted:[ ]*/gm, '');
    } else if (file.includes('new file:')) {
        mode = 'new-file';
    } else if (file.includes('both modified:')) {
        mode = 'unmerged-file';
        name = file.replace(/both modified:[ ]*/gm, '');
    } else if (file.includes('modified:')) {
        mode = 'modified-file';
        name = file.replace(/modified:[ ]*/gm, '');
    }

    return { mode, name };
};

const gitStatus = async (currentPath, basePath, middleFolder = false) => {
    if (fs.existsSync(`${currentPath}/.git`) || middleFolder) {
        try {
            process.chdir(currentPath);
            const folder = new FileStatus();
            let mode = '';
            const { stdout } = await exec('git status');
            const filesArray = stdout.replace(/\t/gm, '').split('\n');

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
                    case 'Unmerged paths:':
                        mode = 'unmerged';
                        continue;
                    default:
                        break;
                }

                if (mode && filesArray[i] && !filesArray[i].includes('(use')) {
                    folder.sortFile(checkFileStatus(filesArray[i]), mode);
                    folder.counter += 1;
                }
            }

            return folder;
        } catch (error) {
            if (!middleFolder) {
                const folderName = path.relative(basePath, currentPath);
                console.log(
                    chalk`{${rgb.white}.${bgRgb.redD}.bold  ${folderName} }{${rgb.red} }`,
                );
                console.log();
                console.log(
                    chalk`{${rgb.redD}.bold    ERROR:} Not a git repository {${rgb.blue} ${currentPath}}`,
                );
                console.log();
            }
        }
    }

    return undefined;
};

module.exports = {
    gitStatus,
};
