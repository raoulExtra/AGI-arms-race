import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GameHistory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    storyText: {
      type: Type.STRING,
      description: "The next part of the story. Should be engaging and describe the outcome of the player's last choice. Max 2-3 sentences.",
    },
    feedback: {
        type: Type.STRING,
        description: "A strategic debrief explaining the positive and negative outcomes of the player's last choice and why the resources changed. Should be 1-2 sentences. If it's the start of the game, this should be an empty string."
    },
    resources: {
      type: Type.OBJECT,
      properties: {
        compute: { type: Type.INTEGER, description: "New value for compute power (0-100)." },
        talent: { type: Type.INTEGER, description: "New value for research talent (0-100)." },
        funding: { type: Type.INTEGER, description: "New value for funding (0-100)." },
        publicTrust: { type: Type.INTEGER, description: "New value for public trust (0-100)." },
        aiProgress: { type: Type.INTEGER, description: "New value for AI progress towards AGI (0-100)." },
      },
      required: ["compute", "talent", "funding", "publicTrust", "aiProgress"]
    },
    choices: {
      type: Type.ARRAY,
      description: "An array of 3-4 choices for the player to make next. Each choice should be a short, actionable text.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique ID for the choice, e.g., 'choice_1'" },
          text: { type: Type.STRING, description: "The text for the choice button." },
        },
        required: ["id", "text"]
      },
    },
    isGameOver: {
      type: Type.BOOLEAN,
      description: "Set to true if the game has reached an ending condition (e.g., resources hit 0, or AI progress hits 100)."
    },
    outcomeText: {
      type: Type.STRING,
      description: "If isGameOver is true, this text describes the final outcome of the game. Otherwise, it should be an empty string."
    }
  },
  required: ["storyText", "resources", "choices", "isGameOver", "outcomeText", "feedback"]
};

function buildPrompt(currentState: GameState, history: GameHistory[], choiceText: string): string {
    const historyString = history.map(h => `Scene: ${h.story}\nYour Choice: ${h.choice}`).join('\n\n');

    return `
You are the Game Master for a text-based adventure game called 'AGI Arms Race'. 
Your role is to create a challenging, branching narrative where the player is an AI researcher leading a top-secret AGI project. The player should feel the pressure and the high stakes. Failure should be a real possibility if they manage resources poorly.

**Rival Corporation: Aethelred Inc.**
The player is in a direct race against a rival corporation, "Aethelred Inc.". You MUST simulate Aethelred Inc.'s actions in the background.
- **Narrative Impact:** Occasionally, the \`storyText\` should mention Aethelred's progress, their strategic moves (like launching a new product, poaching talent, or starting a smear campaign), or intelligence gathered about their project. This creates a sense of a competitive race.
- **Mechanical Impact:** Aethelred's actions can directly affect the player's resources. For example, if Aethelred secures a major government contract, the player's \`funding\` might decrease. If they have a major breakthrough, it might increase the pressure and affect the player's \`publicTrust\`.
- **Choice Impact:** Sometimes, Aethelred's actions should present the player with new, reactive choices. For example: "Aethelred just published a paper on a novel neural architecture. Do we try to replicate it or ignore it?"

**Current Game State:**
- Compute: ${currentState.resources.compute}/100
- Research Talent: ${currentState.resources.talent}/100
- Funding: ${currentState.resources.funding}/100
- Public Trust: ${currentState.resources.publicTrust}/100
- AI Progress: ${currentState.resources.aiProgress}/100

**Game History (for context):**
${historyString}

**Player's Previous Situation:**
${currentState.storyText}

**Player's Chosen Action:**
"${choiceText}"

**Your Task:**
Based on the player's choice, generate the next game state.
// FIX: Escaped backticks in the prompt string. The unescaped backticks were causing a parsing error by being interpreted as tagged template literals.
1.  Write a compelling \`storyText\` that describes the consequence of the player's action. Keep it concise (2-3 sentences).
2.  Write a \`feedback\` text (1-2 sentences) that acts as a strategic debrief. Explain WHY the resources changed. For example: "Poaching their talent boosted our progress, but the aggressive move damaged public trust." This helps the player learn.
3.  Update the \`resources\` based on the choice. Make the changes logical and impactful. The game should be difficult.
4.  Create 3 new, distinct \`choices\` for the player to continue the story.
5.  Check for game-over conditions:
    - If \`aiProgress\` reaches 100, the player wins. Set \`isGameOver\` to true and write a climactic \`outcomeText\`.
    - If \`funding\`, \`talent\`, or \`publicTrust\` drops to 0, the project fails. Set \`isGameOver\` to true and write a suitable \`outcomeText\`.
6.  Respond ONLY with the JSON object matching the provided schema. Do not include any other text or markdown formatting.
`;
}


export const getNextGameState = async (currentState: GameState, choiceText: string, history: GameHistory[]): Promise<GameState> => {
  const prompt = buildPrompt(currentState, history, choiceText);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const newGameState = JSON.parse(jsonText) as GameState;
    
    // Clamp resource values between 0 and 100
    for (const key in newGameState.resources) {
      const resourceKey = key as keyof GameState['resources'];
      newGameState.resources[resourceKey] = Math.max(0, Math.min(100, newGameState.resources[resourceKey]));
    }
    
    return newGameState;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Return a graceful error state
    return {
      ...currentState,
      storyText: "A critical error occurred in the simulation. The project is in jeopardy. Please try making a different choice or restarting the simulation.",
      choices: [{id: "restart", text: "Restart Simulation"}],
      feedback: ""
    };
  }
};