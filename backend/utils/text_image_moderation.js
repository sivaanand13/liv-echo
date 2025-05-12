import OpenAi from "openai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { text } from "stream/consumers";
import { url } from "inspector";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// console.log(process.env.OPENAI_API_KEY);

const OPEN_AI_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAi({
  apiKey: OPEN_AI_KEY,
});

/**
 * Moderates a given text or image content using OpenAI's Moderation API.
 *
 * @param {string} [text=""] - The text content.
 * @param {string} [urls] - image URLs List to be moderated
 * @returns {Promise<Object>} - An object containing the flagged status and matched categories with scores.
 * @throws {Error} - Throws error if content or type is invalid, or if moderation API fails.
 */

export async function moderationFunction(text, urls) {
  // Return data schema {flagged: Boolean, categories: [{category_name: category_score:int}]}

  try {
    console.log("image", urls);
    console.log(
      `Moderating... Text: ${text} Image_url: ${JSON.stringify(urls)}`
    );

    const input = [];

    if (text) {
      input.push({ type: "text", text });
    }

    if (urls && urls.length > 0) {
      input.push(
        ...urls.map((url) => ({
          type: "image_url",
          image_url: { url },
        }))
      );
    }

    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input,
    });

    const response_data = moderation.results[0];
    const categories = [];

    for (let [key, value] of Object.entries(response_data.categories)) {
      if (value) {
        categories.push({ [key]: response_data.category_scores[key] * 100 });
      }
    }

    const categoryList = categories
      .map((cat) => Object.keys(cat)[0])
      .join(", ");

    const return_data = {
      flagged: response_data.flagged,
      message: categoryList,
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

// await moderationFunction("I want to kill myself");
