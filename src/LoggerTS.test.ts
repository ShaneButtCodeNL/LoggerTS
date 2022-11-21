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
} from "./LoggerTS";
import { config } from "./config";
const fs = require("fs");
import { WriteFileOptions, appendFileSync, fstat } from "fs";
import chalk from "chalk";

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
const getTestName = (name: string) => `${getTestNumber()} ${name}`;
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

jest.mock("fs");

test(getTestName("debug log with string message, and no dir"), () => {
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

test(getTestName("debug log with string message, and dir"), () => {
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

test(
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

test(
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

test(getTestName("debug log with object, and no dir"), () => {
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

test(getTestName("debug log with object, and dir"), () => {
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

test(
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

test(getTestName("debug log using the log function, object, and a dir"), () => {
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
    expect(logSpy).toBeCalledTimes(count);
    expect(appendFileSyncSpy).toBeCalledTimes(count);
    logSpy.mockClear();
    appendFileSyncSpy.mockClear();
  }
);
