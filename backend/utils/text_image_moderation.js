import OpenAi from "openai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log(process.env.OPENAI_API_KEY);

const OPEN_AI_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAi({
  apiKey: OPEN_AI_KEY,
});

export async function moderationFunction(content, type = "text") {
  try {
    console.log(`Moderating... Type: ${type} & Content: ${content}`);

    if (!content || content.trim().length < 1) {
      const error = new Error("Invalid Content Passed");
      error.status = 400;
      throw error;
    }

    if (!type || (type !== "text" && type !== "image")) {
      const error = new Error("Invalid Type Passed");
      error.status = 400;
      throw error;
    }

    const text_input = content.trim();
    const image_input = [
      {
        type: "image_url",
        image_url: { url: content.trim() },
      },
    ];

    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: type === "text" ? text_input : image_input,
    });

    const response_data = moderation.results[0];
    const categories = [];

    for (let [key, value] of Object.entries(response_data.categories)) {
      if (value) {
        categories.push({ [key]: response_data.category_scores[key] * 100 });
      }
    }

    const return_data = {
      flagged: response_data.flagged,
      categories,
    };

    console.log(return_data);
    // console.log(moderation.results);

    return return_data;
  } catch (error) {
    console.error("Moderation function error:", error);

    const newError = new Error(error.message || "Unknown Error Occurred");
    newError.status = error.status || 500;
    throw newError;
  }
}

// await moderationFunction("I want to kill myself", "text");
