const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { rgb, rgbBG } = require('./colors');

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
        this.commitBehindMsg = '';
        this.branch = '';
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

    updateCommitBehindMsg(msg) {
        this.commitBehindMsg = msg;
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
            const { stdout: branch } = await exec('git branch --show-current');
            const { stdout: status } = await exec('git status');
            const filesArray = status.replace(/\t/gm, '').split('\n');

            folder.branch = branch.replace(/\n/gm, '');
            for (const file of filesArray) {
                if (mode === '') {
                    const ahead = file.match(/Your branch is ahead.+/);
                    if (ahead) {
                        folder.updateCommitAheadMsg(ahead[0]);
                        continue;
                    }

                    const behind = file.match(/Your branch is behind.+/);
                    if (behind) {
                        folder.updateCommitBehindMsg(behind[0]);
                        continue;
                    }
                }

                switch (file) {
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

                if (mode && file && !file.includes('(use')) {
                    folder.sortFile(checkFileStatus(file), mode);
                    folder.counter += 1;
                }
            }

            return folder;
        } catch (error) {
            if (!middleFolder) {
                const folderName = path.relative(basePath, currentPath);
                console.log(
                    chalk`{${rgb.WHT}.${rgbBG.RDD}.bold  ${folderName} }{${rgb.RD} }`,
                );
                console.log();
                console.log(
                    chalk`{${rgb.RDD}.bold   ERROR:} Not a git repo or something is wrong with your .git folder.\n         {${rgb.BL} ${currentPath}}`,
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
