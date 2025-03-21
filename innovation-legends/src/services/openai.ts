import OpenAI from 'openai';

// ********** IMPORTANT **********
// For hackathon purposes only - in production this should never be in frontend code
const OPENAI_API_KEY = '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';

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Helper function to get LLM response
export async function getLLMResponse(messages: any[], systemPrompt: string = '') {
  try {
    // Format messages for OpenAI
    const formattedMessages = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.push({
        role: 'system' as const,
        content: systemPrompt
      });
    }
    
    // Add chat history - converting from your format to OpenAI format
    messages.forEach((msg, index) => {
      // Skip messages that don't have text
      if (!msg.text) {
        console.warn(`Skipping message at index ${index} - no text property:`, msg);
        return;
      }
      
      // Map 'user' -> 'user', and anything else (typically 'coach') -> 'assistant'
      const role = msg.sender === 'user' ? 'user' as const : 'assistant' as const;
      
      formattedMessages.push({
        role,
        content: msg.text
      });
      
      console.log(`Formatted message ${index}: ${role} - ${msg.text.substring(0, 30)}...`);
    });
    
    console.log(`Sending ${formattedMessages.length} messages to OpenAI`);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 800
    });
    
    const responseContent = response.choices[0]?.message?.content || '';
    console.log('Response from OpenAI:', responseContent.substring(0, 50) + '...');
    return responseContent;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return "I'm having trouble connecting right now. Please try again.";
  }
} 