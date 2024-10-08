import { generateText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

interface CodeChange {
  file: string;
  action: "create" | "modify" | "delete";
  content?: string;
}

export async function implementChanges(
  prompt: string,
  workingDir: string
): Promise<void> {
  const projectFiles = await analyzeProjectFiles(workingDir);

  const fullPrompt = `You are an AI assistant that helps implement code changes. 
    Project context: ${projectFiles}
    User request: ${prompt}
    
    Analyze the request and project context, then use the available tools to implement the changes.
    All file operations should be performed directly in the current working directory (not in subdirectories).`;

  console.log("Full prompt being sent to OpenAI:");
  console.log(fullPrompt);
  console.log("---");

  const { text, toolCalls } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: fullPrompt,
    tools: {
      applyCodeChanges: tool({
        description:
          "Apply code changes to files directly in the current working directory",
        parameters: z.object({
          changes: z.array(
            z.object({
              file: z.string(),
              action: z.enum(["create", "modify", "delete"]),
              content: z.string().optional(),
            })
          ),
        }),
        execute: async ({ changes }) => {
          console.log("🚀 Running tool: applyCodeChanges");
          await applyCodeChangesImpl(changes, workingDir);
          return "Code changes applied successfully";
        },
      }),
      runCommands: tool({
        description: "Run necessary commands",
        parameters: z.object({
          commands: z.array(z.string()),
        }),
        execute: async ({ commands }) => {
          console.log("🚀 Running tool: runCommands");
          await runNecessaryCommandsImpl(commands, workingDir);
          return "Commands executed successfully";
        },
      }),
    },
    maxSteps: 5,
  });

  console.log("AI response:", text);
  console.log("Tool calls:", toolCalls);
  outputGitCommitMessage(prompt);
}

async function analyzeProjectFiles(workingDir: string): Promise<string> {
  try {
    const files = await fs.readdir(workingDir);
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(workingDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          const content = await fs.readFile(filePath, "utf-8");
          return `${file}:\n${content}\n`;
        }
        return `${file}: [Directory]\n`;
      })
    );
    return `Files in current working directory:\n${fileContents.join("\n")}`;
  } catch (error) {
    return "No files found in current working directory";
  }
}

async function applyCodeChangesImpl(
  changes: CodeChange[],
  workingDir: string
): Promise<void> {
  for (const change of changes) {
    const filePath = path.join(workingDir, path.basename(change.file));

    console.log(`Processing file: ${filePath}`);

    try {
      switch (change.action) {
        case "create":
        case "modify":
          if (change.content === undefined) {
            console.error(
              `Error: Content missing for ${change.action} action on file ${filePath}`
            );
            continue;
          }
          console.log(
            `${
              change.action === "create" ? "Creating" : "Modifying"
            } file: ${filePath}`
          );
          await fs.writeFile(filePath, change.content, "utf-8");
          break;
        case "delete":
          console.log(`Deleting file: ${filePath}`);
          await fs.unlink(filePath);
          break;
        default:
          console.error(
            `Unknown action ${(change as any).action} for file ${filePath}`
          );
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
}

async function runNecessaryCommandsImpl(
  commands: string[],
  workingDir: string
): Promise<void> {
  for (const command of commands) {
    console.log(`Running command: ${command}`);
    // For safety, we're not executing commands. Uncomment the following line if you want to enable command execution:
    // await execAsync(command, { cwd: workingDir });
  }
}

function outputGitCommitMessage(prompt: string): void {
  console.log("Git commit message (not actually committed):");
  console.log(`Implemented changes: ${prompt}`);
}

// Uncomment and use this helper function if you decide to enable command execution
// import { exec } from 'child_process';
// import { promisify } from 'util';
// const execAsync = promisify(exec);
