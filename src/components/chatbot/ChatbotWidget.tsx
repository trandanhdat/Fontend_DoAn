import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Mic, MicOff } from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import { useAuthStore } from '../../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isStreaming?: boolean;
}

export const ChatbotWidget: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const storageKey = `chatbot_state_${user?.id || 'guest'}`;

  const loadState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };

  const defaultMessages: Message[] = [
    { id: '1', sender: 'bot', text: 'Xin chào! Tôi là Trợ lý Y tế Online. Tôi có thể giúp gì cho bạn hôm nay?' }
  ];

  const [messages, setMessages] = useState<Message[]>(() => {
    const state = loadState();
    return state ? state.messages : defaultMessages;
  });

  const [sessionId, setSessionId] = useState<string>(() => {
    const state = loadState();
    return state ? state.sessionId : `session-${Date.now()}`;
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref để lưu trữ instance của SpeechRecognition
  const recognitionRef = useRef<any>(null);

  const prevUserIdRef = useRef(user?.id);

  // Lưu lịch sử chat mỗi khi có thay đổi
  useEffect(() => {
    // Chỉ lưu nếu user hiện tại khớp với user lúc tải/tạo tin nhắn
    // Việc này ngăn chặn việc lưu đè tin nhắn của user cũ sang user mới khi vừa chuyển tài khoản
    if (prevUserIdRef.current === user?.id) {
      localStorage.setItem(storageKey, JSON.stringify({ messages, sessionId }));
    }
  }, [messages, sessionId, storageKey, user?.id]);

  // Tải lại hoặc reset lịch sử chat khi chuyển đổi tài khoản
  useEffect(() => {
    const isLogout = prevUserIdRef.current && !user?.id;
    
    // Nếu là thao tác đăng xuất, xóa sạch lịch sử chat cũ để bảo mật
    if (isLogout) {
      localStorage.removeItem(`chatbot_state_${prevUserIdRef.current}`);
      localStorage.removeItem('chatbot_state_guest');
    }

    const state = loadState();
    if (state && !isLogout) {
      setMessages(state.messages);
      setSessionId(state.sessionId);
    } else {
      const defaultMsg: Message[] = [{ id: '1', sender: 'bot', text: 'Xin chào! Tôi là Trợ lý Y tế Online. Tôi có thể giúp gì cho bạn hôm nay?' }];
      const newSession = `session-${Date.now()}`;
      setMessages(defaultMsg);
      setSessionId(newSession);
      
      if (isLogout) {
        localStorage.setItem('chatbot_state_guest', JSON.stringify({ messages: defaultMsg, sessionId: newSession }));
      }
    }
    
    prevUserIdRef.current = user?.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Khởi tạo Web Speech API (nhận diện giọng nói)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Chỉ nghe 1 câu rồi dừng
      recognition.interimResults = true; // Cập nhật text liên tục khi đang nói
      recognition.lang = 'vi-VN'; // Ngôn ngữ Tiếng Việt

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            setInput((prev) => prev + (prev.length > 0 ? ' ' : '') + event.results[i][0].transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        toast.error('Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói.');
        return;
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Đang lắng nghe... Vui lòng nói vào mic.');
      } catch (err) {
        // Đã start rồi thì bỏ qua
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call actual Chatbot API
      const response = await chatbotService.ask({
        message: userText,
        sessionId: sessionId
      });

      let botResponseText = response.answer;
      
      // Nếu có thông tin lịch khám được đặt thành công
      if (response.bookedAppointment) {
        botResponseText += `\n\n🎉 Lịch khám của bạn đã được đặt thành công! Mã lịch: ${response.bookedAppointment.id}`;
      }

      // Làm mới dữ liệu lịch khám trên giao diện nếu AI vừa đặt hoặc hủy lịch
      if (response.intent === 'BookAppointment' || response.intent === 'CancelAppointment') {
        queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
        
        if (response.intent === 'CancelAppointment') {
          toast.success('Hệ thống đã ghi nhận yêu cầu Hủy lịch của bạn.');
        } else {
          toast.success('Hệ thống đã ghi nhận yêu cầu Đặt lịch của bạn.');
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponseText,
        isStreaming: true
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      let errorMessage = 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Vui lòng đăng nhập để sử dụng tính năng Đặt lịch qua Chatbot.';
      } else if (error.response?.status === 503 || error.response?.status === 429) {
        errorMessage = 'Hệ thống AI đang bảo trì do quá tải. Vui lòng thử lại sau vài phút.';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: errorMessage,
        isStreaming: true
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="mb-4 w-[400px] sm:w-[450px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300">
          
          {/* Header */}
          <div className="bg-[#0056b3] p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0056b3]">
                  <Bot size={24} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0056b3] rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Trợ lý Y tế Online</h3>
                <p className="text-xs text-blue-100 flex items-center">
                  Đang hoạt động
                </p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body (Khu vực chat) */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-[#0056b3] text-white rounded-br-sm' 
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'
                  }`}
                >
                  {msg.isStreaming ? (
                    <TypewriterMessage 
                      text={msg.text} 
                      onTyping={scrollToBottom}
                      onComplete={() => {
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStreaming: false } : m));
                      }} 
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex flex-col space-y-2 items-start max-w-[80%]">
                  <div className="flex space-x-2 items-center">
                    <div className="flex space-x-1 items-center">
                      <div className="w-1.5 h-1.5 bg-[#0056b3] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#0056b3] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#0056b3] rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs text-[#0056b3] font-medium animate-pulse">Đang suy nghĩ...</span>
                  </div>
                  {/* Skeleton lines */}
                  <div className="w-full space-y-1.5">
                    <div className="h-2 bg-gray-200 rounded-full w-32 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer (Khu vực nhập text) */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2 shrink-0">

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0056b3] focus:border-[#0056b3] transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-[#0056b3] text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-[#0056b3] transition-colors flex items-center justify-center w-10 h-10"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={toggleChat}
        className={`w-14 h-14 bg-[#0056b3] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 ${
          isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

// --- Typewriter Component ---
const TypewriterMessage: React.FC<{ text: string, onComplete?: () => void, onTyping?: () => void }> = ({ text, onComplete, onTyping }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        // Handle consecutive spaces or newlines gracefully
        const char = text.charAt(index);
        setDisplayedText(prev => prev + char);
        index++;
        if (onTyping) onTyping();
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15); // Tốc độ gõ chữ (15ms/kí tự)

    return () => clearInterval(interval);
  }, [text]); // Chỉ run 1 lần khi render component mới
  
  return <span>{displayedText}</span>;
};

