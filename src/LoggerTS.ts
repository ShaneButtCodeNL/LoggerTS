import { config } from "./config";
import * as path from "path";
import chalk from "chalk";
const dayjs = require("dayjs");
import * as fs from "fs";
import * as readline from "readline";
import { Level, LevelData } from "./Level";

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
 * OBJECT {level, message, error, logDir}
 */
export const log = (options: any) => {
  const levelName: string = getLevelName(options.level);
  let message = options.message ?? "";
  const error = options.error ?? null;

  writeToConsole(levelName, message, error);
  if (getConfig().levels[levelName].writeToFile) {
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
 *
 * @param options
 * { logDir:string="./logs" , fileName:string }
 * @returns
 */
export const readLogAsync = async (options: any) => {
  const logDir = options.logDir || "./logs";
  const fileName = options.fileName;
  return new Promise<any>((res, rej) => {
    const file = path.join(
      logDir,
      fileName?.includes(".") ? fileName : fileName + ".log"
    );
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
 */
export const addConfig = (options: any) => {
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
    //console.log(getConfig());
  } else
    throw new Error(
      'Options must be defined and have a non zero length string for key value "level"'
    );
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
export const infoLog = (message: string, logDir?: string) => {
  log({ level: "info", message: message, logDir });
};

/**
 * Logs a message as a DEBUG log
 * @param {string} message
 */
export const debugLog = (message: string, logDir?: string) => {
  log({ level: "debug", message: message, logDir });
};

/**
 * Logs a message as a SYSTEM log
 * @param {string} message
 */
export const systemLog = (message: string, logDir?: string) => {
  log({ level: "system", message: message, logDir });
};

/**
 * Logs a message as a DATABASE log
 * @param {string} message
 */
export const databaseLog = (message: string, logDir?: string) => {
  log({ level: "database", message: message, logDir });
};

/**
 * Logs a message as a EVENT log
 * @param {string} message
 */
export const eventLog = (message: string, logDir?: string) => {
  log({ level: "event", message: message, logDir });
};

/**
 * Logs a message as a WARNING log
 * @param {string} message
 */
export const warnLog = (message: string, logDir?: string) => {
  log({ level: "warn", message: message, logDir });
};

/**
 * Logs a message as a ERROR log
 * @param {string|Error} message
 */
export const errorLog = (message: string | Error, logDir?: string) => {
  console.log(typeof message, "error");
  if (typeof message === "string")
    log({ level: "error", message: message, logDir });
  else log({ level: "error", error: message, logDir });
};

/**
 * Logs a message as a FATAL log
 * @param {string|Error} message
 */
export const fatalLog = (message: string | Error, logDir?: string) => {
  if (typeof message === "string")
    log({ level: "fatal", message: message, logDir });
  else
    log({ level: "fatal", message: message.message, error: message, logDir });
};
