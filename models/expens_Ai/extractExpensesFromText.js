async function extractExpensesFromText(transcriptionText) {
  try {
    // Debug: Check if API key is accessible
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Make sure EXPO_PUBLIC_OPENAI_API_KEY is set in .env file');
    }
    
    const prompt = `
You are an expense extraction assistant.  
Extract all expenses from the following text and return them as a JSON array.  

For each expense, provide:
- "title": the name/description of the item purchased (keep it in the same language as the input text)  
- "amount": the numerical amount spent (number only, no currency)  
- "category": classify into one of these categories (in English):  
  - food, clothing, transportation, entertainment, health, education, utilities, shopping, other  
- "note": any additional context or details (optional, can be null if none, keep in same language as input)  

Text to analyze: "${transcriptionText}"  

Return ONLY a valid JSON array in this exact format:  

[
  {
    "title": "pain",
    "amount": 2,
    "category": "food",
    "note": null
  }
]

If no expenses are found, return an empty array: []

`;

    // Use fetch API for React Native compatibility
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    console.log('GPT response:', response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const completion = await response.json();
    const responseText = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    let expenses;
    try {
      expenses = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', responseText);
      throw new Error('Invalid JSON response from GPT');
    }

    // Validate that it's an array
    if (!Array.isArray(expenses)) {
      throw new Error('GPT response is not an array');
    }

    return expenses;
  } catch (error) {
    console.error('Error extracting expenses:', error.message);
    throw error;
  }
}

export default extractExpensesFromText;
