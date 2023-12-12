const { readFileSync, writeFileSync } =require('node:fs');
const yargs= require('yargs');
const chalk = require('chalk')
const prompt = require('prompt-sync')();
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv;

const log = console.log;

const inMemoryPath= argv.path;
// const isSaveData= argv.save;
const isSaveData=true
let savedData=null;
if(inMemoryPath){
    try{
        savedData= readFileSync(inMemoryPath);
    } catch(e) {}
}

let fileSystem={};
if(inMemoryPath && savedData && savedData.buffer.byteLength>1)
    fileSystem= JSON.parse(savedData) || {};//this is the actual file system;

if(!fileSystem.hasOwnProperty('/'))
    fileSystem['/'] = {}; //actual file system where everything will be stored

let currDir = ['/']; //will be used to keep track of the current working directory path
let currDirObjRef = fileSystem['/']; //always holds the current directory reference

function saveCurrentDirState() {
    writeFileSync(inMemoryPath, JSON.stringify(fileSystem));
}

function getDirData(dirObj, name) { // whole directory, and the path from which you are starting;
    if (typeof dirObj !== 'object')
        return null;
    if (typeof (dirObj) === 'object' && dirObj.hasOwnProperty(name))
        return dirObj[name];

    for (let file of Object.keys(dirObj)) {
        const foundData = getDirData(dirObj[file], name);
        if (foundData)
            return foundData;
    }
    return null;
}

function getDirectoryObjRef(path="") { //to get the directory ref object;
    if(path==='/' || path==='~') {
        return [['/'], fileSystem['/']];
    }
    const dirPaths = path.split('/');
    const tempDir = [...currDir];
    // console.log(oldDir)

    for (let path of dirPaths) {
        // console.log(path)
        if (!path || path === '.' || path === '/')
            continue;
        if (path === '..')
            if (tempDir.length > 1)
                tempDir.pop();
            else
                continue;
        else
            tempDir.push(path);
    }
    const lastDir = tempDir[tempDir.length - 1]
    const tempCurrDirObj = listCurrentDirectory(lastDir);
    if (!tempCurrDirObj) { //if it is a wrong path
        return null;
    }
    return [tempDir, tempCurrDirObj];
    // console.log(currDir)
}

function listCurrentDirectory(dir = currDir) { // to see the content of the current working directory act like a `ls`
    return getDirData(fileSystem, dir);
}

function createDirectory(dirName) { // to create a directory in a pwd act like a `mkdir`
    currDirObjRef[dirName] = {};
}

function createFile(fileName, fileContent = '', fileDirObjRef = currDirObjRef) { // to create a new file in pwd 
    fileDirObjRef[fileName] = fileContent
}


function listDirectory(path) { //ls
    const dirRef= getDirectoryObjRef(path);
    if(!dirRef) {
        log(chalk.red.bold("Not a valid Directory Path"));
        return;
    }
    
    let logOutput = "";
    const fileDirectoryRef = dirRef[1] || currDirObjRef;
    for (let file of Object.keys(fileDirectoryRef)) {
        if (typeof fileDirectoryRef[file] === 'object')
            logOutput += chalk.blue.bold(file) + ' ';
        else
            logOutput += chalk.white(file) + ' ';
    }
    console.log(logOutput)
}

function pwd() { //pwd
    return currDir.length > 1 ? chalk.blue.bold(currDir.slice(1).join('/')) : '';
}

function readFile(filePath) { //cat
    const fileArray = filePath.split('/');

    const fileName = fileArray.pop();
    const dirRef= getDirectoryObjRef(fileArray.join('/'));
    if(!dirRef) {
        log(chalk.red.bold("Not a valid Directory Path"));
        return;
    }
    const fileDirectoryRef = dirRef[1];
    if (typeof fileDirectoryRef[fileName] !== 'object')
        return fileDirectoryRef[fileName];

    // if(typeof currDirObjRef[name]!=='object' && currDirObjRef.hasOwnProperty(name))
    //     return currDirObjRef[name];
    return chalk.red('No file Found');
}

function copyFile(srcPath = "", destPath = "") { //cp
    const srcArray = srcPath.split('/');
    const destArray = destPath.split('/');

    const srcFileName = srcArray.pop();
    const destinationFileName = destArray.pop();

    //remaining is the path;
    const srcDirRef= getDirectoryObjRef(srcArray.join('/'));
    const destDirRef= getDirectoryObjRef(destArray.join('/'))
    if(!srcDirRef || !destDirRef) {
        log(chalk.red.bold("Not a valid Directory Path"));
        return;
    }
    const srcFileDirectoryRef = srcDirRef[1];
    const destinationFileDirectoryRef = destDirRef[1];

    destinationFileDirectoryRef[destinationFileName] = srcFileDirectoryRef[srcFileName];
    return { destinationFileDirectoryRef, srcFileDirectoryRef, srcFileName, destinationFileName }
}

function moveFile(srcPath = "", destPath = "") { //mv;
    const { srcFileDirectoryRef, srcFileName } = copyFile(srcPath, destPath);
    delete srcFileDirectoryRef[srcFileName];
}

function removeFile(filePath) { //rm the file or directory
    const fileArray = filePath.split('/');

    const fileName = fileArray.pop();

    const dirRef= getDirectoryObjRef(fileArray.join('/'));
    if(!dirRef) {
        log(chalk.red.bold("Not a valid Directory Path"));
        return;
    }
    const fileDirectoryRef = dirRef[1];
    
    delete fileDirectoryRef[fileName];
};

function find(dirObj, regex, output = []) {
    for (let file of Object.keys(dirObj)) {
        if (typeof dirObj[file] !== 'object') {
            const fileContent = dirObj[file];
            const reg = new RegExp(regex);

            if (reg.test(fileContent))
                output.push(file);
        }
        else
            find(dirObj[file], regex, output);
    }
    return output;
}

function grep(regex, fileData = "") {
    regex = new RegExp(regex, 'g')
    const allMatches = fileData.match(regex);
    if (allMatches) return allMatches.length;
    return 0;
}


//! user input starts from here;

while (true) {
    try{
        const userCommand = prompt(chalk.green.bold(`sarvesh@sarvesh.kumar.careers@gmail.com:/${pwd()}`) + '$ ');
    if (userCommand === null || userCommand === 'exit') {
        if (isSaveData) {
            log(chalk.green.bold('data saving...'))
            saveCurrentDirState();
        }
        process.exit(0);
    };
    if (userCommand === '') continue;

    const rootCommand = userCommand.split(' ')[0];
    const restCommands = userCommand.split(' ').slice(1);

    switch (rootCommand) {
        case "ls": {
            listDirectory(restCommands[0]);
            break;
        }
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
            log(chalk.red.bold("no command found..."))
            break;
        }
    }
    } catch(err) {
        if (isSaveData) {
            log(chalk.green.bold('data saving...'))
            saveCurrentDirState();
        }
        process.exit(1);
    }
}
