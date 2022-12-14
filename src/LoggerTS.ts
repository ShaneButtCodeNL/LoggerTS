import { config } from "./config";
import * as path from "path";
import chalk from "chalk";
const dayjs = require("dayjs");
import * as fs from "fs";
import * as readline from "readline";
import { Level, LevelData } from "./Level";

// used to validate hex values
// ex #000 #1af #1Af #000000 #123aCf all will be valid
const hexRegex = /^#([a-f0-9]{6}|[a-f0-9]{3})$/i;

/**
 *  Make an error for color defined by an array if 3 values not given like RGB
 * @param levelName The level name
 * @param color The array of RGB values
 * @returns an error stating the array must have 3 values
 */
const makeErrorArrayLengthRGB = (levelName: string, color: Array<any>) =>
  new Error(
    `An error has been detected in configuration for level [${chalk.red(
      levelName.toUpperCase()
    )}]. The value of color is set to an array which is for RGB values. The array should have '${chalk.red(
      "3"
    )}' values, but we detected '${chalk.red(
      "" + color.length
    )}' values. Please ${color.length > 3 ? "remove" : "add"} ${Math.abs(
      color.length - 3
    )} values.`
  );

/**
 * Makes an error to state that a value in the array is outside the range [0,255]
 * @param position The position that is outside range
 * @param value The value at said position
 * @param levelName The level name in configuration
 * @returns An Error
 */
const makeErrorRangeValue = (
  position: number,
  value: number,
  levelName: string
) =>
  new Error(
    `An error has been detected in configuration for level [${chalk.red(
      levelName.toUpperCase()
    )}]. The value of color is set to an array which is for RGB values. The array should be in the range [${chalk.red(
      " 0 , 255 "
    )}]. At position [ ${position} ] we detected a value of [ ${chalk.red(
      value
    )} ]. Please Enter a value at position [ ${position} ] that is greater or equal to 0 and less than or equal to 255.`
  );

/**
 * Makes an error for when a non number value is found in RGB array
 * @param position The Position
 * @param typeOfValue The type of value found
 * @param levelName The level name in the config
 * @returns
 */
const makeErrorArrayType = (
  position: number,
  typeOfValue: string,
  levelName: string
) =>
  new Error(
    `An error has been detected in configuration for level [${chalk.red(
      levelName.toUpperCase()
    )}]. The value of color is set to an array which is for RGB values. The array should have a '${chalk.red(
      "number"
    )}' at position [ ${position} ], but we detected a '${chalk.red(
      typeOfValue
    )}' value. Please Enter a "number" value at position [ ${position} ].`
  );

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
  if (!options) throw new Error("Options must be given.");
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
  if (!level) throw new Error(`Not a valid Level`);
  //Hex
  if (level.color[0] === "#") {
    if (!hexRegex.test(level.color))
      throw new Error(
        `An error has been detected in configuration for level [${chalk.red(
          levelName.toUpperCase()
        )}]. The value of color must be a hex value starting with "#". Must be in range [0,9] or A,B,C,D,E,F. The value length must also be "3" or "6". We Found [ ${chalk.red(
          level.color
        )} ], Length: ${chalk.red(
          level.color.length - 1
        )}. Please use a valid hex value.`
      );
    chalkFunction = chalk.hex(level.color);
  } else if (Array.isArray(level.color)) {
    //Check if there are 3 values [red,green,blue]
    if (level.color.length !== 3) {
      throw makeErrorArrayLengthRGB(levelName, level.color);
    }
    //Check for value types of RGB Array
    if (typeof level.color[0] !== "number")
      throw makeErrorArrayType(0, typeof level.color[0], levelName);
    if (typeof level.color[1] !== "number")
      throw makeErrorArrayType(1, typeof level.color[1], levelName);
    if (typeof level.color[2] !== "number")
      throw makeErrorArrayType(2, typeof level.color[2], levelName);
    //Check values are in range [0,255]
    if (level.color[0] < 0 || level.color[0] > 255)
      throw makeErrorRangeValue(0, level.color[0], levelName);
    if (level.color[1] < 0 || level.color[1] > 255)
      throw makeErrorRangeValue(1, level.color[1], levelName);
    if (level.color[2] < 0 || level.color[2] > 255)
      throw makeErrorRangeValue(2, level.color[2], levelName);
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
  console.log(
    chalk.yellowBright(
      ` [ ${levelName.toUpperCase()} ] Log created at ${fileName}. `
    )
  );
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
  if (levelName && getConfig().levels[levelName]) return levelName;
  throw new Error(
    `Given Level: ${chalk.red(
      levelName
    )}, was not found in the configuration file. Please use a valid value or add this value to the configuration using " addConfig " function`
  );
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
  if (!options) throw new Error("Options must be defined.");
  if (
    options.level &&
    typeof options.level === "string" &&
    options.level.length > 0
  ) {
    //Check rgb
    if (Array.isArray(options.color)) {
      //Check if there are 3 values [red,green,blue]
      if (options.color.length !== 3) {
        throw makeErrorArrayLengthRGB(options.level, options.color);
      }
      //Check for value types of RGB Array
      if (typeof options.color[0] !== "number")
        throw makeErrorArrayType(0, typeof options.color[0], options.level);
      if (typeof options.color[1] !== "number")
        throw makeErrorArrayType(1, typeof options.color[1], options.level);
      if (typeof options.color[2] !== "number")
        throw makeErrorArrayType(2, typeof options.color[2], options.level);
      //Check values are in range [0,255]
      if (options.color[0] < 0 || options.color[0] > 255)
        throw makeErrorRangeValue(0, options.color[0], options.level);
      if (options.color[1] < 0 || options.color[1] > 255)
        throw makeErrorRangeValue(1, options.color[1], options.level);
      if (options.color[2] < 0 || options.color[2] > 255)
        throw makeErrorRangeValue(2, options.color[2], options.level);
      //All good
    }

    //Check hex
    if (options.color && options.color[0] === "#") {
      if (!hexRegex.test("" + options.color))
        throw new Error(
          `An error has been detected in configuration for level [${chalk.red(
            options.level.toUpperCase()
          )}]. The value of color must be a hex value starting with "#". Must be in range [0,9] or A,B,C,D,E,F. The value length must also be "3" or "6". We Found [ ${chalk.red(
            options.color
          )} ], Length: ${chalk.red(
            options.color.length - 1
          )}. Please use a valid hex value.`
        );
      //All Good
    }

    const levelName = options.level.toLowerCase() as string;
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
