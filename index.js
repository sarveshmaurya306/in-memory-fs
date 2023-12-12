class FileSystem {
    constructor() {
      this.root = new Directory('/');
      this.currentDirectory = this.root;
    }

    changeDirectory(path) {
      const targetDirectory = this.findDirectory(path);
      if (targetDirectory instanceof Directory) {
        this.currentDirectory = targetDirectory;
        return true;
      } else {
        console.error(`Error: Directory '${path}' not found.`);
        return false;
      }
    }
  
    listDirectory() {
      return this.currentDirectory.listFiles();
    }

    listEverything() {
        return this.currentDirectory.listEverything();
    }
  
    createFile(name, content) {
      const newFile = new File(name, content);
      this.currentDirectory.addFile(newFile);
    }
  
    createDirectory(name) {
      const newDirectory = new Directory(name);
      this.currentDirectory.addFile(newDirectory);
    }
  
    readFile(name) {
      const file = this.currentDirectory.getFile(name);
      if (file instanceof File) {
        return file.content;
      } else {
        console.error(`Error: File '${name}' not found.`);
        return null;
      }
    }

    moveFile(source, destination) {
        this.currentDirectory.moveFile(source, destination);
    }

    copyFile(source, destination) {
        this.currentDirectory.copyFile(source, destination);
    }

    removeFile(fileName) {
        this.currentDirectory.removeFile(fileName);
    }

    grep(pattern) {
        return this.currentDirectory.findPattern(pattern);
    }
  
    findDirectory(path) {
      const parts = path.split('/').filter(part => part !== '');
      let currentDirectory = this.root;
  
      for (const part of parts) {
        const nextDirectory = currentDirectory.getDirectory(part);
        if (nextDirectory) {
          currentDirectory = nextDirectory;
        } else {
          return null;
        }
      }
  
      return currentDirectory;
    }
  }
  
  class File {
    constructor(name, content) {
      this.name = name;
      this.content = content;
    }
  }
  
  class Directory extends File {
    constructor(name) {
      super(name, null);
      this.files = [];
    }
  
    addFile(file) {
      this.files.push(file);
    }
  
    getDirectory(name) {
      return this.files.find(file => file instanceof Directory && file.name === name);
    }
  
    getFile(name) {
      return this.files.find(file => file instanceof File && file.name === name);
    }
  
    listFiles() {
      return this.files.map(file => file.name);
    }

    moveFile(source, destination) {
        const file= this.getFile(source);
        file.name= destination;
    }

    copyFile(source, destination) {
        const file= this.getFile(source);
        console.log(file)
        this.files.push(new File(destination, file.content))
    }

    removeFile(name) {
        this.files= this.files.filter(file =>file.name !== name);
    }

    findPattern(pattern) {
        const regex= new RegExp(pattern);

        const matchedFiles= [];
        this.files.map(file=> {
            if(file instanceof File && regex.test(file.content)) {
                console.log(file.content, 'file content')
                matchedFiles.push(file.name);
            } 
        })

        return matchedFiles;
    }

    listEverything() {
        const output= [];
        this.files.map(file=>{
          if(file instanceof Directory) {
              output.push(`drwx------         /${file.name}`)
          } else {
              output.push(`-rwx------         ${file.name}`);
          }
        })

        return output;
      }
  }
  
  // Example Usage:
  const fileSystem = new FileSystem();
  
  fileSystem.createFile('file1.txt', 'Content of file1.');
  fileSystem.createFile('file2.txt', 'Content of file2.');
  
  fileSystem.createDirectory('folder1');
  fileSystem.changeDirectory('folder1');
  
  fileSystem.createFile('file3.txt', 'Content of file3 in folder1.');
  
  console.log(fileSystem.listDirectory()); // ['file3.txt']
  
  fileSystem.changeDirectory('/');
  console.log(fileSystem.listDirectory()); // ['file1.txt', 'file2.txt', 'folder1']
  
  console.log(fileSystem.readFile('file1.txt')); // 'Content of file1.'



  // ls 
  // mkdir
  // cd 
  //cat
  //touch
  //echo
  // mv
  //cp
  //rm
  // grep


const prompt = require('prompt-sync')();
while(true) {
    const userCommand= prompt("sarvesh@sarvesh-Macbook-Air-M1:~$ ");
    if(!userCommand || userCommand === 'exit') break;

    const rootCommand= userCommand.split(' ')[0];
    const restCommands= userCommand.split(`${rootCommand} `).join('').split(' ');
    // console.log(rootCommand, restCommands)


    switch(rootCommand) {
        case "ls": {
            const result= fileSystem.listEverything();
            result.map(item=>{
                console.log(item)
            })
            break;
        }
        case "mkdir": {
            fileSystem.createDirectory(restCommands[0]);
            break;
        }
        case "cd": {
            fileSystem.changeDirectory(restCommands[0]);
            break;
        }
        case "cat": {
            const result= fileSystem.readFile(restCommands[0])
            console.log(result)
            break;
        }
        case "touch": {
            fileSystem.t(restCommands[0], '')
            break;
        }
        case "echo": {
            console.log(restCommands[0]);
            break;
        }
        case "mv": {
            fileSystem.moveFile(restCommands[0], restCommands[1]);
            break;
        }
        case "cp": {
            fileSystem.copyFile(restCommands[0], restCommands[1]);
            break;
        }
        case "rm": {
            fileSystem.removeFile(restCommands[0]);
            break;
        } 
        case "grep": {
        
            const result = fileSystem.grep(restCommands[0])

            result && result.forEach(item=>{
                console.log(item);
            })
            break;
        }
    }
}

