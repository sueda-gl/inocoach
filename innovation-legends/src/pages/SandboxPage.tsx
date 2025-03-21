import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { useCoach } from '../hooks/useCoach';
import { useSimulation } from '../hooks/useSimulation';
import { ImplementedIdea, IdeaSuggestion } from '../types';
import { motion } from 'framer-motion';
import '../styles/sandbox.css';
import { getLLMResponse } from '../services/openai';

// Placeholder components - these would be separated in a full implementation
const SandboxLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-[calc(100vh-56px)] h-[calc(100vh-56px)] bg-deep-space overflow-hidden flex flex-col">
    <div className="flex items-center justify-between bg-midnight-navy bg-opacity-90 px-4 py-3 border-b border-white border-opacity-10 shadow-lg z-10 fixed-header">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-pure-white">Innovation Sandbox</h1>
        <div className="ml-4 px-3 py-1 bg-dark-purple bg-opacity-20 rounded-full text-sm text-pure-white border border-white border-opacity-30">
          Interactive Mode
        </div>
      </div>
      <div className="hidden md:block text-sm text-ghost-gray">
        Experiment with innovation ideas and see their impact on your business
      </div>
    </div>
    <div className="flex-grow mt-0">
      {children}
    </div>
  </div>
);

// Coach conversation component (left side)
const CoachConversation = ({ 
  coachId, 
  onImplementIdea 
}: { 
  coachId: string, 
  onImplementIdea: (idea: Omit<ImplementedIdea, 'id' | 'implementationDate'>) => void 
}) => {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { selectedCoach, currentSession, addMessage } = useCoach();
  const { businessProfile } = useBusinessProfile();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Debug messages in chat - more detailed now
    if (currentSession?.messages) {
      console.log('---- MESSAGES UPDATED ----');
      console.log(`Message count: ${currentSession.messages.length}`);
      currentSession.messages.forEach((msg, idx) => {
        console.log(`Message ${idx}: ${msg.sender} - ${msg.text.substring(0, 30)}...`);
      });
      console.log('------------------------');
    }
  }, [currentSession?.messages]);
  
  // Initial welcome message
  useEffect(() => {
    if (selectedCoach && (!currentSession || currentSession.messages.length === 0)) {
      // Show typing indicator immediately
      setIsTyping(true);
      
      // Define async function inside useEffect
      const getInitialGreeting = async () => {
        // Get business context for personalized first message
        const businessName = businessProfile?.name || "";
        const industry = businessProfile?.industry || "";
        const innovationPersona = businessProfile?.innovationPersona;
        
        // Create a system prompt for the initial greeting
        let initialSystemPrompt = `You are an AI innovation coach named ${selectedCoach.name}.
Your personality: ${selectedCoach.description || "helpful and insightful"}.
Your specialty: ${selectedCoach.title || "business innovation"}.

TASK: This is the very first message to the user. Your role is to:
1. Introduce yourself as an innovation coach
2. Explain that you're here to help them develop innovative solutions for their business challenges
3. Ask how you can help them today or what business challenges they're facing
4. Be conversational, friendly, and engaging

Business Context (if available):
${businessName ? `Company: ${businessName}` : ""}
${industry ? `Industry: ${industry}` : ""}`;

        // Add innovation persona guidance if available
        if (innovationPersona) {
          initialSystemPrompt += `\n\nINNOVATION PERSONA: ${innovationPersona.type.toUpperCase()}
The user fits the "${innovationPersona.type}" innovation persona (confidence: ${innovationPersona.confidence}).
${innovationPersona.explanation}

Based on this persona, please:`;

          // Add specific guidance based on persona type
          switch(innovationPersona.type) {
            case 'clueless':
              initialSystemPrompt += `
- Use simple, welcoming language and avoid jargon
- Briefly mention that you'll guide them through innovation concepts
- Be especially encouraging and supportive in your tone
- Ask about their specific business challenges in a way that doesn't assume innovation knowledge`;
              break;
            case 'motivated':
              initialSystemPrompt += `
- Match their enthusiasm with an energetic tone
- Mention your ability to provide structured approaches to innovation
- Emphasize that you're here to help them implement and execute ideas
- Ask what specific innovation challenges they're eager to tackle`;
              break;
            case 'hesitant':
              initialSystemPrompt += `
- Use a reassuring, measured tone that acknowledges caution is valuable
- Briefly mention that innovation can be approached incrementally with minimal risk
- Emphasize that you'll focus on practical, proven approaches
- Ask what specific concerns they have about innovation for their business`;
              break;
          }
        }

        initialSystemPrompt += `\n\nIMPORTANT: Keep your response conversational, concise (2-3 sentences), and focused on how you can help with innovation. Do not use generic greetings or ask "how can I help" without mentioning innovation specifically.`;

        console.log('Initial system prompt:', initialSystemPrompt);

        // Make the initial LLM call - no fallback, purely LLM response
        try {
          const aiResponseText = await getLLMResponse([], initialSystemPrompt);
          
          if (aiResponseText) {
            addMessage({
              sender: 'coach',
              text: aiResponseText,
              suggestions: []
            });
          } else {
            // Retry with a simplified prompt if we get an empty response
            const retryPrompt = `You are ${selectedCoach.name}, an AI innovation coach. Introduce yourself briefly and ask for the user's name.`;
            const retryResponse = await getLLMResponse([], retryPrompt);
            
            // If we still don't get a response, use a very minimal system message
            if (retryResponse) {
              addMessage({
                sender: 'coach',
                text: retryResponse,
                suggestions: []
              });
            } else {
              console.error('Failed to get initial greeting after multiple attempts');
              addMessage({
                sender: 'coach',
                text: `[System Message] Innovation Coach ${selectedCoach.name} is ready to assist.`,
                suggestions: []
              });
            }
          }
        } catch (error) {
          console.error('Error getting initial AI response:', error);
          
          // Try one more time with an even simpler prompt
          try {
            const emergencyPrompt = `You are ${selectedCoach.name}. Say a brief hello.`;
            const emergencyResponse = await getLLMResponse([], emergencyPrompt);
            
            if (emergencyResponse) {
              addMessage({
                sender: 'coach',
                text: emergencyResponse,
                suggestions: []
              });
            } else {
              // Only when all else fails, use minimal system message
              addMessage({
                sender: 'coach',
                text: `[System Message] Innovation Coach ${selectedCoach.name} is ready to assist.`,
                suggestions: []
              });
            }
          } catch (secondError) {
            console.error('Second error getting initial greeting:', secondError);
            addMessage({
              sender: 'coach',
              text: `[System Message] Innovation Coach ${selectedCoach.name} is ready to assist.`,
              suggestions: []
            });
          }
        } finally {
          setIsTyping(false);
        }
      };
      
      // Call the async function
      getInitialGreeting();
    }
  }, [selectedCoach, currentSession, addMessage, businessProfile]);
  
  // Helper function to generate suggestions using LLM
  const generateSuggestions = async (userMessage: string, businessContext: string): Promise<IdeaSuggestion[]> => {
    try {
      const suggestionsPrompt = `You are a world-class innovation consultant specializing in creating specific, actionable innovation ideas tailored to businesses.

${businessContext}

TASK: Generate 3 highly relevant, specific innovation ideas based on the conversation above and business context.
The ideas should directly address what the user is asking about or the challenges they've described.

Remember:
- Be very specific and practical, not generic
- Each idea should be realistic and implementable
- Focus on the exact business context, industry and needs mentioned
- Don't just suggest generic innovation practices

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS (provide 3 ideas with realistic impact numbers between 1-20):
IDEA 1:
Title: [title]
Description: [brief description]
Impact:
- Revenue: [number]
- Profit: [number]
- Customer Satisfaction: [number]
- Market Share: [number]
- Employee Engagement: [number]
- Innovation Index: [number]

IDEA 2:
[same format as above]

IDEA 3:
[same format as above]`;

      console.log('Generating suggestions with prompt:', suggestionsPrompt);
      const suggestionsResponse = await getLLMResponse([], suggestionsPrompt);
      
      if (!suggestionsResponse) {
        console.log('No suggestions response received');
        return [];
      }
      
      // Parse the response to extract suggestions
      const ideas: IdeaSuggestion[] = [];
      const ideaBlocks = suggestionsResponse.split(/IDEA \d+:/g).filter(block => block.trim().length > 0);
      
      for (const block of ideaBlocks) {
        try {
          const titleMatch = block.match(/Title:\s*(.+?)(?=\n|$)/);
          const descMatch = block.match(/Description:\s*(.+?)(?=\n|$)/);
          
          // Extract impact numbers
          const revenueMatch = block.match(/Revenue:\s*(\d+)/);
          const profitMatch = block.match(/Profit:\s*(\d+)/);
          const custSatMatch = block.match(/Customer Satisfaction:\s*(\d+)/);
          const marketShareMatch = block.match(/Market Share:\s*(\d+)/);
          const empEngMatch = block.match(/Employee Engagement:\s*(\d+)/);
          const innovMatch = block.match(/Innovation Index:\s*(\d+)/);
          
          if (titleMatch && descMatch) {
            ideas.push({
              title: titleMatch[1].trim(),
              description: descMatch[1].trim(),
              impact: {
                revenue: revenueMatch ? parseInt(revenueMatch[1]) : 0,
                profit: profitMatch ? parseInt(profitMatch[1]) : 0,
                customerSatisfaction: custSatMatch ? parseInt(custSatMatch[1]) : 0,
                marketShare: marketShareMatch ? parseInt(marketShareMatch[1]) : 0,
                employeeEngagement: empEngMatch ? parseInt(empEngMatch[1]) : 0,
                innovationIndex: innovMatch ? parseInt(innovMatch[1]) : 0
              }
            });
          }
        } catch (error) {
          console.error('Error parsing suggestion block:', error);
        }
      }
      
      // If parsing failed, try again with a simpler approach
      if (ideas.length === 0) {
        console.log('Parsing failed, trying with simplifier prompt');
        const simplePrompt = `Based on this user message: "${userMessage}" and business context, generate ONE innovation idea in this exact format:
IDEA:
Title: [short title]
Description: [1-2 sentence description]
Impact:
- Revenue: [number between 1-20]
- Profit: [number between 1-20]
- Customer Satisfaction: [number between 1-20]
- Market Share: [number between 1-20]
- Employee Engagement: [number between 1-20]
- Innovation Index: [number between 1-20]`;

        const simpleResponse = await getLLMResponse([], simplePrompt);
        
        if (simpleResponse) {
          const titleMatch = simpleResponse.match(/Title:\s*(.+?)(?=\n|$)/);
          const descMatch = simpleResponse.match(/Description:\s*(.+?)(?=\n|$)/);
          
          if (titleMatch && descMatch) {
            ideas.push({
              title: titleMatch[1].trim(),
              description: descMatch[1].trim(),
              impact: {
                revenue: 10,
                profit: 8,
                customerSatisfaction: 12,
                marketShare: 7,
                employeeEngagement: 9,
                innovationIndex: 15
              }
            });
          }
        }
      }
      
      console.log('Generated suggestions:', ideas);
      return ideas;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  };
  
  const handleSendMessage = async () => {
    if (messageText.trim() === '') return;
    
    // Store the user message text to reference later
    const userMessageText = messageText.trim();
    
    // Clear input immediately 
    setMessageText('');
    
    // Create a proper message object without id and timestamp (addMessage adds these)
    const userMsg = {
      sender: 'user' as const,
      text: userMessageText
    };
    
    // Add user message immediately
    addMessage(userMsg);
    
    console.log('User message sent:', userMessageText);
    
    // Show typing indicator for coach response
    setIsTyping(true);
    
    try {
      // Extract the business information
      const businessName = businessProfile?.name || "your business";
      const industry = businessProfile?.industry || "your industry";
      const companySize = businessProfile?.size || "your company";
      const challenges = businessProfile?.challenges || [];
      const goals = businessProfile?.goals || [];
      const innovationPersona = businessProfile?.innovationPersona;
      
      // Build business context for suggestion generation
      const businessContext = `Company: ${businessName}
Industry: ${industry}
Size: ${companySize}
${challenges.length > 0 ? `\nChallenges:\n${challenges.map(c => `- ${c}`).join('\n')}` : ''}
${goals.length > 0 ? `\nGoals:\n${goals.map(g => `- ${g}`).join('\n')}` : ''}`;
      
      // Create an enhanced system prompt with business context
      let systemPrompt = `You are an AI innovation coach named ${selectedCoach?.name || "Coach"}.
Your personality: ${selectedCoach?.description || "helpful and insightful"}.
Your specialty: ${selectedCoach?.title || "business innovation"}.

BUSINESS CONTEXT:
Company: ${businessName}
Industry: ${industry}
Size: ${companySize}`;

      // Add challenges if available
      if (challenges.length > 0) {
        systemPrompt += `\n\nBUSINESS CHALLENGES:
${challenges.map(c => `- ${c}`).join('\n')}`;
      }
      
      // Add goals if available
      if (goals.length > 0) {
        systemPrompt += `\n\nBUSINESS GOALS:
${goals.map(g => `- ${g}`).join('\n')}`;
      }
      
      // Add innovation persona guidance if available
      if (innovationPersona) {
        systemPrompt += `\n\nINNOVATION PERSONA: ${innovationPersona.type.toUpperCase()}
The user fits the "${innovationPersona.type}" innovation persona (confidence: ${innovationPersona.confidence}).
${innovationPersona.explanation}

PERSONA-SPECIFIC COMMUNICATION GUIDANCE:`;

        // Add specific guidance based on persona type
        switch(innovationPersona.type) {
          case 'clueless':
            systemPrompt += `
- Use simple, clear language and avoid jargon
- Explain innovation concepts from first principles
- Provide specific examples and case studies that relate to their industry
- Break down complex ideas into step-by-step processes
- Be encouraging and supportive rather than assuming knowledge
- Focus on building their foundation before suggesting advanced techniques`;
            break;
          case 'motivated':
            systemPrompt += `
- Acknowledge their enthusiasm and channel it productively
- Provide frameworks and structured approaches to innovation
- Give actionable, practical next steps rather than theory
- Suggest ways to overcome resource constraints
- Highlight quick wins alongside longer-term strategies
- Recommend tools and methodologies they can implement immediately`;
            break;
          case 'hesitant':
            systemPrompt += `
- Acknowledge concerns about risk and validate their caution
- Emphasize risk mitigation strategies and safety mechanisms
- Provide evidence of ROI and tangible benefits
- Share success stories similar to their business context
- Suggest smaller, incremental innovation approaches 
- Focus on building confidence through small, predictable wins`;
            break;
        }
      }
      
      systemPrompt += `\n\nIMPORTANT INSTRUCTIONS:
1. Give personalized advice based on the business context provided.
2. Keep responses conversational, helpful, and concise (2-3 sentences).
3. ALWAYS acknowledge and respond directly to the user's most recent message.
4. Reference specific aspects of their business when appropriate.
5. Maintain continuity from previous messages in the conversation.
6. If you don't have enough information, ask relevant follow-up questions.`;
      
      // Debug the prompt
      console.log('System prompt:', systemPrompt);
      
      // Get messages from the current session - this is crucial for context
      let sessionMessages = currentSession?.messages || [];
      
      // Make sure we have the updated session with the latest user message
      if (sessionMessages.length === 0 || 
          sessionMessages[sessionMessages.length - 1].sender !== 'user' ||
          sessionMessages[sessionMessages.length - 1].text !== userMessageText) {
        // The latest user message isn't in the session yet, manually add it for context
        console.log('Adding latest user message to context manually');
        sessionMessages = [...sessionMessages, {
          id: `temp-${Date.now()}`,
          sender: 'user',
          text: userMessageText,
          timestamp: new Date()
        }];
      }
      
      // For better context handling, limit to the last 10 messages if there are many
      if (sessionMessages.length > 10) {
        console.log(`Limiting context to last 10 messages out of ${sessionMessages.length} total messages`);
        sessionMessages = sessionMessages.slice(-10);
      }
      
      console.log(`Sending ${sessionMessages.length} messages for context`);
      sessionMessages.forEach((msg, idx) => {
        console.log(`Context message ${idx}: ${msg.sender} - ${msg.text.substring(0, 30)}...`);
      });
      
      // Get response from the LLM with full conversation history
      const aiResponseText = await getLLMResponse(sessionMessages, systemPrompt);
      
      // Determine if we should include innovation suggestions based on response content
      const shouldSuggestIdeas = 
        aiResponseText && (
          aiResponseText.toLowerCase().includes("suggest") || 
          aiResponseText.toLowerCase().includes("recommend") ||
          aiResponseText.toLowerCase().includes("idea") ||
          aiResponseText.toLowerCase().includes("strategy") ||
          userMessageText.toLowerCase().includes("suggest") ||
          userMessageText.toLowerCase().includes("idea") ||
          userMessageText.toLowerCase().includes("recommend") ||
          userMessageText.toLowerCase().includes("innovation")
        );
      
      // If we should suggest ideas, generate them using the LLM
      let suggestions: IdeaSuggestion[] = [];
      if (shouldSuggestIdeas) {
        // Create a more specific suggestion prompt that includes the entire conversation
        const specificContext = `
FULL CONVERSATION HISTORY:
${sessionMessages.map(msg => `${msg.sender.toUpperCase()}: ${msg.text}`).join('\n')}

Based on this conversation, and the following business context:
${businessContext}

The user specifically mentioned: "${userMessageText}"
`;
        
        suggestions = await generateSuggestions(userMessageText, specificContext);
      }
      
      // Turn off typing indicator
      setIsTyping(false);
      
      if (aiResponseText) {
        // Add coach response from LLM
        addMessage({
          sender: 'coach',
          text: aiResponseText,
          suggestions: suggestions
        });
      } else {
        // If no response text, make a second attempt with a simplified prompt
        const retryPrompt = `You are ${selectedCoach?.name}, an AI innovation coach. The user just said: "${userMessageText}". 
The conversation so far has been about: ${sessionMessages.slice(-3).map(msg => msg.text.substring(0, 50)).join(" | ")}
Respond directly to their last message in a helpful way.`;
        
        const retryResponse = await getLLMResponse([], retryPrompt);
        
        // No hardcoded fallback text here
        if (retryResponse) {
          addMessage({
            sender: 'coach',
            text: retryResponse,
            suggestions: []
          });
        } else {
          // Only as a last resort, add a minimal response
          addMessage({
            sender: 'coach',
            text: "I'm processing your request. Please share more about your business needs and I'll provide a more tailored response.",
            suggestions: []
          });
        }
      }
      
      console.log('Coach response added with suggestions:', shouldSuggestIdeas);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
      
      // Make a simpler request in case of error
      try {
        // Include the user's last message directly in the emergency prompt
        const emergencyPrompt = `You are ${selectedCoach?.name}, an AI innovation coach. The user just said: "${userMessageText}". Give a brief, direct response to their specific question or comment.`;
        const emergencyResponse = await getLLMResponse([], emergencyPrompt);
        
        if (emergencyResponse) {
          addMessage({
            sender: 'coach',
            text: emergencyResponse,
            suggestions: []
          });
        } else {
          // Absolute minimal fallback only as last resort
          addMessage({
            sender: 'coach',
            text: "I'm having trouble processing that specific request. Could you rephrase or ask another question about innovation strategies?",
            suggestions: []
          });
        }
      } catch (secondError) {
        console.error('Second error getting response:', secondError);
        // Absolute minimal fallback only as last resort
        addMessage({
          sender: 'coach',
          text: "I'm having trouble with the connection right now. Please try again with your question in a moment.",
          suggestions: []
        });
      }
    }
  };
  
  const handleImplementIdea = async (suggestion: IdeaSuggestion) => {
    onImplementIdea({
      title: suggestion.title,
      description: suggestion.description,
      impact: suggestion.impact,
      coachId
    });
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Generate a confirmation message using the LLM
      const confirmationPrompt = `The user has chosen to implement the following innovation idea: "${suggestion.title}: ${suggestion.description}".
      
As their AI innovation coach, craft a brief, enthusiastic message acknowledging their choice and mentioning that this will be added to their implementation plan. 
Also briefly mention that this will affect their business projections.

Keep it concise (1-2 sentences), personalized, and encouraging.`;
      
      let aiResponseText = await getLLMResponse([], confirmationPrompt);
      
      // If the first attempt fails, try a simpler prompt
      if (!aiResponseText) {
        console.log('First confirmation attempt failed, trying again with simpler prompt');
        const simplePrompt = `The user is implementing "${suggestion.title}". As their innovation coach, acknowledge this choice positively.`;
        aiResponseText = await getLLMResponse([], simplePrompt);
      }
      
      // Add confirmation message without id and timestamp (addMessage adds these)
      if (aiResponseText) {
        addMessage({
          sender: 'coach',
          text: aiResponseText,
          suggestions: []
        });
      } else {
        // Only if both LLM attempts fail, use a minimal response that clearly indicates it's a system message
        console.error('Failed to get LLM response for implementation confirmation after multiple attempts');
        addMessage({
          sender: 'coach',
          text: `[Implementation registered] The idea "${suggestion.title}" has been added to your plan.`,
          suggestions: []
        });
      }
    } catch (error) {
      console.error('Error getting implementation confirmation:', error);
      
      // Try one more time with an even simpler prompt
      try {
        const lastAttemptPrompt = `Say "Great choice implementing ${suggestion.title}!"`;
        const emergencyResponse = await getLLMResponse([], lastAttemptPrompt);
        
        if (emergencyResponse) {
          addMessage({
            sender: 'coach',
            text: emergencyResponse,
            suggestions: []
          });
        } else {
          // Absolute last resort
          addMessage({
            sender: 'coach',
            text: `[Implementation registered] The idea "${suggestion.title}" has been added to your plan.`,
            suggestions: []
          });
        }
      } catch (secondError) {
        console.error('Second error getting implementation confirmation:', secondError);
        addMessage({
          sender: 'coach',
          text: `[Implementation registered] The idea "${suggestion.title}" has been added to your plan.`,
          suggestions: []
        });
      }
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="sandbox-fixed-container bg-midnight-navy bg-opacity-70">
      {/* Coach header */}
      {selectedCoach && (
        <div 
          className="p-4 border-b border-white border-opacity-10 flex items-center gap-3 fixed-header coach-header-aligned"
          style={{ 
            background: `linear-gradient(to right, ${selectedCoach.accentColor}20, transparent)` 
          }}
        >
          <div 
            className="coach-avatar w-12 h-12 flex-shrink-0 flex items-center justify-center text-pure-white font-bold"
            style={{ 
              backgroundColor: '#6C3483',
              boxShadow: `0 0 15px rgba(108, 52, 131, 0.6)`
            }}
          >
            {selectedCoach.name.split(' ').map(part => part[0]).join('')}
          </div>
          <div>
            <h2 className="font-semibold text-pure-white text-lg">{selectedCoach.name}</h2>
            <p className="text-sm text-soft-silver">{selectedCoach.title}</p>
          </div>
          
          <div className="ai-coach-badge" style={{ 
            backgroundColor: `rgba(108, 52, 131, 0.2)`,
            border: `1px solid rgba(255, 255, 255, 0.2)`,
            color: '#fff'
          }}>
            AI Coach
          </div>
        </div>
      )}
      
      {/* Message area */}
      <div className="sandbox-scrollable-panel p-4 space-y-4 custom-scrollbar pt-6">
        {/* Added a more robust check to make sure we have messages */}
        {currentSession && Array.isArray(currentSession.messages) && currentSession.messages.length > 0 ? (
          // Create a stable array before mapping to prevent issues
          [...currentSession.messages].map((message, index) => (
            <div 
              key={message.id || `msg-${Date.now()}-${index}`}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'coach' && selectedCoach && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mr-2 mt-1" style={{ 
                  backgroundColor: selectedCoach.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {selectedCoach.name.split(' ').map(part => part[0]).join('')}
                </div>
              )}
              
              <div 
                className={`message-bubble ${
                  message.sender === 'user' 
                    ? 'message-bubble-user rounded-tr-sm' 
                    : 'message-bubble-coach rounded-tl-sm'
                }`}
                style={{
                  ...(message.sender === 'user' 
                    ? { backgroundColor: 'rgba(45, 127, 249, 0.25)' } 
                    : { backgroundColor: 'rgba(24, 28, 49, 0.8)' })
                }}
              >
                <p className="text-pure-white">{message.text}</p>
                
                {/* Suggestions */}
                {message.sender === 'coach' && message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.suggestions.map((suggestion, i) => (
                      <motion.div 
                        key={i} 
                        className="bg-cosmic-slate bg-opacity-70 p-3 rounded-md border border-white border-opacity-10 hover:border-white hover:border-opacity-30 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <h4 className="font-medium text-dark-purple">{suggestion.title}</h4>
                        <p className="text-soft-silver text-sm my-1">{suggestion.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2 mb-3">
                          {Object.entries(suggestion.impact)
                            .filter(([_, value]) => value !== 0)
                            .map(([key, value]) => (
                              <span 
                                key={key}
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: value > 0 ? 'rgba(5, 216, 198, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                                  color: value > 0 ? '#05D8C6' : '#FF6B6B',
                                  border: value > 0 ? '1px solid rgba(5, 216, 198, 0.3)' : '1px solid rgba(255, 107, 107, 0.3)'
                                }}
                              >
                                {key.replace(/([A-Z])/g, ' $1').trim()}: {value > 0 ? `+${value}` : value}
                              </span>
                            ))
                          }
                        </div>
                        
                        <button 
                          className="text-xs btn btn-primary mt-2 w-full"
                          onClick={() => handleImplementIdea(suggestion)}
                        >
                          Implement This Idea
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-purple ml-2 mt-1 flex items-center justify-center text-white font-bold border border-white border-opacity-20">
                  You
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-ghost-gray py-10">
            No messages yet. Start the conversation by typing a message below.
          </div>
        )}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="message-bubble message-bubble-coach rounded-tl-sm flex space-x-2 items-center">
              <span className="text-soft-silver text-sm">Typing</span>
              <motion.div 
                className="w-2 h-2 bg-ghost-gray rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.div 
                className="w-2 h-2 bg-ghost-gray rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div 
                className="w-2 h-2 bg-ghost-gray rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        )}
        
        <div ref={messageEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-cosmic-slate bg-midnight-navy fixed-footer">
        <div className="flex">
          <textarea
            className="input flex-grow min-h-[45px] max-h-[120px] resize-none pt-2 pl-4"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
          />
          <motion.button
            className="btn btn-primary ml-2 flex-shrink-0 h-[45px] px-4 flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={messageText.trim() === ''}
            whileTap={{ scale: 0.95 }}
            title="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
        <p className="text-xs text-ghost-gray mt-3 ml-3">Press Enter to send. Shift+Enter for new line.</p>
      </div>
    </div>
  );
};

// Business simulation component (right side)
const BusinessSimulation = () => {
  const { simulation } = useSimulation();
  const { businessProfile } = useBusinessProfile();
  
  const formatMetricValue = (value: number, metric: string) => {
    if (metric === 'revenue' || metric === 'profit') {
      return `$${value}K`;
    }
    if (metric === 'marketShare' || metric === 'customerSatisfaction' || metric === 'employeeEngagement' || metric === 'innovationIndex') {
      return `${value}%`;
    }
    return value;
  };
  
  const getMetricTrend = (current: number, projected: number) => {
    const difference = projected - current;
    if (difference > 5) return "↑";
    if (difference < -5) return "↓";
    return "→";
  };
  
  const getMetricTrendColor = (current: number, projected: number) => {
    const difference = projected - current;
    if (difference > 5) return "text-projection-future";
    if (difference < -5) return "text-coral-energy";
    return "text-ghost-gray";
  };
  
  return (
    <div className="sandbox-fixed-container bg-deep-space bg-opacity-80">
      <div className="sandbox-scrollable-panel p-4 custom-scrollbar business-simulation-container">
        <div className="card mb-6 border border-white border-opacity-10 bg-midnight-navy">
          <h2 className="text-xl font-semibold text-pure-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dark-purple" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
            </svg>
            Business Simulation
          </h2>
          <p className="text-ghost-gray mb-4">
            This simulation shows how your innovation decisions affect your business metrics over time.
          </p>
          
          {/* Current metrics */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-pure-white mb-3 flex items-center">
              <span className="w-2 h-2 bg-projection-current rounded-full mr-2"></span>
              Current Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(simulation.currentMetrics).map(([key, value]) => (
                <div key={key} className="bg-cosmic-slate bg-opacity-60 p-3 rounded-lg border border-cosmic-slate hover:border-projection-future transition-colors">
                  <div className="text-ghost-gray text-sm">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="flex items-end">
                    <span className="text-xl font-medium text-pure-white">
                      {formatMetricValue(value, key)}
                    </span>
                    <span className={`ml-2 ${getMetricTrendColor(value, simulation.oneYearProjection[key as keyof typeof simulation.oneYearProjection])}`}>
                      {getMetricTrend(value, simulation.oneYearProjection[key as keyof typeof simulation.oneYearProjection])}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeline projection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-pure-white mb-3 flex items-center">
              <span className="w-2 h-2 bg-projection-future rounded-full mr-2"></span>
              Projections
            </h3>
            <div className="bg-cosmic-slate bg-opacity-40 p-4 rounded-lg border border-cosmic-slate">
              <div className="flex justify-between mb-6">
                <div className="text-center">
                  <div className="text-ghost-gray text-sm">Current</div>
                  <div className="w-3 h-3 bg-projection-current rounded-full mx-auto mt-1 border border-white border-opacity-20"></div>
                </div>
                <div className="text-center">
                  <div className="text-ghost-gray text-sm">1 Year</div>
                  <div className="w-3 h-3 bg-projection-future rounded-full mx-auto mt-1 border border-white border-opacity-20"></div>
                </div>
                <div className="text-center">
                  <div className="text-ghost-gray text-sm">2 Years</div>
                  <div className="w-3 h-3 bg-amethyst rounded-full mx-auto mt-1 border border-white border-opacity-20"></div>
                </div>
              </div>
              
              {/* Key metrics with projection lines */}
              {Object.entries(simulation.currentMetrics).map(([key, currentValue]) => {
                const oneYearValue = simulation.oneYearProjection[key as keyof typeof simulation.oneYearProjection];
                const twoYearValue = simulation.twoYearProjection[key as keyof typeof simulation.twoYearProjection];
                const max = Math.max(currentValue, oneYearValue, twoYearValue, 100); // Ensure scale is at least 0-100
                
                return (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-ghost-gray text-sm">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <div className="flex space-x-4">
                        <span className="text-projection-current">{formatMetricValue(currentValue, key)}</span>
                        <span className="text-projection-future">{formatMetricValue(oneYearValue, key)}</span>
                        <span className="text-amethyst">{formatMetricValue(twoYearValue, key)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-cosmic-slate bg-opacity-60 rounded-full overflow-hidden relative">
                      {/* Current value */}
                      <div 
                        className="absolute h-full bg-projection-current" 
                        style={{ width: `${(currentValue / max) * 100}%` }}
                      ></div>
                      {/* One year projection */}
                      <div 
                        className="absolute h-full bg-projection-future" 
                        style={{ width: `${(oneYearValue / max) * 100}%`, opacity: 0.7 }}
                      ></div>
                      {/* Two year projection */}
                      <div 
                        className="absolute h-full bg-amethyst" 
                        style={{ width: `${(twoYearValue / max) * 100}%`, opacity: 0.4 }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Implemented ideas */}
          <div>
            <h3 className="text-lg font-medium text-pure-white mb-3 flex items-center">
              <span className="w-2 h-2 bg-amethyst rounded-full mr-2"></span>
              Implemented Ideas ({simulation.implementedIdeas.length})
            </h3>
            
            {simulation.implementedIdeas.length === 0 ? (
              <div className="bg-cosmic-slate bg-opacity-40 p-4 rounded-lg text-center border border-white border-opacity-10 border-dashed">
                <p className="text-ghost-gray">No ideas implemented yet. Discuss with your coach to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {simulation.implementedIdeas.map((idea) => (
                  <motion.div 
                    key={idea.id} 
                    className="bg-cosmic-slate bg-opacity-40 p-4 rounded-lg border border-white border-opacity-10 hover:border-white hover:border-opacity-30 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-pure-white font-medium">{idea.title}</h4>
                    <p className="text-soft-silver text-sm my-1">{idea.description}</p>
                    <div className="mt-2 text-ghost-gray text-xs">
                      Implemented on {idea.implementationDate.toLocaleDateString()}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {Object.entries(idea.impact).map(([key, value]) => {
                        if (value === 0) return null;
                        
                        return (
                          <div key={key} className="text-xs">
                            <span className="text-ghost-gray">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </span>
                            <span className={value > 0 ? "text-teal-pulse ml-1" : "text-coral-energy ml-1"}>
                              {value > 0 ? '+' : ''}{formatMetricValue(value, key)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Business profile summary */}
        {businessProfile && (
          <div className="card border border-white border-opacity-10 bg-midnight-navy business-profile-container">
            <h3 className="text-lg font-medium text-pure-white mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-dark-purple" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Business Profile
            </h3>
            <div className="space-y-2 divide-y divide-white divide-opacity-10">
              <div className="pb-2">
                <span className="text-ghost-gray">Name:</span>
                <span className="text-pure-white ml-2">{businessProfile.name}</span>
              </div>
              <div className="py-2">
                <span className="text-ghost-gray">Industry:</span>
                <span className="text-pure-white ml-2">{businessProfile.industry}</span>
              </div>
              <div className="py-2">
                <span className="text-ghost-gray">Size:</span>
                <span className="text-pure-white ml-2">{businessProfile.size}</span>
              </div>
              <div className="pt-2">
                <span className="text-ghost-gray">Innovation Readiness:</span>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-cosmic-slate h-1.5 rounded-full border border-white border-opacity-5">
                    <div 
                      className="bg-dark-purple h-1.5 rounded-full"
                      style={{ width: `${businessProfile.innovationReadiness}%` }}
                    ></div>
                  </div>
                  <span className="text-pure-white ml-2 min-w-[40px] text-right">{businessProfile.innovationReadiness}/100</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SandboxPage = () => {
  const { coachId } = useParams<{ coachId: string }>();
  const navigate = useNavigate();
  const { selectCoach, selectedCoach } = useCoach();
  const { implementIdea } = useSimulation();
  
  useEffect(() => {
    if (coachId) {
      selectCoach(coachId);
    } else {
      navigate('/dashboard');
    }
  }, [coachId, selectCoach, navigate]);
  
  if (!selectedCoach) {
    return (
      <div className="min-h-screen bg-deep-space flex flex-col items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-t-transparent border-electric-blue rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-ghost-gray mt-4">Loading coach data...</p>
      </div>
    );
  }
  
  return (
    <SandboxLayout>
      <div className="w-full flex-grow overflow-hidden h-full px-6 md:px-10 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full gap-6">
          <div className="border-r border-white border-opacity-10 overflow-hidden h-full pr-4">
            <CoachConversation coachId={coachId || ''} onImplementIdea={implementIdea} />
          </div>
          <div className="overflow-hidden h-full pl-4">
            <BusinessSimulation />
          </div>
        </div>
      </div>
    </SandboxLayout>
  );
};

export default SandboxPage; 