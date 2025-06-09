import React from 'react';

interface ChatBubbleProps {
  own: boolean;
  message: string;
  senderName: string;
  timestamp: string;
  seenBy?: string[];
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ own, message, senderName, timestamp, seenBy = [] }) => {
  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs rounded-lg px-4 py-2 shadow ${own ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
        <p className="text-sm font-semibold mb-1">{senderName}</p>
        <p className="text-base">{message}</p>
        <p className="text-xs text-right mt-1 opacity-70">{new Date(timestamp).toLocaleTimeString()}</p>
        {own && seenBy.length > 0 && (
          <p className="text-xs text-right mt-1 text-green-600">Seen by: {seenBy.join(', ')}</p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
