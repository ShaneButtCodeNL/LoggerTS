import { config } from "./config";
import * as path from "path";
import chalk from "chalk";
const dayjs = require("dayjs");
import * as fs from "fs";
import * as readline from "readline";

/**
 *
 * @param options
 * OBJECT {level, message, error}
 */
export const log = (options: any) => {
  const levelName: string = getLevelName(options.level);
  let message = options.message ?? "";
  const error = options.error ?? null;

  writeToConsole(levelName, message, error);
  if (config.levels[levelName].writeToFile) {
    writeToFile(levelName, message);
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
  const level = config.levels[levelName] || null;
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
 * Read logs
 * @param logDir
 * @param fileName
 * @returns Promise
 */
export const readLogAsync = async (
  logDir: string = "./logs",
  fileName: string | null = null
) => {
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
  return levelName && config.levels[levelName] ? levelName : "info";
};
