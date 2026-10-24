#!/usr/bin/env node
import dotenv from 'dotenv'
dotenv.config()

import chalk from "chalk"
import inquirer from "inquirer"
import fs from "fs"
import path from "path"
import process from "process"
import { exec } from "child_process"
import { appBoilerPlate, GatewayBoilerPlate, interfaceBoilerPlate, ModelBoilerPlate, PackageBoilerPlate, RouterBoilerPlate } from './util/boilerplate'
import { promisify } from 'util'

const log = console.log

const Exec = promisify(exec)

const validateService = (service: string) =>{
    if(!service || service.length === 0)
        throw new Error("Service Name is Required")

    const regex = /^[a-zA-Z0-9-]+$/;
    const isValid = regex.test(service)

    if(!isValid)
        throw new Error("Space or any Symbol not Allowed in Service name, you can use Hyphen ( - ) ")

    return service.toLowerCase()
}

const exitApp = (msg: string | null = null) =>{
    const message = chalk.bgGreenBright.black.bold(msg || " 👋 😊 Good Bye !")
    log(message)
    process.exit(0)
}

const makeFolder = (path: string) =>{
    const isExist = fs.existsSync(path)
    if(isExist)
        throw new Error(`${path.split("\\").pop()} Service Already Exists !`)

    fs.mkdirSync(path)
}

const copyFiles = (files: string[], inputPath: string, outputPath: string) =>{
    files.forEach((file)=>{
        fs.copyFileSync(
            path.join(`${inputPath}`, file),
            path.join(`${outputPath}`, file)
        )
    })
}

const getBoilerPlate = (file: string, service: string) =>{
    if(file === ".router.ts")
        return RouterBoilerPlate(service)

    if(file === ".interface.ts")
        return interfaceBoilerPlate(service)

    if(file === ".model.ts")
        return ModelBoilerPlate(service)

    return ""
}

const createFiles = (files: string[], service: string, srcPath: string) =>{
    files.forEach((file)=>{
        const fileName = `${service}${file}`
        const filePath = path.join(srcPath,fileName)
        fs.writeFileSync(filePath, getBoilerPlate(file,service))
    })
}

const updateLastPort = (pipelinePath: string, newPort: number) =>{
    const envFilePath = path.join(pipelinePath, ".env")
    const envData = fs.readFileSync(envFilePath, "utf-8")
    
   const updatedPort = envData.replace(
        /LAST_PORT\s*=\s*\d+/,
        `LAST_PORT = ${newPort}`
    )

    fs.writeFileSync(envFilePath,updatedPort)
}

const createEnvForNewService = (pipelinePath: string, servicePath: string, newPort: number) =>{
    const pipelineEnvPath = path.join(pipelinePath, ".env")
    const newEnVPath = path.join(servicePath, ".env")
    const envData = fs.readFileSync(pipelineEnvPath, "utf-8")
    const stringChangedAfterPort = envData.replace(
        /PORT\s*=\s*\d+/,
        `PORT = ${newPort}`
    )
    const arr = stringChangedAfterPort.split("\n")
    const modifiedData = arr.map((item)=>{
        if(item.startsWith("LAST_PORT"))
            return null

        if(item.startsWith("SERVER"))
            return `SERVER = http://localhost:${newPort}`
        return item

    }).filter(Boolean)
    
    const finalData = modifiedData.join("\n")
    fs.writeFileSync(newEnVPath, finalData)
}

const createPackageForNewService = (service: string, servicePath: string) =>{
    const data = PackageBoilerPlate(service)
    const newPackagePath = path.join(servicePath, "package.json")
    fs.writeFileSync(newPackagePath, data)
}

const createDockerFileForNewService = (pipelinePath: string, servicePath: string, newPort: number) =>{
    const pipelineDockerFilePath = path.join(pipelinePath, "Dockerfile")
    const newDockerFilePath = path.join(servicePath, "Dockerfile")
    const dockerFileData = fs.readFileSync(pipelineDockerFilePath, "utf-8")
    const replacedWithDocker = dockerFileData.replace(
        /EXPOSE\s*\d+/,
        `EXPOSE ${newPort}`
    )
    
    fs.writeFileSync(newDockerFilePath, replacedWithDocker)
}

const getNewPort = (pipelinePath: string) =>{
    const envPath = path.join(pipelinePath, ".env")
    const envData = fs.readFileSync(envPath, "utf-8")
    const arr = envData.split("\n")
    const lastPortLine = arr.find((line)=>{
        return line.trimStart().startsWith("LAST_PORT")
    })
    const regExptForPortValue = /LAST_PORT\s*=\s*(\d+)/
    console.log()
    const lastPort = parseInt(lastPortLine?.match(regExptForPortValue)?.[1] as string)
    return lastPort+1
}

const addGateway = (gatewayPath: string, serviceName: string, newPort: number) =>{
    const data = GatewayBoilerPlate(serviceName, newPort)
    const input = path.join(gatewayPath, "src", "app.ts")
    fs.appendFileSync(input, data)
}   

const addServer = async(gatewayPath: string, serviceName: string) =>{
    const main = path.resolve(gatewayPath, "../../")
    const inputPath = path.join(main, "src", "servers.json")
    const {default: servers} = await import(inputPath)
    servers.push(serviceName)
    fs.writeFileSync(inputPath, JSON.stringify(servers,null, 2))
}

const app = async() => {
    try {
        const welcomeMessage = chalk.bgMagenta.white.bold("----🌟 Welcome Team ! 🌟----\n")
        log(welcomeMessage)

        const {service} = await inquirer.prompt({
            type: "input",
            name: "service",
            message: chalk.yellow("Enter Service Name || To exit app write : q \n"),
        })

        if(service === ":q"){
            exitApp()
        }

        if(service === "pipeline"){
            exitApp("Pipeline name is not Allowed")
        }

        const serviceName = validateService(service)
        const currentDir = process.cwd()
        const appPath = __dirname
        const rootPath = currentDir
        const pipelinePath = path.resolve(appPath, "../")
        const gatewayPath = path.join(path.resolve(currentDir, "../"), "gateway")
        const servicePath = path.join(rootPath, serviceName)
        const srcPath = path.join(servicePath,"src")
        const appFilePath = path.join(srcPath,"app.ts")
        const filesListForCopy = [
            "tsconfig.json"
        ]

        const filesListForCreate = [
            ".controller.ts",
            ".service.ts",
            ".model.ts",
            ".interface.ts",
            ".enum.ts",
            ".middleware.ts",
            ".dto.ts",
            ".router.ts"
        ]

        // Service Folder
        makeFolder(servicePath) 

        // Src Folder inside Service
        makeFolder(srcPath)
        
        // Change last port in pipeline
        const lastPort = getNewPort(pipelinePath)
        const newPort = lastPort+1
        updateLastPort(pipelinePath, newPort)

        // Creating app.ts
        fs.writeFileSync(appFilePath, appBoilerPlate(serviceName,newPort), "utf-8")

        // Create Env for New Service
        createEnvForNewService(pipelinePath, servicePath,newPort)

        // Create Docker File for New Service
        createDockerFileForNewService(pipelinePath, servicePath,newPort)

        // Create Docker File for New Service
        createPackageForNewService(serviceName, servicePath)

        // Copied all required files or Typescript
        copyFiles(filesListForCopy, pipelinePath, servicePath)

        // Creating required files for start Coding
        createFiles(filesListForCreate,serviceName, srcPath)

        // Adding Gateway
        addGateway(gatewayPath, serviceName, newPort)

        // Adding Server 
        await addServer(gatewayPath, serviceName)

        log(chalk.bgGreen.black.bold("🚀 Setting things up... 📦 Installing packages ⏳ "))
        await Exec("npm install", {cwd: servicePath})
        log(chalk.bgYellow.black.bold(`Success - ${serviceName} created Successfully !`))
        log(chalk.green.bold("🚀 Browse Service folder and write, npm run dev"))

        exitApp()

    } catch (err) {
        if(err instanceof Error){
            log(chalk.bgRed.white.bold(` 🛑 Error - ${err.message} \n`))
            app()
        }
    }
}   

app()