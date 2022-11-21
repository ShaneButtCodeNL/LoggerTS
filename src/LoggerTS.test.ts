import { log, debugLog } from "./LoggerTS";
import { config } from "./config";
import { WriteFileOptions, appendFileSync } from "fs";
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
  debugLog({ message: DebugMessage });
  expect(logSpy).toBeCalledWith(
    debugChalkFunction(`[DEBUG] [${date}] : ${DebugMessage}`)
  );
  expect(appendFileSync).toBeCalledWith(
    fileName,
    JSON.stringify(debugFileDataMessage) + "\r\n",
    fileWriteOptions
  );
});

test(getTestName("debug log with string message, and dir"), () => {
  const logSpy = jest.spyOn(console, "log");
  const dir = "tempLogDir";
  const tempFileName = `${dir}/debug-${dateDashes}.log`;

  debugLog({ message: DebugMessage, logDir: dir });
  expect(logSpy).toBeCalledWith(
    debugChalkFunction(`[DEBUG] [${date}] : ${DebugMessage}`)
  );
  expect(appendFileSync).toHaveBeenCalled();
  expect(appendFileSync).toBeCalledWith(
    tempFileName,
    JSON.stringify(debugFileDataMessage) + "\r\n",
    fileWriteOptions
  );
});

test(
  getTestName("debug log using the log function, string message, and no dir"),
  () => {
    const logSpy = jest.spyOn(console, "log");
    log({ level: "debug", message: DebugMessage });
    expect(logSpy).toBeCalledWith(
      debugChalkFunction(`[DEBUG] [${date}] : ${DebugMessage}`)
    );
    expect(appendFileSync).toHaveBeenCalled();
    expect(appendFileSync).toBeCalledWith(
      fileName,
      JSON.stringify(debugFileDataMessage) + "\r\n",
      fileWriteOptions
    );
  }
);

test(
  getTestName("debug log using the log function, string message, and a dir"),
  () => {
    const logSpy = jest.spyOn(console, "log");
    const dir = "tempLogDir";
    const tempFileName = `${dir}/debug-${dateDashes}.log`;
    log({ level: "debug", message: DebugMessage, logDir: dir });
    expect(logSpy).toBeCalledWith(
      debugChalkFunction(`[DEBUG] [${date}] : ${DebugMessage}`)
    );
    expect(appendFileSync).toHaveBeenCalled();
    expect(appendFileSync).toBeCalledWith(
      tempFileName,
      JSON.stringify(debugFileDataMessage) + "\r\n",
      fileWriteOptions
    );
  }
);

test(getTestName("debug log with object, and no dir"), () => {
  const logSpy = jest.spyOn(console, "log");
  debugLog({ JSON: DebugObject });
  expect(logSpy).toBeCalledWith(
    debugChalkFunction(`[DEBUG] [${date}] : ${JSON.stringify(DebugObject)}`)
  );
  expect(appendFileSync).toBeCalledWith(
    fileName,
    JSON.stringify(debugFileDataObject) + "\r\n",
    fileWriteOptions
  );
});

test(getTestName("debug log with object, and dir"), () => {
  const logSpy = jest.spyOn(console, "log");
  const dir = "tempLogDir";
  const tempFileName = `${dir}/debug-${dateDashes}.log`;

  debugLog({ JSON: DebugObject, logDir: dir });
  expect(logSpy).toBeCalledWith(
    debugChalkFunction(`[DEBUG] [${date}] : ${JSON.stringify(DebugObject)}`)
  );
  expect(appendFileSync).toHaveBeenCalled();
  expect(appendFileSync).toBeCalledWith(
    tempFileName,
    JSON.stringify(debugFileDataObject) + "\r\n",
    fileWriteOptions
  );
});

test(
  getTestName("debug log using the log function, object, and no dir"),
  () => {
    const logSpy = jest.spyOn(console, "log");
    log({ level: "debug", JSON: DebugObject });
    expect(logSpy).toBeCalledWith(
      debugChalkFunction(`[DEBUG] [${date}] : ${JSON.stringify(DebugObject)}`)
    );
    expect(appendFileSync).toHaveBeenCalled();
    expect(appendFileSync).toBeCalledWith(
      fileName,
      JSON.stringify(debugFileDataObject) + "\r\n",
      fileWriteOptions
    );
  }
);

test(getTestName("debug log using the log function, object, and a dir"), () => {
  const logSpy = jest.spyOn(console, "log");
  const dir = "tempLogDir";
  const tempFileName = `${dir}/debug-${dateDashes}.log`;
  log({ level: "debug", JSON: DebugObject, logDir: dir });
  expect(logSpy).toBeCalledWith(
    debugChalkFunction(`[DEBUG] [${date}] : ${JSON.stringify(DebugObject)}`)
  );
  expect(appendFileSync).toHaveBeenCalled();
  expect(appendFileSync).toBeCalledWith(
    tempFileName,
    JSON.stringify(debugFileDataObject) + "\r\n",
    fileWriteOptions
  );
});
