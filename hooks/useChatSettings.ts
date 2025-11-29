import { useLocalStorage } from './useLocalStorage';
import { type ChatSettings } from '../types';

const defaultSettings: ChatSettings = {
    personality: 'professional',
    tone: 'formal',
    verbosity: 'detailed',
};

export const useChatSettings = () => {
    const [settings, setSettings] = useLocalStorage<ChatSettings>('chatSettings', defaultSettings);

    return { settings, setSettings };
}