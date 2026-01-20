import React from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useChat } from '../hooks/useChat';
import Layout from '../components/layout/Layout';
import ChatWindow from '../components/chat/ChatWindow';

const Chat: React.FC = () => {
  const { organizationId, sessionId, regenerateSession } = useApp();
  const { addToast } = useToast();

  const { messages, sendMessage, isLoading, clearMessages } = useChat(
    organizationId || '',
    sessionId
  );

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      addToast('error', 'Failed to send message');
    }
  };

  const handleNewChat = () => {
    clearMessages();
    regenerateSession();
    addToast('info', 'Started a new chat session');
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onNewChat={handleNewChat}
        />
      </div>
    </Layout>
  );
};

export default Chat;
