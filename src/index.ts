#!/usr/bin/env bun
import { Command } from "commander";
import { implementChanges } from "./implement-changes.js";

const program = new Command();

program
  .name("aic")
  .description("CLI tool to implement code changes using AI")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate code changes based on a natural language prompt")
  .argument(
    "<prompt...>",
    "Natural language prompt describing the desired changes"
  )
  .action(async (promptArgs: string[]) => {
    const prompt = promptArgs.join(" ");
    try {
      console.log("Received prompt:", prompt);
      console.log("---");
      await implementChanges(prompt, process.cwd());
      console.log("---");
      console.log("Changes implemented successfully!");
    } catch (error) {
      console.error("Error implementing changes:", error);
    }
  });

program.parse();
