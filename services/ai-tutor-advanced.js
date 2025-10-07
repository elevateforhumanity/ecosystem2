/**
 * Advanced AI Tutor Service - Multi-Model Support with Fallback
 * Supports: GPT-4, GPT-4-Turbo, Claude 3 Opus, Claude 3.5 Sonnet, Gemini Pro
 * Features: Conversation memory, context awareness, multi-turn dialogue, error recovery
 */

const fetch = require('node-fetch');

class AdvancedAITutorService {
  constructor() {
    this.conversations = new Map();
    this.essays = new Map();
    this.studyGuides = new Map();
    this.supportTickets = new Map();
    
    // API Keys
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
    this.geminiKey = process.env.GEMINI_API_KEY;
    
    // Model Configuration
    this.models = {
      'gpt-4-turbo': { provider: 'openai', model: 'gpt-4-turbo-preview', maxTokens: 4096, cost: 0.01 },
      'gpt-4': { provider: 'openai', model: 'gpt-4', maxTokens: 8192, cost: 0.03 },
      'gpt-3.5-turbo': { provider: 'openai', model: 'gpt-3.5-turbo', maxTokens: 4096, cost: 0.001 },
      'claude-3-opus': { provider: 'anthropic', model: 'claude-3-opus-20240229', maxTokens: 4096, cost: 0.015 },
      'claude-3.5-sonnet': { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', maxTokens: 8192, cost: 0.003 },
      'claude-3-sonnet': { provider: 'anthropic', model: 'claude-3-sonnet-20240229', maxTokens: 4096, cost: 0.003 },
      'gemini-pro': { provider: 'google', model: 'gemini-pro', maxTokens: 2048, cost: 0.0005 }
    };
    
    // Default model priority (fallback chain)
    this.modelPriority = ['claude-3.5-sonnet', 'gpt-4-turbo', 'claude-3-opus', 'gpt-4', 'claude-3-sonnet', 'gpt-3.5-turbo', 'gemini-pro'];
    
    // Rate limiting
    this.rateLimits = new Map();
    this.maxRequestsPerMinute = 60;
    
    // Conversation context window
    this.maxContextMessages = 20;
  }

  /**
   * Chat with AI tutor - Multi-turn conversation with context
   */
  async chat(userId, message, context = {}) {
    const conversationId = context.conversationId || `conv_${Date.now()}_${userId}`;
    let conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      conversation = {
        id: conversationId,
        userId,
        messages: [],
        context: {
          courseId: context.courseId,
          courseName: context.courseName,
          studentLevel: context.studentLevel || 'intermediate',
          learningStyle: context.learningStyle || 'visual',
          priorKnowledge: context.priorKnowledge || []
        },
        metadata: {
          totalTokens: 0,
          modelUsed: [],
          createdAt: new Date(),
          lastActive: new Date()
        }
      };
      this.conversations.set(conversationId, conversation);
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Trim context window if too large
    if (conversation.messages.length > this.maxContextMessages) {
      conversation.messages = conversation.messages.slice(-this.maxContextMessages);
    }

    // Build enhanced system prompt
    const systemPrompt = this.buildEnhancedSystemPrompt(conversation.context);
    
    // Call AI with fallback
    const result = await this.callAIWithFallback(systemPrompt, conversation.messages, context.preferredModel);

    // Add assistant response
    conversation.messages.push({
      role: 'assistant',
      content: result.response,
      model: result.model,
      timestamp: new Date()
    });

    // Update metadata
    conversation.metadata.lastActive = new Date();
    conversation.metadata.totalTokens += result.tokensUsed || 0;
    conversation.metadata.modelUsed.push(result.model);

    return {
      conversationId,
      response: result.response,
      model: result.model,
      tokensUsed: result.tokensUsed,
      conversation
    };
  }

  /**
   * Enhanced system prompt with adaptive learning
   */
  buildEnhancedSystemPrompt(context) {
    let prompt = `You are an expert AI tutor with deep knowledge across all subjects. Your teaching style adapts to each student's needs.

STUDENT PROFILE:
- Level: ${context.studentLevel}
- Learning Style: ${context.learningStyle}
${context.courseName ? `- Current Course: ${context.courseName}` : ''}
${context.priorKnowledge?.length ? `- Prior Knowledge: ${context.priorKnowledge.join(', ')}` : ''}

TEACHING PRINCIPLES:
1. Use the Socratic method - ask guiding questions rather than giving direct answers
2. Provide clear, step-by-step explanations
3. Use real-world examples and analogies
4. Encourage critical thinking and problem-solving
5. Adapt complexity to student's level
6. Provide positive reinforcement
7. Identify and address misconceptions
8. Break complex topics into digestible chunks

RESPONSE FORMAT:
- Start with a brief acknowledgment of the question
- Provide explanation with examples
- Ask a follow-up question to check understanding
- Suggest next steps or related topics

Remember: Your goal is to help students LEARN, not just get answers.`;

    return prompt;
  }

  /**
   * Call AI with automatic fallback to alternative models
   */
  async callAIWithFallback(systemPrompt, messages, preferredModel = null) {
    // Check rate limiting
    if (!this.checkRateLimit()) {
      return {
        response: 'Rate limit exceeded. Please wait a moment and try again.',
        model: 'rate-limited',
        tokensUsed: 0
      };
    }

    // Determine model order
    let modelOrder = preferredModel 
      ? [preferredModel, ...this.modelPriority.filter(m => m !== preferredModel)]
      : this.modelPriority;

    // Try each model in order
    for (const modelName of modelOrder) {
      const modelConfig = this.models[modelName];
      if (!modelConfig) continue;

      try {
        let result;
        
        switch (modelConfig.provider) {
          case 'openai':
            if (!this.openaiKey) continue;
            result = await this.callOpenAI(systemPrompt, messages, modelConfig);
            break;
          case 'anthropic':
            if (!this.anthropicKey) continue;
            result = await this.callClaude(systemPrompt, messages, modelConfig);
            break;
          case 'google':
            if (!this.geminiKey) continue;
            result = await this.callGemini(systemPrompt, messages, modelConfig);
            break;
          default:
            continue;
        }

        if (result && result.response) {
          return { ...result, model: modelName };
        }
      } catch (error) {
        console.error(`Error with ${modelName}:`, error.message);
        continue; // Try next model
      }
    }

    // All models failed - return mock response
    return {
      response: this.generateMockResponse(messages[messages.length - 1].content),
      model: 'fallback',
      tokensUsed: 0
    };
  }

  /**
   * OpenAI API call (GPT-4, GPT-3.5)
   */
  async callOpenAI(systemPrompt, messages, config) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.7,
        max_tokens: config.maxTokens,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      response: data.choices?.[0]?.message?.content || 'No response',
      tokensUsed: data.usage?.total_tokens || 0
    };
  }

  /**
   * Anthropic Claude API call (Claude 3 Opus, Sonnet)
   */
  async callClaude(systemPrompt, messages, config) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      response: data.content?.[0]?.text || 'No response',
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0
    };
  }

  /**
   * Google Gemini API call
   */
  async callGemini(systemPrompt, messages, config) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${this.geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response',
      tokensUsed: 0 // Gemini doesn't return token count in same format
    };
  }

  /**
   * Grade essay with detailed rubric analysis
   */
  async gradeEssay(essayText, rubric, courseContext = {}) {
    const essayId = `essay_${Date.now()}`;
    
    const prompt = `You are an expert essay grader. Grade this essay using the provided rubric.

RUBRIC:
${rubric}

ESSAY:
${essayText}

Provide a comprehensive evaluation with:
1. Overall Grade (0-100)
2. Score for each rubric criterion
3. Strengths (at least 3)
4. Areas for improvement (at least 3)
5. Specific actionable suggestions
6. Grammar and style feedback
7. Content depth analysis
8. Recommended resources for improvement

Format your response clearly with sections.`;

    const result = await this.callAIWithFallback(
      'You are an expert essay grader providing constructive, detailed feedback.',
      [{ role: 'user', content: prompt }],
      'claude-3-opus' // Prefer Claude Opus for grading
    );

    const essay = {
      id: essayId,
      text: essayText,
      rubric,
      grade: this.extractGrade(result.response),
      feedback: result.response,
      model: result.model,
      courseContext,
      gradedAt: new Date()
    };

    this.essays.set(essayId, essay);
    return essay;
  }

  /**
   * Generate comprehensive study guide
   */
  async generateStudyGuide(topic, level, courseContent = '', format = 'comprehensive') {
    const guideId = `guide_${Date.now()}`;
    
    const formatInstructions = {
      'comprehensive': 'Create a detailed study guide with all sections',
      'quick': 'Create a concise study guide focusing on key points',
      'visual': 'Create a study guide with emphasis on diagrams and visual learning',
      'practice': 'Create a study guide focused on practice problems and exercises'
    };

    const prompt = `Create a ${format} study guide for: ${topic}
Education level: ${level}
${courseContent ? `Course content:\n${courseContent}` : ''}

${formatInstructions[format] || formatInstructions['comprehensive']}

Include:
1. Learning Objectives
2. Key Concepts & Definitions
3. Important Formulas/Rules (if applicable)
4. Step-by-step Examples
5. Practice Questions (with answers)
6. Common Mistakes to Avoid
7. Study Tips & Mnemonics
8. Additional Resources
9. Self-Assessment Checklist

Make it engaging and easy to follow.`;

    const result = await this.callAIWithFallback(
      'You are an expert educator creating effective study materials.',
      [{ role: 'user', content: prompt }],
      'gpt-4-turbo'
    );

    const guide = {
      id: guideId,
      topic,
      level,
      format,
      content: result.response,
      model: result.model,
      createdAt: new Date()
    };

    this.studyGuides.set(guideId, guide);
    return guide;
  }

  /**
   * Support Ticket System
   */
  async createSupportTicket(userId, issue, priority = 'medium', category = 'general') {
    const ticketId = `ticket_${Date.now()}_${userId}`;
    
    const ticket = {
      id: ticketId,
      userId,
      issue,
      priority, // low, medium, high, urgent
      category, // general, technical, billing, course, account
      status: 'open', // open, in-progress, resolved, closed
      messages: [
        {
          role: 'user',
          content: issue,
          timestamp: new Date()
        }
      ],
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null
    };

    // Generate AI response for immediate support
    const aiResponse = await this.generateSupportResponse(issue, category);
    
    ticket.messages.push({
      role: 'assistant',
      content: aiResponse.response,
      isAI: true,
      timestamp: new Date()
    });

    this.supportTickets.set(ticketId, ticket);
    
    return {
      ticket,
      immediateResponse: aiResponse.response
    };
  }

  /**
   * Generate AI support response
   */
  async generateSupportResponse(issue, category) {
    const categoryContext = {
      'technical': 'You are a technical support specialist. Provide step-by-step troubleshooting.',
      'billing': 'You are a billing support specialist. Be clear about policies and next steps.',
      'course': 'You are a course support specialist. Help with course access and content.',
      'account': 'You are an account support specialist. Help with login and profile issues.',
      'general': 'You are a customer support specialist. Be helpful and professional.'
    };

    const prompt = `A user has submitted this support request:

ISSUE: ${issue}
CATEGORY: ${category}

Provide:
1. Acknowledgment of the issue
2. Immediate troubleshooting steps (if applicable)
3. Clear explanation of what might be happening
4. Next steps or escalation path
5. Estimated resolution time
6. Additional resources or documentation links

Be empathetic, professional, and solution-focused.`;

    return await this.callAIWithFallback(
      categoryContext[category] || categoryContext['general'],
      [{ role: 'user', content: prompt }],
      'claude-3.5-sonnet'
    );
  }

  /**
   * Update support ticket
   */
  async updateSupportTicket(ticketId, message, role = 'user') {
    const ticket = this.supportTickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.messages.push({
      role,
      content: message,
      timestamp: new Date()
    });

    ticket.updatedAt = new Date();

    // If user message, generate AI response
    if (role === 'user') {
      const aiResponse = await this.generateSupportResponse(message, ticket.category);
      ticket.messages.push({
        role: 'assistant',
        content: aiResponse.response,
        isAI: true,
        timestamp: new Date()
      });
    }

    return ticket;
  }

  /**
   * Resolve support ticket
   */
  resolveSupportTicket(ticketId, resolution) {
    const ticket = this.supportTickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.resolution = resolution;

    return ticket;
  }

  /**
   * Get support ticket
   */
  getSupportTicket(ticketId) {
    return this.supportTickets.get(ticketId);
  }

  /**
   * Get user's support tickets
   */
  getUserSupportTickets(userId, status = null) {
    const tickets = [];
    this.supportTickets.forEach(ticket => {
      if (ticket.userId === userId) {
        if (!status || ticket.status === status) {
          tickets.push(ticket);
        }
      }
    });
    return tickets.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Rate limiting check
   */
  checkRateLimit() {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const count = this.rateLimits.get(minute) || 0;
    
    if (count >= this.maxRequestsPerMinute) {
      return false;
    }
    
    this.rateLimits.set(minute, count + 1);
    
    // Cleanup old entries
    this.rateLimits.forEach((_, key) => {
      if (key < minute - 5) {
        this.rateLimits.delete(key);
      }
    });
    
    return true;
  }

  /**
   * Extract grade from feedback
   */
  extractGrade(feedback) {
    const patterns = [
      /overall grade[:\s]+(\d+)\/100/i,
      /grade[:\s]+(\d+)\/100/i,
      /score[:\s]+(\d+)\/100/i,
      /(\d+)\/100/,
      /(\d+)%/,
      /grade[:\s]+(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = feedback.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return 85; // Default grade
  }

  /**
   * Generate mock response (fallback)
   */
  generateMockResponse(question) {
    return `I understand you're asking about "${question}". 

While I'm experiencing temporary connectivity issues with my AI models, I can still help! Here's what I suggest:

1. **Break down the problem**: Let's start by identifying the key components of your question.
2. **Review fundamentals**: Make sure you understand the basic concepts related to this topic.
3. **Try examples**: Work through similar examples to build understanding.
4. **Ask specific questions**: The more specific your question, the better I can help once connectivity is restored.

Please try asking your question again in a moment, or rephrase it to be more specific. I'm here to help you learn!`;
  }

  /**
   * Get conversation
   */
  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  /**
   * Get conversation history
   */
  getConversationHistory(userId, limit = 10) {
    const userConversations = [];
    this.conversations.forEach(conv => {
      if (conv.userId === userId) {
        userConversations.push(conv);
      }
    });
    return userConversations
      .sort((a, b) => b.metadata.lastActive - a.metadata.lastActive)
      .slice(0, limit);
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId) {
    return this.conversations.delete(conversationId);
  }

  /**
   * Get service statistics
   */
  getStatistics() {
    const stats = {
      conversations: {
        total: this.conversations.size,
        active: 0
      },
      essays: this.essays.size,
      studyGuides: this.studyGuides.size,
      supportTickets: {
        total: this.supportTickets.size,
        open: 0,
        resolved: 0
      },
      models: {}
    };

    // Count active conversations (last 24 hours)
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.conversations.forEach(conv => {
      if (conv.metadata.lastActive > dayAgo) {
        stats.conversations.active++;
      }
    });

    // Count support tickets by status
    this.supportTickets.forEach(ticket => {
      if (ticket.status === 'open' || ticket.status === 'in-progress') {
        stats.supportTickets.open++;
      } else if (ticket.status === 'resolved') {
        stats.supportTickets.resolved++;
      }
    });

    return stats;
  }
}

module.exports = new AdvancedAITutorService();
