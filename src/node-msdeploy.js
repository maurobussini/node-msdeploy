const path = require('path');
const fs = require('fs');
//const spawn = require('child_process').spawn;
const exec = require('child_process').exec;

/**
 * Microsoft Deploy provider
 */
module.exports = class NodeMsDeploy {


    /**
     * Initialize deployer with options
     */
    constructor(options){

        //Set global options
        this.options = options;
    }

    /**
     * Show help on console
     */
    help(){

        //Generate sample options
        let sampleOptions = {
            computerName : 'my-app.scm.azurewebsites.net', 
            site: 'my-app', 
            protocol: 'https',
            port: 443, 
            userName: '$my-app', 
            password: 'my-supersecret-password123!',
            authType: 'Basic', 
            packageFile: 'C:\\folder\\subfolder\\zip-with-application.zip'
        };

        //Trace on console option structure
        let json = JSON.stringify(sampleOptions, null, "   ");
        console.log("[MsDeploy Help] Sample configuration for 'options':");
        console.log(json);
    }

    /**
     * Executes MsDeploy with provided options
     */
    execute(){

        //Generate/fix configuration options
        let fixedOptions = {
            computerName : this.options.computerName || '', 
            site: this.options.site || '', 
            protocol: this.options.protocolo || 'https',
            port: this.options.port || 443, 
            userName: this.options.userName || '', 
            password: this.options.password || '', 
            authType: this.options.authType || 'Basic', 
            packageFile: this.options.packageFile || ''
        };

        //Generate promise
        return new Promise((resolve, reject) => {

            //Validate options
            if (!fixedOptions.computerName){
                reject(new Error('Option "computerName" is invalid'));
                return;
            }
            if (!fixedOptions.site){
                reject(new Error('Option "site" is invalid'));
                return;
            }
            if (!fixedOptions.userName){
                reject(new Error('Option "userName" is invalid'));
                return;
            }
            if (!fixedOptions.password){
                reject(new Error('Option "password" is invalid'));
                return;
            }
            if (!fixedOptions.packageFile){
                reject(new Error('Option "packageFile" is invalid'));
                return;
            }

            
            //Generate computer name FQDN
            let computerNameFull = fixedOptions.protocol + '://' + 
                fixedOptions.computerName + 
                ":" + fixedOptions.port + 
                '/msdeploy.axd?site=' + fixedOptions.site;

            //Compose pieces of command for MsDeploy
            let optionVerb = '-verb:' + 
                'sync';
            let optionSource = '-source:' + 
                'package="' + fixedOptions.packageFile + '",' + 
                'includeAcls="False"';
            let optionAllowUntrusted = '-allowUntrusted:' + 
                'true';
            let optionDest = '-dest:' + 
                'auto,' + 
                'ComputerName="' + computerNameFull + '",' + 
                'UserName="' + fixedOptions.userName + '",' + 
                'Password="' + fixedOptions.password + '",' + 
                'AuthType="' + fixedOptions.authType + '",' + 
                'includeAcls="False"';
            let optionMisc = 
                '-disableLink:AppPoolExtension ' + 
                '-disableLink:ContentExtension ' + 
                '-disableLink:CertificateExtension ' + 
                '-enableRule:AppOffline ' + 
                '-enableRule:DoNotDeleteRule ';

            //Use provided params
            let param = 
                optionVerb + ' ' + 
                optionSource + ' ' + 
                optionAllowUntrusted + ' ' + 
                optionDest + ' ' + 
                optionMisc;

            //Compose MS deploy executable path
            let msDeployPath = '"' + this.getMsDeployExePath() + '"';            

            //Launching command (just of double check purposes)
            let fullCommand = msDeployPath + ' ' + param;
            console.log("[MsDeploy] Launching command:");
            console.log(fullCommand);

            //Executes command as child process
            exec(fullCommand, (error, stdout, stderr) => {

                //With error
                if (error) {
                
                    //Trace error and reject
                    console.error(`[MsDeploy] Execution error: ${error}`);
                    reject(error);
                    return;
                }
                
                //Resolve
                console.log(`[MsDeploy] Process completed: ${stdout}`);
                resolve();
            });

            //#region Spawn version (NEXT)

                // //Create command
                // let command = spawn(msDeployPath, [
                //     optionVerb, 
                //     optionSource, 
                //     optionAllowUntrusted, 
                //     optionDest, 
                //     optionMisc
                // ]);

                // //Attach standard output data
                // command.stdout.on('data', (data) => {

                //     //Trace on console
                //     console.log('[stdout] '  + data.toString());
                // });

                // //Attach error event
                // command.stderr.on('data', (data) => {

                //     //Trace on console error and reject
                //     console.log('[stderr] '  + data.toString());
                //     reject(new Error(data));
                // });

                // //Attache exit event
                // command.on('exit', (code) => {

                //     //Trace on console completion
                //     console.log('Spawn child process exited with code ' + code.toString());

                //     //Resolve
                //     resolve();
                // });

            //#endregion
        });
    }

    /**
     * Get executable file for MsDeploy on Windows only
     */
    getMsDeployExePath() {

        //Check is Windows environment
        if (!process.env.ProgramFiles || !process.env["ProgramFiles(x86)"]) {
            throw new Error("This script is only available on Windows environment.");
        }
    
        //Find MsDeploy executable file on local machine
        let relativeMsDeployPath = "IIS/Microsoft Web Deploy V3/msdeploy.exe",
            path64 = path.join(process.env.ProgramFiles, relativeMsDeployPath),
            path32 = path.join(process.env["ProgramFiles(x86)"], relativeMsDeployPath),
            msDeploy64Path, msDeploy32Path;
    
        //Case x64 Operating system
        if (path64 != null) {
            msDeploy64Path = path.resolve(path.join(process.env.ProgramFiles, relativeMsDeployPath));
            if (fs.existsSync(msDeploy64Path)) {
                return msDeploy64Path;
            }
        }
    
        //Case x86 Operating system
        if (path32 != null) {
            msDeploy32Path = path.resolve(path.join(process.env["ProgramFiles(x86)"], relativeMsDeployPath));
            if (fs.existsSync(msDeploy32Path)) {
                return msDeploy32Path;
            }
        }
    
        //Throw error for missing msdeploy executable
        throw new Error("MSDeploy doesn't seem to be installed. Could not find msdeploy in \"" + 
            msDeploy64Path + "\" or \"" + msDeploy32Path + 
            "\". You can install it from http://www.iis.net/downloads/microsoft/web-deploy");
    }
}