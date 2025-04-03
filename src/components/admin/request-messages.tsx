'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Define the types based on Prisma schema and included data
interface Sender {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string; // Keep as string from fetch, convert later
  isRead: boolean;
  isFromAdmin: boolean;
  userId: string;
  user: Sender;
  // Add other fields if needed, like recipientId
}

interface RequestUser {
    id: string;
    name?: string | null;
    email?: string | null;
}

interface RequestMessagesProps {
  initialMessages: Message[];
  designRequestId: string;
  requestUser: RequestUser;
  currentUser: Session['user']; // Assuming Session user type is available
}

// Helper to get initials (similar to dashboard)
const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper to format dates (similar to dashboard)
const renderMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isNaN(date.getTime())) { // Check if date is valid
        return "Invalid Date";
    }

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

export function RequestMessages({ 
    initialMessages, 
    designRequestId, 
    requestUser, 
    currentUser 
}: RequestMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read on component mount
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessageIds = messages
        .filter(msg => !msg.isRead && msg.userId === requestUser.id)
        .map(msg => msg.id);

      if (unreadMessageIds.length === 0) return;

      try {
        const response = await fetch('/api/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: unreadMessageIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to mark messages as read');
        }

        // Update local state to reflect read status
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            unreadMessageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
        // Optional: Show toast error, but might be too noisy
      }
    };

    markAsRead();
  }, [initialMessages, requestUser.id]); // Rerun if initial messages change

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          designRequestId: designRequestId,
          recipientId: requestUser.id, // Explicitly set recipient for admin sending
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error details
        throw new Error(errorData.message || 'Failed to send message');
      }

      const sentMessage: Message = await response.json();

      // Add the sent message to the local state
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage(''); // Clear the input

      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]"> {/* Adjust height as needed */}
      <CardHeader>
        <CardTitle>Messages with {requestUser.name || requestUser.email}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar for the other person */}
            {message.userId !== currentUser.id && (
              <Avatar className="h-9 w-9">
                <AvatarImage src={message.user.image || undefined} alt={message.user.name || 'User'} />
                <AvatarFallback>{getInitials(message.user.name)}</AvatarFallback>
              </Avatar>
            )}
            {/* Message Bubble */}
            <div className={`max-w-[75%] ${message.userId === currentUser.id ? 'items-end' : 'items-start'}`}>
               <div className="flex gap-2 items-center mb-1">
                   {/* Show sender name only if it's not the current user */}
                   {message.userId !== currentUser.id && (
                       <span className="font-medium text-sm">
                            {message.user.name || message.user.email}
                           {message.isFromAdmin && <Badge variant="secondary" className="ml-1">Admin</Badge>}
                        </span>
                   )}
                   {/* Show sender name if it IS the current user (Admin) */}
                   {message.userId === currentUser.id && (
                        <span className="font-medium text-sm">You</span>
                   )}
                    <span className="text-xs text-muted-foreground">
                       {renderMessageDate(message.createdAt)}
                    </span>
                   {/* Read check for messages sent BY the current user */}
                   {message.isRead && message.userId === currentUser.id && (
                       <CheckCircle className="h-3 w-3 text-blue-500" />
                    )}
               </div>
              <div
                className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                  message.userId === currentUser.id
                    ? 'bg-blue-600 text-white rounded-tr-none' // Admin message
                    : 'bg-gray-100 text-gray-900 rounded-tl-none' // User message
                }`}
              >
                {message.content}
              </div>
            </div>
            {/* Avatar for the current admin user */}
            {message.userId === currentUser.id && (
              <Avatar className="h-9 w-9">
                 <AvatarImage src={currentUser.image || undefined} alt={currentUser.name || 'Admin'} />
                 <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {/* Empty state if no messages */}
        {messages.length === 0 && (
             <p className="text-muted-foreground text-center py-4">No messages yet for this request.</p>
        )}
        <div ref={messagesEndRef} /> {/* Element to scroll to */}
      </CardContent>
      <div className="p-4 border-t mt-auto bg-background">
        <div className="flex items-center gap-2">
          {/* File attachment button (disabled for now) */}
          <Button variant="outline" size="icon" disabled>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 resize-none min-h-[40px] max-h-[120px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent newline on Enter
                handleSendMessage();
              }
            }}
            disabled={isSending}
          />
          <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 pl-[48px]">Shift+Enter for new line.</p>
      </div>
    </Card>
  );
} 