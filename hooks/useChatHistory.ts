
import { useLocalStorage } from './useLocalStorage';
import { type ChatMessage } from '../types';

const generateInitialMessages = (): ChatMessage[] => {
    const now = Date.now();
    return [
        {
            id: `init-1-${now}`,
            role: 'model',
            text: "Hello! I'm Aura. I can understand many Indian languages like Kannada, Hindi, and Tamil. How can I support you today?",
            timestamp: new Date(now).toISOString(),
        },
        {
            id: `init-2-${now}`,
            role: 'model',
            text: "Hi there! How are you doing today? I'm here to help you keep an eye on your well-being.",
            timestamp: new Date(now + 1000).toISOString(),
        },
    ];
};

export const useChatHistory = () => {
    // Note: useLocalStorage takes the initialValue as an argument. 
    // We call generateInitialMessages() once here, but if localStorage has data, that data is used.
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('chatHistory', generateInitialMessages());

    const addMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    };

    const clearHistory = () => {
        // When clearing, we must generate fresh messages with new IDs/timestamps
        setMessages(generateInitialMessages());
    };

    return { messages, addMessage, clearHistory };
}
