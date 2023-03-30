import { Configuration, OpenAIApi } from "openai";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

class CommitMessageGenerator {
  #openai;

  constructor(openai) {
    this.#openai = openai;
  }

  async #getDiff() {
    const { stdout: diff } = await execAsync("git diff HEAD");
    return diff;
  }

  async generateCommitMessage() {
    const diff = await this.#getDiff();

    const completion = await this.#openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: [
            "You are a commit message creator. You will create a git commit message from the diff using the following format:",
            "",
            "[Commit title, no more than 50 characters]",
            "",
            "[Longer commit description, split at 72 characters]",
          ].join("\n"),
        },
        {
          role: "user",
          content:
            "Can you create a git commit message from a diff that I provide? Just reply with the actual commit message. Do not include the diff itself.",
        },
        {
          role: "assistant",
          content:
            "Sure, please provide me with the diff and I can create the commit message for you.",
        },
        {
          role: "user",
          content: diff,
        },
      ],
    });

    return completion.data.choices[0].message.content;
  }
}

const generator = new CommitMessageGenerator(openai);
console.log(await generator.generateCommitMessage());
