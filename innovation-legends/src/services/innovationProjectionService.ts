import { BusinessMetrics, BusinessProfile } from '../types';
import { getLLMResponse } from './openai';
import { openai } from './openai';

export async function evaluateInnovationImpact(
  innovationDescription: string,
  currentMetrics: BusinessMetrics,
  businessProfile: BusinessProfile
): Promise<{ oneYear: BusinessMetrics, twoYears: BusinessMetrics }> {
  // Create a detailed system prompt for the LLM
  const systemPrompt = `You are an expert business analyst AI that evaluates the impact of business innovations.
Given the current business metrics and an innovation idea, predict how the metrics will change over 1 and 2 years.

BUSINESS CONTEXT:
Name: ${businessProfile.name}
Industry: ${businessProfile.industry}
Size: ${businessProfile.size}
Founded: ${businessProfile.founded}

CURRENT METRICS:
Revenue: $${currentMetrics.revenue}
Profit: $${currentMetrics.profit}
Customer Satisfaction: ${currentMetrics.customerSatisfaction}%
Market Share: ${currentMetrics.marketShare}%
Employee Engagement: ${currentMetrics.employeeEngagement}%
Innovation Index: ${currentMetrics.innovationIndex}%

INNOVATION IDEA:
${innovationDescription}

Analyze this innovation and provide a JSON response with projections for how these metrics will change over time.
Your response should ONLY contain valid JSON in this format:
{
  "oneYear": {
    "revenue": [projected value],
    "profit": [projected value],
    "customerSatisfaction": [projected value],
    "marketShare": [projected value],
    "employeeEngagement": [projected value],
    "innovationIndex": [projected value]
  },
  "twoYears": {
    "revenue": [projected value],
    "profit": [projected value],
    "customerSatisfaction": [projected value],
    "marketShare": [projected value],
    "employeeEngagement": [projected value],
    "innovationIndex": [projected value]
  }
}`;

  try {
    // Call the LLM with this prompt
    const llmResponse = await getLLMResponse([], systemPrompt);
    
    // For more control over response format, you could directly use the OpenAI client
    // Directly calling openai client for JSON response
    /*
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    });
    
    const llmResponse = response.choices[0]?.message?.content || '';
    */
    
    // Parse the response
    const projections = JSON.parse(llmResponse);
    
    return {
      oneYear: projections.oneYear,
      twoYears: projections.twoYears
    };
  } catch (error) {
    console.error('Error getting innovation projections:', error);
    
    // Fallback if LLM fails - simple percentage increases
    return {
      oneYear: {
        revenue: Math.round(currentMetrics.revenue * 1.15),
        profit: Math.round(currentMetrics.profit * 1.12),
        customerSatisfaction: Math.min(100, Math.round(currentMetrics.customerSatisfaction * 1.05)),
        marketShare: Math.min(100, Math.round(currentMetrics.marketShare * 1.08)),
        employeeEngagement: Math.min(100, Math.round(currentMetrics.employeeEngagement * 1.03)),
        innovationIndex: Math.min(100, Math.round(currentMetrics.innovationIndex * 1.12))
      },
      twoYears: {
        revenue: Math.round(currentMetrics.revenue * 1.32),
        profit: Math.round(currentMetrics.profit * 1.25),
        customerSatisfaction: Math.min(100, Math.round(currentMetrics.customerSatisfaction * 1.08)),
        marketShare: Math.min(100, Math.round(currentMetrics.marketShare * 1.15)),
        employeeEngagement: Math.min(100, Math.round(currentMetrics.employeeEngagement * 1.06)),
        innovationIndex: Math.min(100, Math.round(currentMetrics.innovationIndex * 1.25))
      }
    };
  }
} 