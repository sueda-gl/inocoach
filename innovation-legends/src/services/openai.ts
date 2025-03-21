import OpenAI from 'openai';

// ********** IMPORTANT **********
// For hackathon purposes only - in production this should never be in frontend code
const OPENAI_API_KEY = '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';

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Helper function to get LLM response
export async function getLLMResponse(messages: any[], systemPrompt: string = '', retryCount = 0): Promise<string> {
  try {
    // Format messages for OpenAI
    const formattedMessages = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.push({
        role: 'system' as const,
        content: systemPrompt
      });
      console.log('System prompt added:', systemPrompt.substring(0, 100) + '...');
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
    
    console.log(`Sending ${formattedMessages.length} messages to OpenAI with API key: ${OPENAI_API_KEY ? 'Valid API key' : 'Missing API key'}`);
    
    // If we have no messages and no system prompt, add a fallback user message
    if (formattedMessages.length === 0) {
      formattedMessages.push({
        role: 'user' as const,
        content: 'Hello, can you help me with business innovation?'
      });
      console.log('Added fallback user message - no messages or system prompt provided');
    }
    
    // Debug dump of all messages being sent
    console.log('COMPLETE MESSAGE PAYLOAD:');
    formattedMessages.forEach((msg, i) => {
      console.log(`[${i}] ${msg.role}: ${msg.content.substring(0, 50)}...`);
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 800
    });
    
    const responseContent = response.choices[0]?.message?.content || '';
    console.log('Response from OpenAI:', responseContent.substring(0, 150) + '...');
    return responseContent;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    // If we haven't retried too many times, try again with a simpler request
    if (retryCount < 2) {
      console.log(`Retrying OpenAI request (attempt ${retryCount + 1})...`);
      
      // Create a simpler prompt for the retry
      let retryPrompt = 'You are an AI innovation coach. Respond to the most recent message in a helpful way.';
      
      // If we have messages, extract the last user message for context
      const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
      if (lastUserMessage && retryCount === 1) {
        retryPrompt = `The user said: "${lastUserMessage.text}". Respond helpfully as an AI innovation coach.`;
      }
      
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Retry with a simpler prompt and fewer messages
      return getLLMResponse([], retryPrompt, retryCount + 1);
    }
    
    // After max retries, return empty string instead of a stock message
    // This will allow the caller to handle empty responses appropriately
    return '';
  }
} 