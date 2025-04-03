'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Paperclip, User, CheckCircle, RefreshCw, MoreVertical, MessageSquare, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name?: string | null;
  email: string;
  role?: string;
  image?: string | null;
}

interface DesignRequest {
  id: string;
  title: string;
  status: string;
  userId: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  isFromAdmin: boolean;
  designRequestId: string;
  senderId: string;
  recipientId: string | null;
  sender: User;
  recipient: User | null;
  designRequest: DesignRequest;
}

interface Conversation {
  designRequestId: string;
  designRequestTitle: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for designRequestId in URL
  useEffect(() => {
    if (status === 'authenticated') {
      // Check if there's a designRequestId in the URL
      const url = new URL(window.location.href);
      const designRequestId = url.searchParams.get('designRequestId');
      
      if (designRequestId) {
        setSelectedConversation(designRequestId);
      }
      
      fetchMessages();
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Handle selecting conversation from URL and mark messages as read
  useEffect(() => {
    // Only run if conversations are loaded and a conversation is selected
    if (!isLoading && conversations.length > 0 && selectedConversation) {
      // Mark messages as read in the selected conversation  
      markMessagesAsRead(selectedConversation);
      
      // Scroll to bottom of messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isLoading, conversations, selectedConversation]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/messages');
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data: Message[] = await response.json();
      
      // Group messages by design request to create conversations
      const conversationsMap = new Map<string, Conversation>();
      
      // Process each message
      data.forEach(message => {
        const designRequestId = message.designRequestId;
        const designRequestTitle = message.designRequest.title;
        
        if (!conversationsMap.has(designRequestId)) {
          // Create a new conversation
          conversationsMap.set(designRequestId, {
            designRequestId,
            designRequestTitle,
            lastMessage: message,
            unreadCount: message.isRead ? 0 : 1,
            messages: [message],
          });
        } else {
          // Add to existing conversation
          const conversation = conversationsMap.get(designRequestId)!;
          conversation.messages.push(message);
          
          // Update last message if this one is newer
          if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
            conversation.lastMessage = message;
          }
          
          // Update unread count if message is unread and recipient is current user
          if (!message.isRead && message.recipientId === session?.user?.id) {
            conversation.unreadCount += 1;
          }
        }
      });
      
      // Sort conversations by most recent message
      const sortedConversations = Array.from(conversationsMap.values())
        .sort((a, b) => 
          new Date(b.lastMessage.createdAt).getTime() - 
          new Date(a.lastMessage.createdAt).getTime()
        );
      
      // Sort messages within each conversation by date
      sortedConversations.forEach(conversation => {
        conversation.messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      
      setConversations(sortedConversations);
      
      // If there's a selected conversation, update its messages
      if (selectedConversation) {
        const updatedConversation = sortedConversations.find(
          c => c.designRequestId === selectedConversation
        );
        
        if (!updatedConversation) {
          setSelectedConversation(null);
        }
      }
      // If no conversation is selected and there are conversations, select the first one
      else if (sortedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedConversations[0].designRequestId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshMessages = () => {
    setIsRefreshing(true);
    fetchMessages();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setIsSending(true);
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          designRequestId: selectedConversation,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const sentMessage = await response.json();
      
      // Update the conversations state with the new message
      setConversations(prevConversations => {
        return prevConversations.map(conversation => {
          if (conversation.designRequestId === selectedConversation) {
            return {
              ...conversation,
              messages: [...conversation.messages, sentMessage],
              lastMessage: sentMessage,
            };
          }
          return conversation;
        });
      });
      
      // Clear the input
      setNewMessage('');
      
      // Scroll to bottom of messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const markMessagesAsRead = async (designRequestId: string) => {
    try {
      const conversation = conversations.find(c => c.designRequestId === designRequestId);
      
      if (!conversation) return;
      
      const unreadMessages = conversation.messages.filter(
        message => !message.isRead && 
        (message.recipientId === session?.user?.id || 
         (session?.user?.role === 'ADMIN' && !message.isFromAdmin))
      );
      
      if (unreadMessages.length === 0) return;
      
      const messageIds = unreadMessages.map(message => message.id);
      
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIds,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }
      
      // Update the conversations state
      setConversations(prevConversations => {
        return prevConversations.map(conversation => {
          if (conversation.designRequestId === designRequestId) {
            return {
              ...conversation,
              unreadCount: 0,
              messages: conversation.messages.map(message => {
                if (messageIds.includes(message.id)) {
                  return { ...message, isRead: true };
                }
                return message;
              }),
            };
          }
          return conversation;
        });
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSelectConversation = (designRequestId: string) => {
    setSelectedConversation(designRequestId);
    markMessagesAsRead(designRequestId);
    
    // Scroll to bottom of messages
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.designRequestTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.messages.some(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const selectedMessages = selectedConversation
    ? conversations.find(c => c.designRequestId === selectedConversation)?.messages || []
    : [];

  const renderMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Messages"
        description="Communicate about your design requests"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh]">
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
            <CardTitle>Conversations</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshMessages}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/requests')}
                >
                  New Chat
                </Button>
              </div>
            </div>
            <CardDescription>Your design request discussions</CardDescription>
          </CardHeader>
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="space-y-2 px-4 pb-4">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.designRequestId}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.designRequestId
                      ? 'bg-blue-500 text-white'
                        : conversation.unreadCount > 0
                        ? 'bg-white hover:bg-gray-50 border border-gray-200'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => handleSelectConversation(conversation.designRequestId)}
                >
                  <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{conversation.designRequestTitle}</h4>
                        <p className="text-sm truncate">
                          {conversation.lastMessage.sender.name || conversation.lastMessage.sender.email}: {conversation.lastMessage.content}
                        </p>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <span className={`text-xs ${selectedConversation === conversation.designRequestId ? 'text-white' : 'text-gray-500'}`}>
                          {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge className="mt-1 bg-red-500">{conversation.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-2 flex flex-col items-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                  {searchQuery ? (
                    <p className="text-muted-foreground">No matching conversations found</p>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-4">No conversations yet</p>
                      <Button 
                        onClick={() => router.push('/dashboard/requests')}
                        variant="outline"
                        className="mt-2 w-full"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Go to Requests
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        To start a conversation, visit one of your design requests and click "Message Designer"
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 flex flex-col h-full overflow-hidden">
          {selectedConversation ? (
            <>
              <CardHeader className="pb-2 border-b">
                <div className="flex justify-between items-center">
                  <div>
            <CardTitle>
                      {conversations.find(c => c.designRequestId === selectedConversation)?.designRequestTitle || 'Conversation'}
            </CardTitle>
                    <CardDescription>
                      Design Request #{selectedConversation}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/dashboard/requests/${selectedConversation}`)}
                  >
                    View Request
                  </Button>
                </div>
          </CardHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedMessages.map((message, index) => (
                    <div 
                      key={message.id} 
                      className={`flex gap-3 ${message.sender.id === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender.id !== session?.user?.id && (
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={message.sender.image || undefined} alt={message.sender.name || 'User'} />
                          <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[80%] ${message.sender.id === session?.user?.id ? 'items-end' : 'items-start'}`}>
                        <div className="flex gap-2 items-center mb-1">
                          {message.sender.id !== session?.user?.id && (
                            <span className="font-medium text-sm">
                              {message.sender.name || message.sender.email}
                              {message.isFromAdmin && <Badge className="ml-1 bg-blue-500">Admin</Badge>}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {renderMessageDate(message.createdAt)}
                      </span>
                          {message.isRead && message.sender.id === session?.user?.id && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        <div 
                          className={`p-3 rounded-lg ${
                            message.sender.id === session?.user?.id 
                              ? 'bg-blue-500 text-white rounded-tr-none' 
                              : 'bg-gray-100 text-gray-900 rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                      {message.sender.id === session?.user?.id && (
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'You'} />
                          <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="p-4 border-t mt-auto">
                  <div className="flex gap-2">
                  <Button variant="outline" size="icon" disabled>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 resize-none min-h-[60px] max-h-[150px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
              <p className="text-muted-foreground mb-6">
                Select a conversation from the list or start a new one from your design requests.
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button onClick={() => router.push('/dashboard/requests')}>
                  View Your Design Requests
                </Button>
                {session?.user?.role === 'ADMIN' && (
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/dashboard/admin/requests')}
                  >
                    View All Requests
                  </Button>
                )}
              </div>
              </div>
            )}
        </Card>
      </div>
    </div>
  );
} 