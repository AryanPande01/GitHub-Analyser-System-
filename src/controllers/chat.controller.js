const { getFullAnalysis, saveChatMessage, getProfileId, getChatHistory } = require("../models/analysis.model");
const { generateChatResponse } = require("../services/ai.service");

async function chat(req, res) {
  const username = req.body.username.toLowerCase();
  const { message } = req.body;

  try {
    const context = await getFullAnalysis(username);
    if (!context) {
      return res.status(404).json({
        success: false,
        message: `Profile '${username}' not analyzed. Run analyze endpoint first.`,
      });
    }

    const profileId = await getProfileId(username);
    const history = await getChatHistory(username, 10);

    await saveChatMessage(profileId, username, "user", message);

    const reply = await generateChatResponse(username, message, context, history);
    await saveChatMessage(profileId, username, "assistant", reply);

    return res.json({
      success: true,
      data: { username, message, reply, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    console.error("chat error:", err.message, err.stack);
    const message =
      process.env.NODE_ENV === "development" ? err.message : "Internal server error.";
    return res.status(500).json({ success: false, message });
  }
}

module.exports = { chat };
