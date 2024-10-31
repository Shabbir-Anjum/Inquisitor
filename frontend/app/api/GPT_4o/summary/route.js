import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

// Initialize OpenAI with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Add this if using in client-side code
});

// Helper function to format conversation history
function formatConversationForAnalysis(history) {
  try {
    let formattedConversation = '';
    for (let i = 0; i < history.length; i += 2) {
      const question = history[i].replace('question:', 'Q: ');
      const answer = history[i + 1]?.replace('answer:', 'A: ');
      formattedConversation += `${question}\n${answer}\n\n`;
    }
    return formattedConversation;
  } catch (error) {
    console.error('Error formatting conversation:', error);
    throw new Error('Failed to format conversation history');
  }
}

// Mock analysis function for testing without OpenAI
function getMockAnalysis() {
  return {
    success: true,
    analysis: `Overview of conversation quality:
The conversation demonstrates a clear and structured introduction to JavaScript basics.

Specific strengths and weaknesses:
Strengths:
- Clear, concise explanations
- Logical progression of topics
- Accurate fundamental concepts

Weaknesses:
- Could include more practical examples
- Some technical details could be expanded

Recommendations for improvement:
- Add code examples
- Include more real-world applications
- Expand on variable scope concepts

Overall assessment score: 8/10`
  };
}

export async function POST(request) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { conversationHistory } = body;

    // Validate conversation history
    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { success: false, error: 'Valid conversation history array is required' },
        { status: 400 }
      );
    }

    // For testing: Use mock data if OpenAI API key is not available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Using mock data as OPENAI_API_KEY is not set');
      return NextResponse.json(getMockAnalysis());
    }

    // Format conversation
    const formattedConversation = formatConversationForAnalysis(conversationHistory);

    // Create system prompt
    const systemPrompt = `Analyze the following conversation, focusing on:
1. Accuracy and completeness of answers
2. Relevance of responses to questions
3. Consistency across the conversation
4. Areas where answers could be improved
5. Overall quality of the information provided

Conversation to analyze:
${formattedConversation}

Provide a structured analysis covering:
- Overview of conversation quality
- Specific strengths and weaknesses
- Recommendations for improvement
- Overall assessment score (1-10)`;

    try {
      // Make OpenAI API call with timeout
      const completion = await Promise.race([
        openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI API timeout')), 30000)
        )
      ]);

      const analysis = completion.choices[0]?.message?.content;

      if (!analysis) {
        throw new Error('No analysis generated from OpenAI');
      }

      return NextResponse.json({
        success: true,
        analysis: analysis
      });

    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);

      // Handle specific OpenAI errors
      if (openaiError.message.includes('API key')) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key configuration' },
          { status: 401 }
        );
      }

      throw openaiError; // Re-throw for general error handling
    }

  } catch (error) {
    console.error('General API Error:', error);

    // Handle specific error cases
    if (error.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.code === 'context_length_exceeded') {
      return NextResponse.json(
        { success: false, error: 'Conversation too long. Please reduce the length.' },
        { status: 400 }
      );
    }

    // Return generic error with more detail in development
    return NextResponse.json(
      { 
        success: false, 
        error: process.env.NODE_ENV === 'development' 
          ? `Error: ${error.message}` 
          : 'An error occurred while analyzing the conversation.'
      },
      { status: 500 }
    );
  }
}