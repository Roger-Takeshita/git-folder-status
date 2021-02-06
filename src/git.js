const chalk = require('chalk');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

const listPusher = (
    file,
    mode,
    stagedNewFiles,
    stagedModifiedFiles,
    stagedDeletedFiles,
    notStagedModifiedActiveFiles,
    notStagedDeletedFiles,
    untrackedFiles,
) => {
    switch (mode) {
        case 'staged':
            if (file.mode === 'modified-file') {
                stagedModifiedFiles.push(file.name);
            } else if (file.mode === 'deleted-file') {
                stagedDeletedFiles.push(file.name);
            } else {
                stagedNewFiles.push(file.name);
            }
            break;
        case 'not-staged':
            if (file.mode === 'modified-file') {
                notStagedModifiedActiveFiles.push(file.name);
            } else {
                notStagedDeletedFiles.push(file.name);
            }
            break;
        default:
            untrackedFiles.push(file.name);
            break;
    }
};

const gitStatus = async (path) => {
    if (fs.existsSync(`${path}/.git`)) {
        try {
            process.chdir(path);
            let mode = '';
            const stagedModifiedFiles = [];
            const stagedNewFiles = [];
            const stagedDeletedFiles = [];
            const notStagedModifiedActiveFiles = [];
            const notStagedDeletedFiles = [];
            const untrackedFiles = [];
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

                    listPusher(
                        file,
                        mode,
                        stagedNewFiles,
                        stagedModifiedFiles,
                        stagedDeletedFiles,
                        notStagedModifiedActiveFiles,
                        notStagedDeletedFiles,
                        untrackedFiles,
                    );
                }
            }

            console.log(path);
            console.log({
                stagedNewFiles,
                stagedModifiedFiles,
                stagedDeletedFiles,
                notStagedModifiedActiveFiles,
                notStagedDeletedFiles,
                untrackedFiles,
            });

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
