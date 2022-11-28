import {
  log,
  debugLog,
  infoLog,
  systemLog,
  databaseLog,
  eventLog,
  warnLog,
  errorLog,
  fatalLog,
  addConfig,
  removeConfig,
  readLogAsync,
} from "./LoggerTS";
import * as readline from "readline";
import * as path from "path";

import { config } from "./config";
const fs = require("fs");
import { mkdirSync, WriteFileOptions, createReadStream, existsSync } from "fs";
import chalk from "chalk";
import { PassThrough } from "stream";

let testNumber = 1;
const testNumberLength = 2;
const formatTestNumber = (num: number, length: number) => {
  let output = `${num}`;
  output =
    "0".repeat(length > output.length ? length - output.length : 0) + output;
  return output;
};
const getTestNumber = () =>
  `[${formatTestNumber(testNumber++, testNumberLength)}]`;
let suiteNumber = 1;
const suiteNumberLength = 2;
const getSuiteNumber = () =>
  `[${formatTestNumber(suiteNumber++, suiteNumberLength)}]`;
const getTestName = (name: string) => `${getTestNumber()} ${name}`;
const getSuiteName = (name: string) =>
  `\n${chalk.bgWhiteBright`${getSuiteNumber()} ${name} `}`;

const dayjs = require("dayjs");
const date = dayjs(Date.now()).format("YYYY/MM/DD");
const dateDashes = dayjs(Date.now()).format("YYYY-MM-DD");
const fileName = `./logs/debug-${dateDashes}.log`;
const DebugMessage = "Testing Debug Log";
const DebugObject = {
  message: "TEST",
  number: 42069,
  numbers: [1, 2, 3, 4, 5],
  object: {
    a: "a",
    b: 1,
    c: true,
  },
};
const fileWriteOptions: WriteFileOptions = {
  encoding: "utf8",
  mode: 438,
};
const debugFileDataMessage = {
  level: "DEBUG",
  message: DebugMessage,
  timestamp: date,
};
const debugFileDataObject = {
  level: "DEBUG",
  message: JSON.stringify(DebugObject),
  timestamp: date,
};
const debugChalkFunction = chalk.hex(config.levels.debug.color);

// test(getTestName(""),()=>{})

jest.mock("fs");
jest.mock("readline");
//jest.dontMock("./LoggerTS");

describe(getSuiteName("Test functions that log"), () => {
  it(getTestName("debug log with string message, and no dir"), () => {
    const logSpy = jest.spyOn(console, "log");
    const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
    debugLog({ message: DebugMessage });
    expect(logSpy).toBeCalledWith(
      debugChalkFunction(`[DEBUG] [${date}] : ${DebugMessage}`)
    );
    expect(appendFileSyncSpy).toBeCalledWith(
      fileName,
      JSON.stringify(debugFileDataMessage) + "\r\n",
      fileWriteOptions
    );
    logSpy.mockClear();
    appendFileSyncSpy.mockClear();
  });

  it(getTestName("debug log with string message, and dir"), () => {
    const logSpy = jest.spyOn(console, "log");
    const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
    const dir = "tempLogDir";
    const tempFileName = `${dir}/debug-${dateDashes}.log`;
    debugLog({ message: DebugMessage, logDir: dir });
    expect(logSpy).toBeCalledWith(
      debugChalkFunction(`[DEBUG] [${date}] : ${DebugMessage}`)
    );
    expect(appendFileSyncSpy).toBeCalledWith(
      tempFileName,
      JSON.stringify(debugFileDataMessage) + "\r\n",
      fileWriteOptions
    );
    logSpy.mockClear();
    appendFileSyncSpy.mockClear();
  });

  it(
    getTestName("debug log using the log function, string message, and no dir"),
    () => {
      const logSpy = jest.spyOn(console, "log");
      const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
      log({ level: "debug", message: DebugMessage });
      expect(logSpy).toBeCalledWith(
        debugChalkFunction(`[DEBUG] [${date}] : ${DebugMessage}`)
      );
      expect(appendFileSyncSpy).toBeCalledWith(
        fileName,
        JSON.stringify(debugFileDataMessage) + "\r\n",
        fileWriteOptions
      );
      logSpy.mockClear();
      appendFileSyncSpy.mockClear();
    }
  );

  it(
    getTestName("debug log using the log function, string message, and a dir"),
    () => {
      const logSpy = jest.spyOn(console, "log");
      const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
      const dir = "tempLogDir";
      const tempFileName = `${dir}/debug-${dateDashes}.log`;
      log({ level: "debug", message: DebugMessage, logDir: dir });
      expect(logSpy).toBeCalledWith(
        debugChalkFunction(`[DEBUG] [${date}] : ${DebugMessage}`)
      );
      expect(appendFileSyncSpy).toBeCalledWith(
        tempFileName,
        JSON.stringify(debugFileDataMessage) + "\r\n",
        fileWriteOptions
      );
      logSpy.mockClear();
      appendFileSyncSpy.mockClear();
    }
  );

  it(getTestName("debug log with object, and no dir"), () => {
    const logSpy = jest.spyOn(console, "log");
    const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
    debugLog({ JSON: DebugObject });
    expect(logSpy).toBeCalledWith(
      debugChalkFunction(`[DEBUG] [${date}] : ${JSON.stringify(DebugObject)}`)
    );
    expect(appendFileSyncSpy).toBeCalledWith(
      fileName,
      JSON.stringify(debugFileDataObject) + "\r\n",
      fileWriteOptions
    );
    logSpy.mockClear();
    appendFileSyncSpy.mockClear();
  });

  it(getTestName("debug log with object, and dir"), () => {
    const logSpy = jest.spyOn(console, "log");
    const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
    const dir = "tempLogDir";
    const tempFileName = `${dir}/debug-${dateDashes}.log`;
    debugLog({ JSON: DebugObject, logDir: dir });
    expect(logSpy).toBeCalledWith(
      debugChalkFunction(`[DEBUG] [${date}] : ${JSON.stringify(DebugObject)}`)
    );
    expect(appendFileSyncSpy).toBeCalledWith(
      tempFileName,
      JSON.stringify(debugFileDataObject) + "\r\n",
      fileWriteOptions
    );
    logSpy.mockClear();
    appendFileSyncSpy.mockClear();
  });

  it(
    getTestName("debug log using the log function, object, and no dir"),
    () => {
      const logSpy = jest.spyOn(console, "log");
      log({ level: "debug", JSON: DebugObject });
      const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
      expect(logSpy).toBeCalledWith(
        debugChalkFunction(`[DEBUG] [${date}] : ${JSON.stringify(DebugObject)}`)
      );
      expect(appendFileSyncSpy).toBeCalledWith(
        fileName,
        JSON.stringify(debugFileDataObject) + "\r\n",
        fileWriteOptions
      );
      logSpy.mockClear();
      appendFileSyncSpy.mockClear();
    }
  );

  it(getTestName("debug log using the log function, object, and a dir"), () => {
    const logSpy = jest.spyOn(console, "log");
    const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
    const dir = "tempLogDir";
    const tempFileName = `${dir}/debug-${dateDashes}.log`;
    log({ level: "debug", JSON: DebugObject, logDir: dir });
    expect(logSpy).toBeCalledWith(
      debugChalkFunction(`[DEBUG] [${date}] : ${JSON.stringify(DebugObject)}`)
    );
    expect(appendFileSyncSpy).toBeCalledWith(
      tempFileName,
      JSON.stringify(debugFileDataObject) + "\r\n",
      fileWriteOptions
    );
    logSpy.mockClear();
    appendFileSyncSpy.mockClear();
  });
});

describe(getSuiteName("Test helper functions"), () => {
  test(
    getTestName("All default log helper functions string message default dir"),
    () => {
      const logSpy = jest.spyOn(console, "log");
      const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
      const message = "test message";
      const options = { message };
      debugLog(options); //1
      infoLog(options); //2
      systemLog(options); //3
      databaseLog(options); //4
      eventLog(options); //5
      warnLog(options); //6
      errorLog(options); //7
      fatalLog(options); //8
      const count = 8;
      expect(logSpy).toBeCalledTimes(2 * count);
      expect(appendFileSyncSpy).toBeCalledTimes(count);
      logSpy.mockClear();
      appendFileSyncSpy.mockClear();
    }
  );
  it(getTestName("All default log helper functions object default dir"), () => {
    const logSpy = jest.spyOn(console, "log");
    const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
    const message = {
      message: "test message",
      message2: "test message 2",
      ALLTHEWAY: 42069,
    };
    const options = { JSON: message };
    debugLog(options); //1
    infoLog(options); //2
    systemLog(options); //3
    databaseLog(options); //4
    eventLog(options); //5
    warnLog(options); //6
    const count = 6;
    expect(logSpy).toBeCalledTimes(2 * count);
    expect(appendFileSyncSpy).toBeCalledTimes(count);
    logSpy.mockClear();
    appendFileSyncSpy.mockClear();
  });
});

describe(getSuiteName("Test Custom Configurations"), () => {
  it(
    getTestName("Adding a custom configuration and updateing the config"),
    () => {
      const logSpy = jest.spyOn(console, "log");
      const appendFileSyncSpy = jest.spyOn(fs, "appendFileSync");
      const c1 = addConfig({
        level: "custom1",
        color: [100, 100, 100],
        writeToFile: false,
      });
      const c2 = addConfig({
        level: "custom2",
        color: "#123456",
        writeToFile: false,
      });
      const c3 = addConfig({
        level: "custom3",
        color: "cyan",
        writeToFile: true,
      });
      const dir = "testConfigLogs";
      //Should return functions
      expect(c1).toEqual(expect.any(Function));
      expect(c2).toEqual(expect.any(Function));
      expect(c3).toEqual(expect.any(Function));
      c2({
        message: "test 1",
      });
      //Logs but doesn't write to file
      expect(logSpy).toHaveBeenCalled();
      expect(appendFileSyncSpy).not.toHaveBeenCalled();
      jest.clearAllMocks();

      c3({
        message: "test 2",
        logDir: dir,
      });
      //Should console.log and write to file
      expect(logSpy).toHaveBeenCalled();
      expect(appendFileSyncSpy).toHaveBeenCalled();
      jest.clearAllMocks();

      //Update config
      addConfig({
        level: "debug",
        color: "#000000",
        writeToFile: false,
      });
      debugLog({
        message: "test 3",
      });
      const debugChalkFunctionNew = chalk.hex("#000000");
      expect(logSpy).toBeCalledWith(
        debugChalkFunctionNew(`[DEBUG] [${date}] : test 3`)
      );
      expect(appendFileSyncSpy).not.toHaveBeenCalled();
      jest.clearAllMocks();

      //Delete config
      const succ = removeConfig("debug");
      debugLog({ message: "test 4" });
      expect(succ).toEqual(1);
      expect(logSpy).toBeCalledWith(
        debugChalkFunction(`[DEBUG] [${date}] : test 4`)
      );
      expect(appendFileSyncSpy).toHaveBeenCalled();
      jest.clearAllMocks();

      c1({ message: "test 5" });
      expect(logSpy).toHaveBeenCalled();
      expect(appendFileSyncSpy).not.toHaveBeenCalled();
      jest.clearAllMocks();
    }
  );
});

//TODO readLog and Error
describe(getSuiteName("Test Error states"), () => {
  it(getTestName("Log should throw error if no args given"), () => {
    expect(log).toThrow();
  });

  it(
    getTestName(
      "Given an config level that isn't defined should throw an error"
    ),
    () => {
      const level = "ThisLevelDoesn'tExist";
      expect(() => log({ level, message: "test" })).toThrow(
        `Given Level: ${chalk.red(
          level
        )}, was not found in the configuration file. Please use a valid value or add this value to the configuration using " addConfig " function`
      );
    }
  );

  it(getTestName("addConfig with no options parameter must fail"), () => {
    expect(addConfig).toThrow();
  });

  it(
    getTestName(
      "Given an array of less than 3 values for color in config should throw error"
    ),
    () => {
      expect(() =>
        addConfig({ level: "rgbwith2values", color: [100, 100] })
      ).toThrow();
    }
  );

  it(
    getTestName(
      "Given an array of more than 3 values for color in config should throw error"
    ),
    () => {
      expect(() =>
        addConfig({ level: "rgbwith4values", color: [100, 100, 100, 100] })
      ).toThrow();
    }
  );

  it(
    getTestName(
      "Hex color with 3 values and one out of range should throw error"
    ),
    () => {
      expect(() => addConfig({ level: "#12G", color: "#12G" })).toThrow();
    }
  );
  it(
    getTestName(
      "Hex Color with 6 values and one out of range should throw error"
    ),
    () => {
      expect(() => addConfig({ level: "#12345Y", color: "#12345Y" })).toThrow();
    }
  );
  it(
    getTestName("Hex Color with neither 3 or 6 values should throw error"),
    () => {
      expect(() => addConfig({ level: "#12345", color: "#12345" })).toThrow();
    }
  );
});
