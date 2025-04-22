import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

export function initializeGenAI() {
  const mySecret = process.env.GEMINI_API_KEY;
  genAI = new GoogleGenerativeAI(mySecret);
}

export async function getChatbotResponse(message, userInfo) {
  if (!genAI) {
    initializeGenAI();
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Step 1: Improve Study-Related Filtering
  const filterPrompt = `You are an AI filter that decides if a query is study-related. 
  Study-related topics include subjects like: Mathematics, Science, History, Geography, Programming, Engineering, Literature, and Academic Writing.
  If the query is study-related, respond with exactly "yes" (lowercase). Otherwise, respond with exactly "no" (lowercase).

  Query: "${message}"`;

  try {
    const filterResult = await model.generateContent(filterPrompt);
    const filterResponse = (await filterResult.response?.text())?.trim().toLowerCase();

    if (filterResponse !== "yes") {
      return "I can only help with study-related queries.";
    }

    // Step 2: Generate a response since the query is study-related
    const prompt = `You are a student support chatbot. You only answer **study-related** questions.
    The user is in the ${userInfo.ageRange} age range, at the ${userInfo.educationLevel} education level, and in grade ${userInfo.grade}. 
    Please provide an appropriate response to their message: "${message}"

    Format your response using the following rules:
    1. Use HTML tags to structure the content.
    2. Keep information short and to the point.
    3. Organize key points in a <div> with class "bg-gray-100 p-3 rounded-lg my-2".
    4. Highlight important information using <strong> tags.
    5. Use <h3> tags for subtitles if needed.
    6. Keep the overall response brief and easy to read.`;

    const result = await model.generateContent(prompt);
    const response = await result.response?.text();

    return response || "I'm sorry, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Error generating response:', error);
    return "I apologize, but I encountered an error while processing your request. Please try again later.";
  }
}
