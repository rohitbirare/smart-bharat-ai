const { GoogleGenerativeAI } = require("@google/generative-ai");

let client = null;

function getGeminiModel(modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite") {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing");
  }

  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return client.getGenerativeModel({
    model: modelName,
  });
}

module.exports = {
  getGeminiModel,
};