export interface Level extends Record<string, LevelData> {
  [level: string]: LevelData;
}

export interface LevelData
  extends Record<string, string | Array<number> | boolean> {
  color: string | Array<number>;
  writeToFile: boolean;
}
