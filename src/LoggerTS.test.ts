import { debugLog } from "./LoggerTS";
import { config } from "./config";
import chalk from "chalk";

const dayjs = require("dayjs");
const date = dayjs(Date.now()).format("YYYY/MM/DD");
test("debug log with no dir", () => {
  const logSpy = jest.spyOn(console, "log");
  const msg = "Testing Debug Log";
  const chalkFunction = chalk.hex(config.levels.debug.color);
  debugLog(msg);
  expect(logSpy).toBeCalledWith(chalkFunction(`[DEBUG] [${date}] : ${msg}`));
});
