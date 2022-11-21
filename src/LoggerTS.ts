import { config } from "./config";
import * as path from "path";
import chalk from "chalk";
const dayjs = require("dayjs");
import * as fs from "fs";
import * as readline from "readline";
import { Level, LevelData } from "./Level";

export enum LogTypes {
  INFO = "info",
  WARNING = "warn",
  DEBUG = "debug",
  SYSTEM = "system",
  DATABASE = "database",
  ERROR = "error",
  FATAL = "fatal",
  EVENT = "event",
}

/**
 *  {
 *    levels:{
 *      levelName:string:{
 *        color:val,
 *        writeToFile:bool
 *      },
 *      levelName2:string:{
 *        color:val,
 *        writeToFile:bool
 *      }
 *    }
 * }
 */
const customConfig: Record<string, Level> = {
  levels: {} as Level,
};

/**
 * Make a log using the configurations
 * @param options
 * OBJECT {level, message, JSON, error, logDir}
 */
export const log = (options: any) => {
  const levelName: string = getLevelName(options.level);
  let message = options.message ?? "";
  const error = options.error ?? null;

  if (options.JSON) {
    writeToConsoleJSON(levelName, options.JSON, error);
  } else writeToConsole(levelName, message, error);
  if (getConfig().levels[levelName].writeToFile) {
    if (options.JSON) writeToFileJSON(levelName, options.JSON, options.logDir);
    else
      writeToFile(levelName, error ? error.message : message, options.logDir);
  }
};

/**
 * Write a formated message to the console
 * @param levelName The level of log
 * @param message The message
 * @param error The error
 */
const writeToConsole = (
  levelName: string,
  message: string,
  error: Error | null = null
) => {
  const level = getConfig().levels[levelName] || null;
  let chalkFunction: any;
  //Todo update
  if (!level) throw new Error(`Not a valid Level`);
  //Hex
  if (level.color[0] === "#") {
    chalkFunction = chalk.hex(level.color);
  } else if (Array.isArray(level.color)) {
    //Check if there are 3 values [red,green,blue]
    if (level.color.length !== 3) {
      throw new Error(
        `An error has been detected in configuration for level [${chalk.red(
          levelName.toUpperCase()
        )}]. The value of color is set to an array which is for RGB values. The array should have '${chalk.red(
          "3"
        )}' values, but we detected '${chalk.red(
          "" + level.color.length
        )}' values. Please ${
          level.color.length > 3 ? "remove" : "add"
        } ${Math.abs(level.color.length - 3)} values.`
      );
    }
    //todo Check values are valid [int,int,int]
    //All good
    chalkFunction = chalk.rgb(level.color[0], level.color[1], level.color[2]);
  } else {
    const color: keyof typeof chalk = level.color;
    chalkFunction = chalk[color];
  }

  message = error
    ? `${chalkFunction(`${error.message}\n${error.stack}`)}`
    : message;

  const header = `[${levelName.toUpperCase()}] [${getFormatedDate()}]`;

  console.log(chalkFunction(`${header} : ${message}`));
};

/**
 * Writes a JSON element to the console
 * @param levelName
 * @param JSONObject
 * @param error
 */
const writeToConsoleJSON = (
  levelName: string,
  JSONObject: JSON,
  error: Error
) => {
  writeToConsole(levelName, JSON.stringify(JSONObject), error);
};

/**
 * Write a formated message to a file.
 * @param levelName
 * @param message
 */
const writeToFile = (
  levelName: string,
  message: string,
  logDir: string = "./logs"
) => {
  const data = {
    level: levelName.toUpperCase(),
    message,
    timestamp: getFormatedDate(),
  };
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const options: fs.WriteFileOptions = {
    encoding: "utf8",
    mode: 438,
  };
  const fileName = `${logDir}/${levelName}-${data.timestamp.replaceAll(
    "/",
    "-"
  )}.log`;
  fs.appendFileSync(fileName, JSON.stringify(data) + "\r\n", options);
};

/**
 * Writes a JSON to a file
 * @param levelName
 * @param JSONObject
 * @param logDir
 */
const writeToFileJSON = (
  levelName: string,
  JSONObject: JSON,
  logDir: string = "./logs"
) => {
  writeToFile(levelName, JSON.stringify(JSONObject), logDir);
};

/**
 *
 * @param options
 * { logDir:string="./logs" , fileName:string }
 * @returns
 */
export const readLogAsync = async (options: {
  logDir?: string | undefined;
  fileName: string;
}) => {
  const logDir = options.logDir || "./logs";
  const fileName = options.fileName;
  return new Promise<any>((res, rej) => {
    const file = path.join(
      logDir,
      fileName?.includes(".") ? fileName : fileName + ".log"
    );
    console.log("-----file", file);
    const lineReader = readline.createInterface(fs.createReadStream(file));
    const logs: {}[] = [];
    lineReader.on("line", (line) => logs.push(JSON.parse(line)));
    lineReader.on("close", () => {
      console.log(
        chalk.yellow(`${fileName?.toUpperCase()} log has been accessed.`)
      );
      console.table(logs);
      res(logs);
    });
    lineReader.on("error", (e) => rej(e));
  });
};

/**
 * Get a timestamp in the form YYYY/MM/DD
 * @returns
 * The date in YYYY/MM/DD format
 */
const getFormatedDate = () => dayjs(Date.now()).format("YYYY/MM/DD");

/**
 *
 * @param levelName The Level name
 * @returns The Level name if it exists else return "info" as default
 */
const getLevelName = (levelName: string) => {
  return levelName && getConfig().levels[levelName] ? levelName : "info";
};

/**
 * Combines the base configuration file with any custom configurations user has made
 * @returns The configuration
 */
const getConfig = () => {
  return { levels: Object.assign({}, config.levels, customConfig.levels) };
};

/**
 * Adds a custom log configuration.
 * @param options
 * { level:string, color?:string|Array[number], writeToFile:boolean }
 * @return Function to call log
 */
export const addConfig = (options: {
  level: string;
  color?: string | Array<number>;
  writeToFile?: boolean;
}) => {
  if (
    options.level &&
    typeof options.level === "string" &&
    options.level.length > 0
  ) {
    //TODO ERROR Checking
    const levelName = options.level as string;
    const level: LevelData = {
      color: options.color ? options.color : "white",
      writeToFile: options.writeToFile === true ? true : false,
    };
    customConfig.levels[levelName] = level;
    /**
     * A log function for a custom configuration
     * @param options
     * OBJECT {level, message, JSON, error, logDir}
     * @returns
     */
    const logFunction = (options: {
      message?: string | undefined;
      JSON?: any;
      logDir?: string | undefined;
    }) => log({ level: levelName, ...options });
    return logFunction;
  } else
    throw new Error(
      'Options must be defined and have a non zero length string for key value "level"'
    );
};

/**
 * Removes a custom Log configuration
 * @param level The custom level to be deleted
 * @returns 1 if successfull 0 if fail
 */
export const removeConfig = (level: string) => {
  if (customConfig.levels[level]) {
    delete customConfig.levels[level];
    return 1;
  }
  return 0;
};

//************************************************/
//                                                /
//             Helper functions                   /
//                                                /
//************************************************/

/**
 * Logs a message as a INFORMATION log
 * @param {string} message
 */
export const infoLog = (options: {
  message?: string;
  JSON?: any;
  logDir?: string;
}) => {
  log({ level: "info", ...options });
};

/**
 * Logs a message as a DEBUG log
 * @param {string} message
 */
export const debugLog = (options: {
  message?: string;
  JSON?: any;
  logDir?: string;
}) => {
  log({ level: "debug", ...options });
};

/**
 * Logs a message as a SYSTEM log
 * @param {string} message
 */
export const systemLog = (options: {
  message?: string;
  JSON?: any;
  logDir?: string;
}) => {
  log({ level: "system", ...options });
};

/**
 * Logs a message as a DATABASE log
 * @param {string} message
 */
export const databaseLog = (options: {
  message?: string;
  JSON?: any;
  logDir?: string;
}) => {
  log({ level: "database", ...options });
};

/**
 * Logs a message as a EVENT log
 * @param {string} message
 */
export const eventLog = (options: {
  message?: string;
  JSON?: any;
  logDir?: string;
}) => {
  log({ level: "event", ...options });
};

/**
 * Logs a message as a WARNING log
 * @param {string} message
 */
export const warnLog = (options: {
  message?: string;
  JSON?: any;
  logDir?: string;
}) => {
  log({ level: "warn", ...options });
};

/**
 * Logs a message as a ERROR log
 * @param {string|Error} message
 */
export const errorLog = (options: {
  message: string | Error;
  logDir?: string | undefined;
}) => {
  if (typeof options.message === "string")
    log({ level: "error", message: options.message, logDir: options.logDir });
  else log({ level: "error", error: options.message, logDir: options.logDir });
};

/**
 * Logs a message as a FATAL log
 * @param {string|Error} message
 */
export const fatalLog = (options: {
  message: string | Error;
  logDir?: string | undefined;
}) => {
  if (typeof options.message === "string")
    log({ level: "fatal", message: options.message, logDir: options.logDir });
  else
    log({
      level: "fatal",
      error: options.message,
      logDir: options.logDir,
    });
};
