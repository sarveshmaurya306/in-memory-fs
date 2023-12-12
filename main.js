
const yargs = require('yargs');
const chalk = require('chalk')
const prompt = require('prompt-sync')();
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv;

const log = console.log;

const {
    setFileSystem,
    listDirectory,
    currDirObjRef,
    getDirectoryObjRef,
    readFile,
    createDirectory,
    pwd,
    createFile,
    copyFile,
    moveFile,
    removeFile,
    grep,
    find,
    saveCurrentDirState,
    isSaveData
} = require('./server')

function main() { 
    while (true) {
        try {
            setFileSystem(argv.path)
            const userCommand = prompt(chalk.green.bold(`sarvesh@sarvesh-Macbook-Air-M1:/${pwd()}`) + '$ ');
            if (userCommand === null || userCommand === 'exit') {
                if (isSaveData)
                    saveCurrentDirState();
                break;
            };
            if (userCommand === '') continue;

            const rootCommand = userCommand.split(' ')[0];
            const restCommands = userCommand.split(' ').slice(1);

            switch (rootCommand) {
                case "ls": {
                    listDirectory(restCommands[0]);
                    break;
                }
                // case "mkdir": {
                //     currDirObjRef[restCommands[0]] = {};
                //     break;
                // }
                case "cd": {
                    const dirRef = getDirectoryObjRef(restCommands[0]);
                    if (!dirRef) {
                        log(chalk.red.bold("Not a valid Directory Path"));
                        break;
                    }

                    currDir = dirRef[0]
                    currDirObjRef = dirRef[1];
                    break;
                }
                case "cat": {
                    const result = readFile(restCommands[0])
                    log(result)
                    break;
                }
                case "mkdir": {
                    createDirectory(restCommands[0]);
                    break;
                }
                case "pwd": {
                    log('/' + pwd())
                    break;
                }

                case "touch": {
                    createFile(restCommands[0]);
                    break;
                }
                case "cp": {
                    copyFile(restCommands[0], restCommands[1]);
                    break;
                }
                case "mv": {
                    moveFile(restCommands[0], restCommands[1]);
                    break;
                }
                case "rm": {
                    removeFile(restCommands[0])
                    break;
                }
                case "grep": {
                    const dirRef = getDirectoryObjRef(restCommands[1]);
                    if (!dirRef) {
                        log(chalk.red.bold("Not a valid Directory Path"));
                        break;
                    }
                    const result = grep(restCommands[0], dirRef[1]);

                    log((result !== 0 ? chalk.green(restCommands[0]) : chalk.red(restCommands[0])) + ': ' + result);
                    break;
                }
                case 'echo': {
                    const message = restCommands.join(' ').split('>')[0];
                    const filePath = restCommands.join(' ').split('>')[1];

                    if (!filePath) {
                        log(message);
                    } else {

                        const filePathArray = filePath.split('/');
                        const fileName = filePathArray.pop().trim();
                        const fileDirRef = getDirectoryObjRef(filePathArray.join('/'));

                        if (!fileDirRef) {
                            log(chalk.red.bold("Not a valid Directory Path"));
                            return;
                        }
                        const srcFileDirectoryRef = fileDirRef[1];
                        createFile(fileName, message, srcFileDirectoryRef);
                    }
                    break;
                }
                //extra functionality
                case 'find': {
                    const dirRef = getDirectoryObjRef(restCommands[1]);
                    if (!dirRef) {
                        log(chalk.red.bold("Not a valid Directory Path"));
                        break;
                    }
                    const files = find(dirRef[1], restCommands[0]);
                    for (let file of files) {
                        log(file);
                    }
                    break;
                }
                default: {
                    log(fileSystem)
                    log(chalk.red.bold("no command found..."))
                }
            }
        } catch (err) {
            if (isSaveData)
                saveCurrentDirState();
        }
    }
};
main();