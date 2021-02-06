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

const gitStatus = async (currentPath) => {
    if (fs.existsSync(`${currentPath}/.git`)) {
        try {
            const folder = new FileStatus();
            process.chdir(currentPath);
            let mode = '';
            const { stdout } = await exec('git status');
            const filesArray = stdout
                .replace(/\t/gm, '')
                .replace(/modified:[ ]*/gm, '')
                .split('\n');

            for (let i = 0; i < filesArray.length; i += 1) {
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
                    const file = checkFileStatus(filesArray[i]);

                    folder.sortFile(file, mode);
                    folder.counter++;
                }
            }

            if (folder.counter) {
                console.log(path.basename(path.resolve(currentPath)));
                console.log(folder);
            }

            return true;
        } catch (error) {
            console.log(error);
        }
    }

    return false;
};

module.exports = {
    gitStatus,
};
