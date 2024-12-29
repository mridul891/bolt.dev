require("dotenv").config();
import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import express from "express";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { basePrompt as nodeBasePrompt } from "./defaults/node";

const app = express();
const anthropic = new Anthropic();
app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt as string;
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    system:
      "Return either node or react based on what do you think his project should be .Only return a single word either 'react' or 'node' ,Do not return anything else ",
    messages: [{ role: "user", content: prompt }],
  });

  const answer = (response.content[0] as TextBlock).text;

  if (answer === "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  if (answer === "node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  res.status(403).json({
    message: "You cannot access it ",
  });
  return;
});

// const main = async () => {
//   const msg = anthropic.messages
//     .stream({
//       model: "claude-3-5-sonnet-20241022",
//       max_tokens: 8000,
//       system: getSystemPrompt(),
//       messages: [
//         { role: "user", content: "Hello, Claude" },
//         {
//           role: "user",
//           content: "",
//         },
//       ],
//     })
//     .on("text", (text) => {
//       console.log(text);
//     });
//   console.log(msg);
// };

// main();

app.listen(3000, () => {
  console.log("The server is started at port  : 3000");
});
