"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayBoilerPlate = exports.ModelBoilerPlate = exports.PackageBoilerPlate = exports.interfaceBoilerPlate = exports.RouterBoilerPlate = exports.appBoilerPlate = void 0;
const getServiceInPascalCase = (service) => {
    const arr = service.split("-");
    const tmp = arr.map((item) => {
        const firstLetter = item[0].toUpperCase();
        const restLetter = item.slice(1);
        return firstLetter + restLetter;
    });
    return tmp.join("");
};
const appBoilerPlate = (service, port) => {
    return [
        `import dotenv from "dotenv"`,
        `dotenv.config()\n`,
        `import mongoose from "mongoose"`,
        `mongoose.connect(process.env.DB!)`,
        `.then(()=>{console.log("${service} - Database Connected")})`,
        `.catch(()=>{console.log("${service} - Database Failed")})\n`,
        ` import express, { Request, Response } from "express"`,
        `import ${getServiceInPascalCase(service)}Router from "./${service}.router" \n`,
        `import cors from "cors"\n`,
        `import morgan from "morgan"`,
        `const app = express()`,
        `const PORT = process.env.PORT || 4000\n`,
        `app.use(cors({`,
        `\torigin: process.env.CLIENT,`,
        `\tcredentials: true,`,
        `}))`,
        `app.use(express.json())`,
        `app.use(express.urlencoded({extended: false}))`,
        `app.use(morgan("dev"))\n`,
        `app.use("/${service}", ${getServiceInPascalCase(service)}Router)\n`,
        `app.listen(PORT, ()=>{`,
        `\tconsole.log("${service} Service is Running on PORT : http://localhost:${port}", "Api Endpoint - /${service}")`,
        `})`,
    ].join("\n");
};
exports.appBoilerPlate = appBoilerPlate;
const RouterBoilerPlate = (service) => {
    return [
        `import { Router, Request, Response } from "express"`,
        ` const ${getServiceInPascalCase(service)}Router = Router()\n`,
        `${getServiceInPascalCase(service)}Router.get("/", (req: Request,res:Response)=>{`,
        `\tres.json({message: "Hello From ${getServiceInPascalCase(service)} Service" })`,
        `})\n`,
        ` export default ${getServiceInPascalCase(service)}Router`
    ].join("\n");
};
exports.RouterBoilerPlate = RouterBoilerPlate;
const interfaceBoilerPlate = (service) => {
    const Provider = getServiceInPascalCase(service);
    return [
        `import { Document } from "mongoose" \n`,
        `export interface ${Provider}ModelInterface extends Document {\n`,
        `\t`,
        ` }`
    ].join("\n");
};
exports.interfaceBoilerPlate = interfaceBoilerPlate;
const PackageBoilerPlate = (service) => {
    const data = {
        "name": service,
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
            "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
            "build": "tsc",
            "start": "node dist/app.js"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "type": "commonjs",
        "dependencies": {
            "cors": "^2.8.6",
            "dotenv": "^18.0.8",
            "express": "^5.3.0",
            "mongoose": "^9.11.2",
            "morgan": "^1.12.1"
        },
        "devDependencies": {
            "@types/cors": "^2.8.19",
            "@types/express": "^5.0.6",
            "@types/morgan": "^1.9.10",
            "@types/node": "^26.6.5",
            "ts-node-dev": "^2.0.0",
            "typescript": "^5.9.3"
        }
    };
    return JSON.stringify(data, null, 2);
};
exports.PackageBoilerPlate = PackageBoilerPlate;
const ModelBoilerPlate = (service) => {
    const Provider = getServiceInPascalCase(service);
    return [
        `import { model, Schema } from "mongoose"`,
        `import { ${Provider}ModelInterface } from "./${service}.interface"\n`,
        ` const ${Provider}schema = new Schema<${Provider}ModelInterface>({\n`,
        `\t`,
        `},{timestamps: true})\n`,
        `\t`,
        `const ${Provider}Model = model<${Provider}ModelInterface>("${Provider}", ${Provider}schema)`,
        `export default ${Provider}Model`
    ].join("\n");
};
exports.ModelBoilerPlate = ModelBoilerPlate;
const GatewayBoilerPlate = (service, port) => {
    return [
        ` \n\napp.use("/${service}", createProxyMiddleware({`,
        `\ttarget: "http://localhost:${port}/${service}",`,
        `\tchangeOrigin: true`,
        `}))`
    ].join("\n");
};
exports.GatewayBoilerPlate = GatewayBoilerPlate;
