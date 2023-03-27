import { Configuration, OpenAIApi } from "openai";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const diff = await execAsync("git diff");

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const completion = await openai.createChatCompletion({
  model: "gpt-4",
  messages: [
    {
      role: "user",
      content: [
        "Create a commit message for a diff, using the following format:",
        "",
        "[Commit title, no more than 50 characters]",
        "",
        "[Longer commit description]",
        "",
        "For the longer description, make sure lines are no longer than 72 characters.",
        "",
        "Diff:",
        diff,
      ].join("\n"),
    },
  ],
});

console.log(completion.data.choices[0].message);
