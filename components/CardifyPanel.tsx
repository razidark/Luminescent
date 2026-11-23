/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { MagicWandIcon, SparkleIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { generateCardDetails } from '../services/geminiService';

interface CardifyPanelProps {
  onApplyCardify: (prompt: string) => void;
  isLoading: boolean;
  currentImage: File | null;
}

type CardType = 'pokemon' | 'yugioh' | 'magic' | 'tarot' | 'playingcard';

// Reusable input component to avoid repetition
const CardInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, disabled: boolean, type?: string}> = ({ label, value, onChange, placeholder, disabled, type = "text" }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-md p-2 focus:ring-1 focus:ring-theme-accent focus:outline-none transition text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
        />
    </div>
);

const CardifyPanel: React.FC<CardifyPanelProps> = ({ onApplyCardify, isLoading, currentImage }) => {
    const { t } = useLanguage();
    const [cardType, setCardType] = React.useState<CardType>('pokemon');
    const [isAutofilling, setIsAutofilling] = React.useState(false);
    const [autofillError, setAutofillError] = React.useState<string | null>(null);
    
    // Common State
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');

    // Pokemon State
    const [hp, setHp] = React.useState('');
    const [pokemonType, setPokemonType] = React.useState('');
    const [attackName, setAttackName] = React.useState('');
    const [attackDamage, setAttackDamage] = React.useState('');
    const [attackDescription, setAttackDescription] = React.useState('');
    const [weakness, setWeakness] = React.useState('');
    const [resistance, setResistance] = React.useState('');
    const [retreatCost, setRetreatCost] = React.useState('');
    
    // Yu-Gi-Oh State
    const [atk, setAtk] = React.useState('');
    const [def, setDef] = React.useState('');
    const [level, setLevel] = React.useState('');
    const [attribute, setAttribute] = React.useState('');
    const [monsterType, setMonsterType] = React.useState('');

    // Magic State
    const [manaCost, setManaCost] = React.useState('');
    const [powerToughness, setPowerToughness] = React.useState('');
    const [cardTypeLine, setCardTypeLine] = React.useState('');

    // Tarot State
    const [cardNumber, setCardNumber] = React.useState('');
    const [keywords, setKeywords] = React.useState('');

    // Playing Card State
    const [rank, setRank] = React.useState('');
    const [suit, setSuit] = React.useState('');

    const handleAutofill = async () => {
        if (!currentImage) return;
        setIsAutofilling(true);
        setAutofillError(null);
        try {
            const details = await generateCardDetails(currentImage, cardType);
            setName(details.name || '');
            setDescription(details.description || '');

            switch (cardType) {
                case 'pokemon':
                    setHp(details.hp || '');
                    setPokemonType(details.pokemonType || '');
                    setAttackName(details.attackName || '');
                    setAttackDamage(details.attackDamage || '');
                    setAttackDescription(details.attackDescription || '');
                    setWeakness(details.weakness || '');
                    setResistance(details.resistance || '');
                    setRetreatCost(details.retreatCost || '');
                    break;
                case 'yugioh':
                    setAtk(details.atk || '');
                    setDef(details.def || '');
                    setLevel(details.level || '');
                    setAttribute(details.attribute || '');
                    setMonsterType(details.monsterType || '');
                    break;
                case 'magic':
                    setManaCost(details.manaCost || '');
                    setPowerToughness(details.powerToughness || '');
                    setCardTypeLine(details.cardTypeLine || '');
                    break;
                case 'tarot':
                    setCardNumber(details.cardNumber || '');
                    setKeywords(details.keywords || '');
                    break;
                case 'playingcard':
                    setRank(details.rank || '');
                    setSuit(details.suit || '');
                    break;
            }

        } catch (err) {
            console.error("Autofill failed:", err);
            setAutofillError(err instanceof Error ? err.message : t('errorAutofill'));
        } finally {
            setIsAutofilling(false);
        }
    };


    const constructPrompt = () => {
        let prompt = `You are a master digital artist and graphic designer AI, renowned for creating stunning, authentic-looking trading cards. Your task is to transform the provided user image into a complete, high-fidelity trading card based on the specified game style and details. The user's image MUST be the central artwork, beautifully and seamlessly integrated into the card's art box. Recreate the entire card, including the frame, text boxes, symbols, and typography, with meticulous attention to the official design language of the chosen game. The final output must be a single, complete image of the card, ready for printing. Do not return text or commentary.`;

        switch (cardType) {
            case 'pokemon':
                prompt += `\n\nGame Style: Pokémon Trading Card Game (modern Scarlet & Violet era). The card should look official.
Card Details:
- Name: "${name || 'AI-mon'}"
- HP: "${hp || '100'} HP"
- Type: "${pokemonType || 'Colorless'}" (e.g., Fire, Water, Grass, Lightning, Psychic, Fighting, Colorless). Render the correct energy symbol.
- Attack Name: "${attackName || 'Generate'}"
- Attack Damage: "${attackDamage || '30'}"
- Attack Description: "${attackDescription || 'This attack does 30 damage.'}"
- Weakness: "${weakness || 'Fighting'}" (Render the correct energy symbol)
- Resistance: "${resistance || 'Psychic'}" (Render the correct energy symbol)
- Retreat Cost: "${retreatCost || '2'}" (Render this as Colorless energy symbols)
- Flavor Text: "${description || 'A mysterious creature discovered by AI.'}"`;
                break;
            case 'yugioh':
                prompt += `\n\nGame Style: Yu-Gi-Oh! Trading Card Game (Effect Monster Card). The card should look official.
Card Details:
- Name: "${name || 'AI Duelist'}"
- Attribute: "${attribute || 'DARK'}" (e.g., DARK, LIGHT, EARTH, WATER, FIRE, WIND). Render the correct symbol.
- Level: "${level || '4'}" (Render this as Level stars at the top right)
- Type: "[${monsterType || 'Machine/Effect'}]"
- ATK: "${atk || '1500'}"
- DEF: "${def || '1200'}"
- Description/Effect: "${description || 'A powerful monster created by artificial intelligence, ready to duel.'}"`;
                break;
            case 'magic':
                prompt += `\n\nGame Style: Magic: The Gathering (modern card frame). The card should look official.
Card Details:
- Name: "${name || 'AI Construct'}"
- Mana Cost: "${manaCost || '{2}{U}{U}'}" (Use standard Magic notation, e.g., {W}, {U}, {B}, {R}, {G}, {2}. Render the correct symbols in the top right).
- Type Line: "${cardTypeLine || 'Artifact Creature — Construct'}"
- Power/Toughness: "${powerToughness || '3/3'}" (Render this in the bottom right box).
- Rules/Flavor Text: "${description || 'Forged in the crucible of code, it knows only logic and battle.'}"`;
                break;
            case 'tarot':
                prompt += `\n\nGame Style: Classic Rider-Waite-Smith inspired Tarot Card. The design should feel mystical, symbolic, and ornate.
Card Details:
- Name: "${name || 'The AI'}" (Render this at the bottom in an elegant, serif font).
- Number: "${cardNumber || 'XXII'}" (Render this in Roman numerals at the top).
- Keywords: "${keywords || 'Creation, Logic, Data, Future'}"
- Description: "${description || 'A card representing the dawn of a new age of intelligence and possibility.'}"
- Border: The card must have an intricate, traditional border framing the artwork.`;
                break;
            case 'playingcard':
                prompt += `\n\nGame Style: Traditional Playing Card (like a King, Queen, or Jack). The design should be ornate and symmetrical if possible.
Card Details:
- Rank: "${rank || 'A'}" (e.g., A, K, Q, J, 10, 9...).
- Suit: "${suit || 'Spades'}" (Hearts, Diamonds, Clubs, Spades).
- Instructions: Render the Rank and Suit symbols in the top-left and bottom-right corners. The user's image should be the main art for the face card.`;
                break;
        }
        return prompt;
    };

    const handleApply = () => {
        const prompt = constructPrompt();
        onApplyCardify(prompt);
    };

    const cardTypes: { id: CardType, name: string }[] = [
        { id: 'pokemon', name: 'Pokémon' },
        { id: 'yugioh', name: 'Yu-Gi-Oh!' },
        { id: 'magic', name: 'Magic' },
        { id: 'tarot', name: 'Tarot' },
        { id: 'playingcard', name: 'Playing Card' },
    ];
    
    const isBusy = isLoading || isAutofilling;

    return (
        <div className="w-full p-6 flex flex-col gap-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-300">{t('cardifyTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center -mt-2">{t('cardifyDesc')}</p>
            
            <div className="flex items-center justify-center gap-2 flex-wrap">
                {cardTypes.map(ct => (
                    <button
                        key={ct.id}
                        onClick={() => setCardType(ct.id)}
                        disabled={isBusy}
                        className={`px-4 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                        cardType === ct.id
                            ? 'bg-theme-gradient text-white shadow-md shadow-theme-accent/20'
                            : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200'
                        }`}
                    >
                        {ct.name}
                    </button>
                ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div className="md:col-span-3">
                     <CardInput label={t('cardName')} value={name} onChange={e => setName(e.target.value)} placeholder={t('cardNamePlaceholder')} disabled={isBusy} />
                </div>
               
                {cardType === 'pokemon' && (
                    <>
                        <CardInput label={t('cardHP')} value={hp} onChange={e => setHp(e.target.value)} placeholder={t('cardHPPlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardType')} value={pokemonType} onChange={e => setPokemonType(e.target.value)} placeholder={t('cardTypePlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardAttackName')} value={attackName} onChange={e => setAttackName(e.target.value)} placeholder={t('cardAttackNamePlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardAttackDamage')} value={attackDamage} onChange={e => setAttackDamage(e.target.value)} placeholder={t('cardAttackDamagePlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardWeakness')} value={weakness} onChange={e => setWeakness(e.target.value)} placeholder={t('cardWeaknessPlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardResistance')} value={resistance} onChange={e => setResistance(e.target.value)} placeholder={t('cardResistancePlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardRetreatCost')} value={retreatCost} onChange={e => setRetreatCost(e.target.value)} placeholder={t('cardRetreatCostPlaceholder')} disabled={isBusy} type="number" />
                        <div className="md:col-span-3">
                            <CardInput label={t('cardAttackDescription')} value={attackDescription} onChange={e => setAttackDescription(e.target.value)} placeholder={t('cardAttackDescriptionPlaceholder')} disabled={isBusy} />
                        </div>
                    </>
                )}
                {cardType === 'yugioh' && (
                    <>
                        <CardInput label={t('cardAttribute')} value={attribute} onChange={e => setAttribute(e.target.value)} placeholder={t('cardAttributePlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardLevel')} value={level} onChange={e => setLevel(e.target.value)} placeholder={t('cardLevelPlaceholder')} disabled={isBusy} type="number" />
                        <CardInput label={t('cardMonsterType')} value={monsterType} onChange={e => setMonsterType(e.target.value)} placeholder={t('cardMonsterTypePlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardATK')} value={atk} onChange={e => setAtk(e.target.value)} placeholder={t('cardATKPlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardDEF')} value={def} onChange={e => setDef(e.target.value)} placeholder={t('cardDEFPlaceholder')} disabled={isBusy} />
                    </>
                )}
                {cardType === 'magic' && (
                    <>
                        <CardInput label={t('cardManaCost')} value={manaCost} onChange={e => setManaCost(e.target.value)} placeholder={t('cardManaCostPlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardTypeLine')} value={cardTypeLine} onChange={e => setCardTypeLine(e.target.value)} placeholder={t('cardTypeLinePlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardPowerToughness')} value={powerToughness} onChange={e => setPowerToughness(e.target.value)} placeholder={t('cardPowerToughnessPlaceholder')} disabled={isBusy} />
                    </>
                )}
                {cardType === 'tarot' && (
                     <>
                        <CardInput label={t('cardTarotNumber')} value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder={t('cardTarotNumberPlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardKeywords')} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder={t('cardKeywordsPlaceholder')} disabled={isBusy} />
                    </>
                )}
                {cardType === 'playingcard' && (
                     <>
                        <CardInput label={t('cardRank')} value={rank} onChange={e => setRank(e.target.value)} placeholder={t('cardRankPlaceholder')} disabled={isBusy} />
                        <CardInput label={t('cardSuit')} value={suit} onChange={e => setSuit(e.target.value)} placeholder={t('cardSuitPlaceholder')} disabled={isBusy} />
                    </>
                )}


                 <div className="md:col-span-3">
                    <CardInput label={t('cardDescription')} value={description} onChange={e => setDescription(e.target.value)} placeholder={t('cardDescriptionPlaceholder')} disabled={isBusy} />
                </div>
            </div>
            
            {autofillError && <p className="text-sm text-red-400 text-center">{autofillError}</p>}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                    onClick={handleAutofill}
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={t('autofillCardDetails')}
                    className="w-full sm:w-auto flex-grow bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold py-4 px-6 rounded-lg transition-all hover:bg-gray-300 dark:hover:bg-white/20 active:scale-95 text-base disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={isBusy || !currentImage}
                >
                     {isAutofilling ? <SparkleIcon className="w-5 h-5 animate-spin" /> : <MagicWandIcon className="w-5 h-5" />}
                     {isAutofilling ? t('autofillingCardDetails') : t('autofillWithAI')}
                </button>
                <button
                    onClick={handleApply}
                    className="w-full sm:w-auto flex-grow-[2] bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isBusy}
                >
                     <div className="flex items-center justify-center gap-2">
                        <SparkleIcon className="w-5 h-5" />
                        {t('generateCard')}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default React.memo(CardifyPanel);