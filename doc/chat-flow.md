# Chat Flow Documentation

This document provides a comprehensive overview of how the chat system works in the QDash application, from user input to output generation and iterations.

## Overview

The chat system is designed to handle user queries, process them through an AI model, and execute various tools based on the AI's decisions. The system supports SQL queries, data visualization, and natural conversations.

## Flow Diagram

```
User Input → Chat Manager → AI Processing → Tool Execution → UI Update
     ↑                                           |
     └───────────────────────────────────────────┘
```

## Detailed Flow

### 1. User Input Processing
- User enters a message through the chat interface
- The input is captured by the `handleChatSubmit` function in `chatController.js`
- The message is validated and checked for data availability
- The message is displayed in the UI using `addMessageToChat`

### 2. Chat Manager
- `chatManager.js` maintains the chat state and history
- Key responsibilities:
  - Maintains chat message history
  - Formats message history for context
  - Prepares initial messages with system prompt
  - Adds new messages to the conversation

### 3. AI Processing
- Messages are sent to the AI model via `sendChatRequest`
- The system includes:
  - User's message
  - Chat history
  - System prompt
  - Available tools configuration

### 4. Tool Execution Loop
- Maximum iterations: 10 (defined by `MAX_ITERATIONS`)
- Each iteration includes:
  1. AI model processes the message and history
  2. AI decides to either:
     - Respond directly to the user
     - Use a tool to perform an action
  3. If a tool is called:
     - Tool execution is handled by `handleToolCall`
     - Results are added back to the conversation
     - Another iteration begins
  4. Loop continues until:
     - AI responds with "DONE"
     - Maximum iterations reached

### 5. Available Tools
1. SQL Query Tool
   - Executes database queries
   - Returns data for visualization
   - Handles query validation and error handling

2. Chart Creation Tools
   - Creates various types of charts:
     - Basic charts (line, bar, scatter)
     - Pie charts
     - Stacked bar charts
   - Handles data formatting and visualization

3. Card Creation Tool
   - Creates stat cards with values and trends
   - Handles numeric and text display
   - Supports trending indicators

### 6. Error Handling
- Database connection checks
- Query validation
- Tool execution error handling
- User feedback through UI messages

### 7. UI Updates
- Real-time message display
- Chart and card rendering
- Error message display
- Loading state management

## Code Structure

### Key Components

1. `chatController.js`
   - Main controller for chat interactions
   - Handles message submission
   - Manages the iteration loop

2. `chatManager.js`
   - Manages chat state
   - Handles message history
   - Formats messages for AI

3. `toolExecutor.js`
   - Executes tool calls
   - Handles tool-specific logic
   - Manages tool results

4. `duckDbService.js`
   - Handles database operations
   - Manages data state
   - Provides query execution

### Important Functions

1. `handleChatSubmit()`
   - Entry point for chat processing
   - Manages the main chat loop
   - Handles tool execution flow

2. `handleToolCall()`
   - Processes tool requests
   - Executes specific tool functions
   - Handles tool results

3. `addMessageToChat()`
   - Updates UI with messages
   - Handles message formatting
   - Manages chat display

## Best Practices

1. Error Handling
   - Validate user input
   - Check data availability
   - Handle tool execution errors
   - Provide clear error messages

2. Performance
   - Limit iteration count
   - Efficient data processing
   - Optimized UI updates

3. Security
   - Input validation
   - Query sanitization
   - Error message sanitization

## Common Patterns

1. Message Flow
```javascript
User Input → Format Message → AI Processing → Tool Execution → UI Update
```

2. Tool Execution
```javascript
Tool Call → Validation → Execution → Result Processing → Message Update
```

3. Error Handling
```javascript
Try Operation → Catch Error → Log Error → User Feedback
```

## Conclusion

The chat system provides a robust and extensible framework for handling user interactions, executing tools, and managing the conversation flow. The modular design allows for easy addition of new tools and features while maintaining a consistent user experience.
