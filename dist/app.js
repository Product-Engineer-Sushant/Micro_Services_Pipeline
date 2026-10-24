#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const child_process_1 = require("child_process");
const boilerplate_1 = require("./util/boilerplate");
const util_1 = require("util");
const log = console.log;
const Exec = (0, util_1.promisify)(child_process_1.exec);
const validateService = (service) => {
    if (!service || service.length === 0)
        throw new Error("Service Name is Required");
    const regex = /^[a-zA-Z0-9-]+$/;
    const isValid = regex.test(service);
    if (!isValid)
        throw new Error("Space or any Symbol not Allowed in Service name, you can use Hyphen ( - ) ");
    return service.toLowerCase();
};
const exitApp = (msg = null) => {
    const message = chalk_1.default.bgGreenBright.black.bold(msg || " 👋 😊 Good Bye !");
    log(message);
    process_1.default.exit(0);
};
const makeFolder = (path) => {
    const isExist = fs_1.default.existsSync(path);
    if (isExist)
        throw new Error(`${path.split("\\").pop()} Service Already Exists !`);
    fs_1.default.mkdirSync(path);
};
const copyFiles = (files, inputPath, outputPath) => {
    files.forEach((file) => {
        fs_1.default.copyFileSync(path_1.default.join(`${inputPath}`, file), path_1.default.join(`${outputPath}`, file));
    });
};
const getBoilerPlate = (file, service) => {
    if (file === ".router.ts")
        return (0, boilerplate_1.RouterBoilerPlate)(service);
    if (file === ".interface.ts")
        return (0, boilerplate_1.interfaceBoilerPlate)(service);
    if (file === ".model.ts")
        return (0, boilerplate_1.ModelBoilerPlate)(service);
    return "";
};
const createFiles = (files, service, srcPath) => {
    files.forEach((file) => {
        const fileName = `${service}${file}`;
        const filePath = path_1.default.join(srcPath, fileName);
        fs_1.default.writeFileSync(filePath, getBoilerPlate(file, service));
    });
};
const updateLastPort = (pipelinePath, newPort) => {
    const envFilePath = path_1.default.join(pipelinePath, ".env");
    const envData = fs_1.default.readFileSync(envFilePath, "utf-8");
    const updatedPort = envData.replace(/LAST_PORT\s*=\s*\d+/, `LAST_PORT = ${newPort}`);
    fs_1.default.writeFileSync(envFilePath, updatedPort);
};
const createEnvForNewService = (pipelinePath, servicePath, newPort) => {
    const pipelineEnvPath = path_1.default.join(pipelinePath, ".env");
    const newEnVPath = path_1.default.join(servicePath, ".env");
    const envData = fs_1.default.readFileSync(pipelineEnvPath, "utf-8");
    const stringChangedAfterPort = envData.replace(/PORT\s*=\s*\d+/, `PORT = ${newPort}`);
    const arr = stringChangedAfterPort.split("\n");
    const modifiedData = arr.map((item) => {
        if (item.startsWith("LAST_PORT"))
            return null;
        if (item.startsWith("SERVER"))
            return `SERVER = http://localhost:${newPort}`;
        return item;
    }).filter(Boolean);
    const finalData = modifiedData.join("\n");
    fs_1.default.writeFileSync(newEnVPath, finalData);
};
const createPackageForNewService = (service, servicePath) => {
    const data = (0, boilerplate_1.PackageBoilerPlate)(service);
    const newPackagePath = path_1.default.join(servicePath, "package.json");
    fs_1.default.writeFileSync(newPackagePath, data);
};
const createDockerFileForNewService = (pipelinePath, servicePath, newPort) => {
    const pipelineDockerFilePath = path_1.default.join(pipelinePath, "Dockerfile");
    const newDockerFilePath = path_1.default.join(servicePath, "Dockerfile");
    const dockerFileData = fs_1.default.readFileSync(pipelineDockerFilePath, "utf-8");
    const replacedWithDocker = dockerFileData.replace(/EXPOSE\s*\d+/, `EXPOSE ${newPort}`);
    fs_1.default.writeFileSync(newDockerFilePath, replacedWithDocker);
};
const getNewPort = (pipelinePath) => {
    const envPath = path_1.default.join(pipelinePath, ".env");
    const envData = fs_1.default.readFileSync(envPath, "utf-8");
    const arr = envData.split("\n");
    const lastPortLine = arr.find((line) => {
        return line.trimStart().startsWith("LAST_PORT");
    });
    const regExptForPortValue = /LAST_PORT\s*=\s*(\d+)/;
    console.log();
    const lastPort = parseInt(lastPortLine?.match(regExptForPortValue)?.[1]);
    return lastPort + 1;
};
const addGateway = (gatewayPath, serviceName, newPort) => {
    const data = (0, boilerplate_1.GatewayBoilerPlate)(serviceName, newPort);
    const input = path_1.default.join(gatewayPath, "src", "app.ts");
    fs_1.default.appendFileSync(input, data);
};
const addServer = async (gatewayPath, serviceName) => {
    const main = path_1.default.resolve(gatewayPath, "../../");
    const inputPath = path_1.default.join(main, "src", "servers.json");
    const { default: servers } = await Promise.resolve(`${inputPath}`).then(s => __importStar(require(s)));
    servers.push(serviceName);
    fs_1.default.writeFileSync(inputPath, JSON.stringify(servers, null, 2));
};
const app = async () => {
    try {
        const welcomeMessage = chalk_1.default.bgMagenta.white.bold("----🌟 Welcome Team ! 🌟----\n");
        log(welcomeMessage);
        const { service } = await inquirer_1.default.prompt({
            type: "input",
            name: "service",
            message: chalk_1.default.yellow("Enter Service Name || To exit app write : q \n"),
        });
        if (service === ":q") {
            exitApp();
        }
        if (service === "pipeline") {
            exitApp("Pipeline name is not Allowed");
        }
        const serviceName = validateService(service);
        const currentDir = process_1.default.cwd();
        const appPath = __dirname;
        const rootPath = currentDir;
        const pipelinePath = path_1.default.resolve(appPath, "../");
        const gatewayPath = path_1.default.join(path_1.default.resolve(currentDir, "../"), "gateway");
        const servicePath = path_1.default.join(rootPath, serviceName);
        const srcPath = path_1.default.join(servicePath, "src");
        const appFilePath = path_1.default.join(srcPath, "app.ts");
        const filesListForCopy = [
            "tsconfig.json"
        ];
        const filesListForCreate = [
            ".controller.ts",
            ".service.ts",
            ".model.ts",
            ".interface.ts",
            ".enum.ts",
            ".middleware.ts",
            ".dto.ts",
            ".router.ts"
        ];
        // Service Folder
        makeFolder(servicePath);
        // Src Folder inside Service
        makeFolder(srcPath);
        // Change last port in pipeline
        const lastPort = getNewPort(pipelinePath);
        const newPort = lastPort + 1;
        updateLastPort(pipelinePath, newPort);
        // Creating app.ts
        fs_1.default.writeFileSync(appFilePath, (0, boilerplate_1.appBoilerPlate)(serviceName, newPort), "utf-8");
        // Create Env for New Service
        createEnvForNewService(pipelinePath, servicePath, newPort);
        // Create Docker File for New Service
        createDockerFileForNewService(pipelinePath, servicePath, newPort);
        // Create Docker File for New Service
        createPackageForNewService(serviceName, servicePath);
        // Copied all required files or Typescript
        copyFiles(filesListForCopy, pipelinePath, servicePath);
        // Creating required files for start Coding
        createFiles(filesListForCreate, serviceName, srcPath);
        // Adding Gateway
        addGateway(gatewayPath, serviceName, newPort);
        // Adding Server 
        await addServer(gatewayPath, serviceName);
        log(chalk_1.default.bgGreen.black.bold("🚀 Setting things up... 📦 Installing packages ⏳ "));
        await Exec("npm install", { cwd: servicePath });
        log(chalk_1.default.bgYellow.black.bold(`Success - ${serviceName} created Successfully !`));
        log(chalk_1.default.green.bold("🚀 Browse Service folder and write, npm run dev"));
        exitApp();
    }
    catch (err) {
        if (err instanceof Error) {
            log(chalk_1.default.bgRed.white.bold(` 🛑 Error - ${err.message} \n`));
            app();
        }
    }
};
app();
