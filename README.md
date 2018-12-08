Node MsDeploy
======

Simplified Node.js interface for MsDeploy (Windows platform only)

## Install NPM

```javascript
npm install node-msdeploy --save
```

## Usage

#### Setup deployment on Microsoft Azure AppService

```javascript

// Import module
let NodeMsDeploy = require('node-msdeploy');

// Define deploy options (ex. Azure App Service)
let deployOptions = {
    computerName : 'my-app.scm.azurewebsites.net', 
    site: 'my-app', 
    protocol: 'https',
    port: 443, 
    userName: '$my-app', 
    password: 'my-supersecret-password123!',
    authType: 'Basic', 
    packageFile: 'C:\\folder\\subfolder\\zip-with-application.zip'
};

// Initialize deployer
let deployer = new NodeMsDeploy(deployOptions);

// Launch deployment and handle promise
deployer.execute().then(
    
    // Success
    () => { 
        console.log('Deployment completed!'); 
    }, 

    // Error
    (err) => { 
        console.log('Deployment failed with error ' + err); 
    }
);
```