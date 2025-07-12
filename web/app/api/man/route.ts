import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "No man page ID provided" },
        { status: 400 },
      );
    }

    const baseDir = path.join(os.homedir(), ".cache", "fetchman");
    const filePath = path.join(baseDir, `${id}.md`);

    console.log("Looking for file at:", filePath);
    console.log("Base directory exists:", fs.existsSync(baseDir));
    console.log("File exists:", fs.existsSync(filePath));

    // List files in directory for debugging
    if (fs.existsSync(baseDir)) {
      const files = fs.readdirSync(baseDir);
      console.log("Files in directory:", files);
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          error: `Man page not found: ${id}.md`,
          path: filePath,
          baseDir: baseDir,
        },
        { status: 404 },
      );
    }

    const content = fs.readFileSync(filePath, "utf8");
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error reading man page:", error);
    return NextResponse.json(
      {
        error: "Failed to read man page",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
