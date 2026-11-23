
import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditor } from '../contexts/EditorContext';
import { RobotIcon, CheckCircleIcon, SpinnerIcon } from './icons';
import * as geminiService from '../services/geminiService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { selectedModel, setSelectedModel } = useEditor();
    const [testStatus, setTestStatus] = React.useState<{ state: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ state: 'idle' });
    const [apiKey, setApiKey] = React.useState(() => localStorage.getItem('luminescent_api_key') || '');

    const handleTestConnection = async () => {
        setTestStatus({ state: 'loading' });
        const result = await geminiService.checkConnection(apiKey);
        if (result.success) {
            setTestStatus({ state: 'success', message: result.message });
            setTimeout(() => setTestStatus({ state: 'idle' }), 5000);
        } else {
            setTestStatus({ state: 'error', message: result.message });
        }
    };

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('luminescent_api_key', apiKey.trim());
        } else {
            localStorage.removeItem('luminescent_api_key');
        }
        onClose();
    };

    if (!isOpen) return null;

    const models = [
        { 
            id: 'gemini-2.5-flash', 
            name: 'Gemini 2.5 Flash', 
            desc: 'Fastest model for general edits, restoration, and chat.', 
            badge: t('modelSpeed'),
            imageSupport: 'Good'
        },
        { 
            id: 'gemini-2.5-pro', 
            name: 'Gemini 2.5 Pro', 
            desc: 'Excellent reasoning for complex edits and smart layouts.', 
            badge: t('modelPro'),
            imageSupport: 'Good'
        },
        { 
            id: 'imagen-3.0-generate-002', 
            name: 'Imagen 3.0', 
            desc: 'State-of-the-art model optimized for generating high-fidelity images.', 
            badge: t('modelQuality'),
            imageSupport: 'Full'
        },
        { 
            id: 'veo-2.0-generate-001', 
            name: 'Veo 2.0 Video', 
            desc: 'Advanced generative video modeling for cinematic transitions.', 
            badge: t('modelPro'),
            imageSupport: 'Full'
        }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-gray-200 dark:border-white/10 animate-scale-up">
                {/* Header */}
                <div className="p-8 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-theme-accent/20 rounded-2xl">
                            <RobotIcon className="w-8 h-8 text-theme-accent" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{t('aiSettings')}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('aiSettingsDesc')}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* API Key Input */}
                    <div className="mb-8 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-theme-accent mb-3">Gemini API Key</h3>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-750 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
                            />
                            {apiKey && (
                                <button
                                    onClick={() => setApiKey('')}
                                    className="px-3 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                            Your key is stored locally in your browser session. Leave blank to fallback to the server's default `.env.local` configuration.
                        </p>
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-widest text-theme-accent mb-6">{t('selectAiBrain')}</h3>
                    
                    <div className="grid gap-4">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model.id)}
                                title={`${t('selectAiBrain')}: ${model.name}`}
                                className={`flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-300 border-2 ${
                                    selectedModel === model.id 
                                        ? 'bg-theme-accent/10 border-theme-accent shadow-xl shadow-theme-accent/10' 
                                        : 'bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-300 dark:hover:border-white/20'
                                }`}
                            >
                                <div className={`mt-1 p-2 rounded-xl ${selectedModel === model.id ? 'bg-theme-accent text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                                    {selectedModel === model.id ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-5 h-5" />}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-gray-900 dark:text-white text-lg">{model.name}</span>
                                        <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-lg tracking-tighter">
                                            {model.badge}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{model.desc}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400">Imaging:</span>
                                        <div className="flex gap-1">
                                            {[1,2,3].map(i => (
                                                <div key={i} className={`h-1 w-4 rounded-full ${
                                                    model.imageSupport === 'Full' ? 'bg-green-500' : 
                                                    model.imageSupport === 'Good' ? (i < 3 ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-700') :
                                                    (i < 2 ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700')
                                                }`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                        <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2 uppercase tracking-wide">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Tip: Multimodal Output
                        </h4>
                        <p className="text-xs text-blue-500/80 leading-relaxed italic">
                            If you encounter "IMAGE_OUTPUT_NOT_SUPPORTED", try switching to <b>Gemini 3.1 Flash Image</b>. This model is fine-tuned to return actual images instead of just text descriptions.
                        </p>
                    </div>

                    {testStatus.state !== 'idle' && (
                        <div className={`mt-4 p-4 rounded-xl border animate-fade-in ${
                            testStatus.state === 'loading' ? 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10' :
                            testStatus.state === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' :
                            'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                        }`}>
                            <div className="flex items-center gap-3">
                                {testStatus.state === 'loading' && <SpinnerIcon className="w-5 h-5 animate-spin" />}
                                {testStatus.state === 'success' && <CheckCircleIcon className="w-5 h-5" />}
                                {testStatus.state === 'error' && (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <p className="text-xs font-medium">{testStatus.message || 'Testing connection...'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/5 flex justify-between items-center">
                    <button
                        onClick={handleTestConnection}
                        disabled={testStatus.state === 'loading'}
                        className="px-6 py-3 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        {testStatus.state === 'loading' ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-theme-gradient text-white font-bold rounded-xl hover:shadow-lg hover:shadow-theme-accent/20 transition-all active:scale-95"
                    >
                        {t('applyAndSave')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
