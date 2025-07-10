import { promises as fs } from "fs";
import path from "path";
import os from "os";

export async function getManPage(id: string): Promise<string | null> {
  try {
    const filePath = path.join(
      os.homedir(),
      ".cache",
      "fetchman",
      `${id}.html`,
    );
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    throw error;
  }
}
