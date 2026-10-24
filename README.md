# MSSP — Microservice Scaffolding Pipeline

A command-line tool to automate the creation of TypeScript-based microservices in a Node.js microservice architecture. MSSP generates boilerplate files, configures environment variables and Dockerfiles, updates gateway configuration, and installs dependencies automatically.

## Features

- **Interactive CLI:** Enter a service name using an interactive terminal prompt.
- **Automatic Service Generation:** Creates a new service folder and its `src` directory.
- **TypeScript Boilerplate:** Generates controller, service, model, interface, enum, middleware, DTO, and router files.
- **Automatic Port Assignment:** Calculates and configures a port for the new service.
- **Environment Configuration:** Creates a service-specific `.env` file.
- **Docker Support:** Generates a Dockerfile for the new service.
- **Gateway Integration:** Adds the new service's gateway configuration.
- **Server Registration:** Updates the `servers.json` configuration.
- **Dependency Installation:** Runs `npm install` automatically for the generated service.

## Requirements

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm
- TypeScript
- An existing microservice project with the expected pipeline and gateway directory structure

## Installation

Install MSSP globally from npm:

```bash
npm install -g @product.engineer.sushant/mssp
```

Alternatively, run it without a global installation:

```bash
npx @product.engineer.sushant/mssp
```

> **Note:** The package must be published to npm before other users can install it.

## Usage

Navigate to the directory where you want to create your new microservice, then run:

```bash
mssp
```

The CLI will display a welcome message and ask for a service name:

```text
----🌟 Welcome Team ! 🌟----

Enter Service Name || To exit app write : q
```

Enter a service name, for example:

```text
payment
```

MSSP will then:

1. Validate the service name.
2. Create the service directory.
3. Assign a port to the service.
4. Generate the TypeScript application and boilerplate files.
5. Create the `.env`, `Dockerfile`, and `package.json` files.
6. Register the service with the gateway and server configuration.
7. Install the required npm dependencies.

After successful creation, the CLI displays a success message.

Navigate to the generated service directory and start development:

```bash
cd payment
npm run dev
```

## Generated Project Structure

A generated service will have a structure similar to the following:

```text
payment/
├── src/
│   ├── app.ts
│   ├── payment.controller.ts
│   ├── payment.service.ts
│   ├── payment.model.ts
│   ├── payment.interface.ts
│   ├── payment.enum.ts
│   ├── payment.middleware.ts
│   ├── payment.dto.ts
│   └── payment.router.ts
├── .env
├── Dockerfile
├── package.json
└── tsconfig.json
```

The exact contents of the generated files depend on the boilerplate templates configured in MSSP.

## Available Commands

### Run in development mode

```bash
npm run dev
```

Uses `ts-node-dev` to run the TypeScript application during development.

### Build the project

```bash
npm run build
```

Compiles TypeScript files using the configured `tsconfig.json`.

### Start the compiled application

```bash
npm start
```

Runs the compiled application from `dist/app.js`.

## Service Naming Rules

Service names must follow these rules:

- Names must not be empty.
- Only letters, numbers, and hyphens are allowed.
- Spaces and other special characters are not allowed.
- Names are converted to lowercase.
- The service name `pipeline` is reserved.

Valid examples:

```text
payment
user-service
order123
notification-service
```

Invalid examples:

```text
Payment Service
user_service
payment@service
```

## Configuration

MSSP relies on the existing pipeline configuration and boilerplate templates.

The pipeline `.env` file is used to determine the next service port and generate environment configuration for the new service.

The gateway integration expects the gateway project to exist in the directory structure configured by MSSP. The tool also expects the server registry to be available at the configured `src/servers.json` path.

Before running MSSP, ensure that these files and directories exist and are configured correctly.

## Dependencies

MSSP uses the following primary dependencies:

| Package | Purpose |
|---|---|
| `chalk` | Terminal colors and styled messages |
| `inquirer` | Interactive command-line prompts |
| `dotenv` | Environment variable loading |
| `express` | Node.js web application framework |
| `mongoose` | MongoDB object modeling |
| `cors` | Cross-origin resource sharing |
| `morgan` | HTTP request logging |

Development dependencies include TypeScript, `ts-node-dev`, and the relevant type definitions.

## Important Notes

- Run MSSP from the directory where you want the new service to be created.
- The parent project must follow the expected pipeline and gateway layout.
- Creating a service modifies the pipeline's port configuration, gateway application, and server registry.
- Ensure that your gateway configuration and `servers.json` file are backed up or version-controlled before generating services.
- Keep secrets in environment variables and do not publish `.env` files containing credentials.
- Review generated configuration before deploying services to production.

## Troubleshooting

### Command not found

If `mssp` is not recognized, verify that the package was installed globally:

```bash
npm list -g --depth=0
```

You can also try:

```bash
npx @product.engineer.sushant/mssp
```

### Service already exists

Choose a different service name or inspect the existing service directory before trying again.

### Invalid service name

Use only letters, numbers, and hyphens, such as `payment-service`.

### Gateway or configuration errors

Verify that the gateway directory, pipeline `.env`, and `src/servers.json` exist at the paths expected by the CLI.

## Author

**Sushant**

## License

ISC
