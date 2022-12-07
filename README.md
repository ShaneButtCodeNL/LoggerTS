# **LoggerTS**

## This is a simple log writing tool for node. It will make logs to the console and can write logs to log files.

### This project was writen in typescript using node. This is a project i made to practice TS and to test publishing to NPM. There are **no** **security** **features** in this program yet so please do **NOT** use this in any programs where there can be issues with data. I may add security later as it was fun working on this.

---

## **Installing**

> ### Locally to play with the code
>
> - Clone from github using `git clone https://github.com/ShaneButtCodeNL/LoggerTS.git`.
> - Install dependancies using `npm install`.
> - `npm run build` will build the program in a `lib` folder in the current folder.
> - `npm run test` will run the code against the test to ensure the code works
> - you can then add loggerTS to your code using either `const logger = require("{PATH}/LoggerTS"` or `import * as logger from "{PATH}/LoggerTS"`. Where PATH is the path of the lib folder after building

> ### From NPM
>
> - This is not on NPM yet. When it is I will update.
> - ~~Run `npm install loggerts`~~
> - ~~In your program import it with `const logger = require("LoggerTS")` or `import * as logger from "LoggerTS"`~~

---

## **Using this Logger**

### Import to your project

- In your program import it with `const logger = require("LoggerTS")` or `import * as logger from "LoggerTS"`

### Use one of the default Log configurations

- LoggerTS has several predefined log types called levels
  1. Debug
     - Use for general use logging.
  2. Info
     - Use for instances where checking info is important.
  3. System
     - Use for instances where checking info is related to system.
  4. Database
     - Use for information that relates to database connections,fetching and sending.
  5. Event
     - Use for when logging when an event triggers.
  6. Warn
     - Use for logging something that may cause problems.
  7. Error
     - Use for logging errors such as unexpected behavior or results.
  8. Fatal
     - Use for Logging errors that cause the program to fail or terminate.

### Add Custom configurations

- You can add custom levels to the logger using the `addConfig` method. The `addConfig` method takes an `options` object in the form of

```
addConfig({
   level : string,
   color? : string or array of 3 natural numbers in range of [0,255],
   writeToFile? : boolean
})
```

- `level` is the name of the level of the log. `color` is the color value for the console logging and can be a `color` like "white", `hex` like '#123456' or '#123',or a RGB value like [1,2,3]. `writeToFile` is a boolean that tells the the log to be writen to a log file. The `addConfig` function will return a function that will log using this config.
- **`level` must be a defined string with a non-zero length**.
- If `color` is undefined the program will use default value of White `#FFFFFF`. If `writeToFile` is undefined the program will use a default value of `False`.

### Logging

There are 2 functions to log

#### The general `log` function

Takes an options object as follows

```
log({
   level : string,
   message? : string,
   JSON? : object,
   error? : Error,
   logDir? : string
})
```

- `level` defines the log level in the log configurations. If the log level is undefined in the log configurations the program will throw an error.
- `message` and `JSON` are the data to be logged. If `JSON` is defined the message will be ignored and if `message` is undefined the default of empty string `""` will be used. `JSON` will use the `JSON.stringify` function to turn objects into a readable string that can be parsed with `JSON.parse`.
- `error` Is an error object used in error logging.
- `logDir` is the Path where you want to save logs. If `logDir` is undefined it will save logs at the same level as the project under "`./logs`".

#### The specific log functions

Ones for the default configurations

```
infoLog(options:{
   message?: string;
   JSON?: any;
   logDir?: string;
})
```

```
debugLog(options:{
   message?: string;
   JSON?: any;
   logDir?: string;
})
```

```
systemLog(options:{
   message?: string;
   JSON?: any;
   logDir?: string;
})
```

```
databaseLog(options:{
   message?: string;
   JSON?: any;
   logDir?: string;
})
```

```
eventLog(options:{
   message?: string;
   JSON?: any;
   logDir?: string;
})
```

```
warnLog(options:{
   message?: string;
   JSON?: any;
   logDir?: string;
})
```

```
errorLog(options:{
   message: string|Error;
   logDir?: string;
})
```

```
fatalLog(options:{
   message: string|Error;
   logDir?: string;
})
```

Simular functions will be created when you add a custom configuration. This function can stored and called like so . . .

```
// Add Custom Configuration
const myCustomLog = addConfig({
   level: "my-custom-level",
   color: "#ff12a5",
   writeToFile:true
})

// Call the custom log function
myCustomLog({
   JSON:{
      message:"Message",
      data:[1,2,3,4],
      moreData:{
         a:1,
         b:2
      }
      statusOfEconomy:"Looks Bleak"
   },
   logDir:"{PATH}/folder-for-logs"
})
```

### Read a Log in the console

Use Function . . .

```
readLogAsync({
   logDir?:string,
   fileName:string
})
```

- if `logDir` is undefined it will look in the current folder under "`./logs`".
- The `fileName` is the name of the log. Log files are name as such

```
 {log-level}-{YYYY}-{MM}-{DD}.log
 'log-level' is the string representation of the log level. Ex "debug".
 'YYYY' is the numerical year. ex 2022
 'MM' is the numerical month. ex 12
 'DD' is the numerical day. ex 07
```
