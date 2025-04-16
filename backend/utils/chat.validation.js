import validation from "./validation.js";
import settings from "../models/settings.js";
function validateChatName(name) {
  name = validation.validateString(name, "Chat Name");
  if (name.length > settings.CHAT_NAME_LENGTH) {
    throw `Chat name length cannot be greater than ${settings.CHAT_NAME_LENGTH}`;
  }
  return name;
}

function validateChatType(type) {
  type = validation.validateString(type, "Chat Type");
  type = type.toLowerCase();
  if (!settings.CHAT_TYPES.includes(type)) {
    throw `Invalid chat type: ${type}`;
  }
  return type;
}

function validateChatText(text) {
  text = validation.validateString(text, "Chat Text");
  if (text.length > settings.MESSAGE_LENGTH) {
    throw `Chat message length cannot be greater than ${settings.MESSAGE_LENGTH}`;
  }
  return text;
}
export default {
  validateChatName,
  validateChatType,
  validateChatText,
};
