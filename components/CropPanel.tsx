
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CropAutoIcon, SparkleIcon } from './icons';
import { useEditor } from '../contexts/EditorContext';

interface CropPanelProps {
  onApplyCrop: () => void;
  onSetAspect: (aspect: number | undefined) => void;
  isLoading: boolean;
  isCropping: boolean;
  onAutoCrop?: (box: { ymin: number, xmin: number, ymax: number, xmax: number }) => void;
}

type AspectRatio = 'free' | '1:1' | '16:9';

const CropPanel: React.FC<CropPanelProps> = ({ onApplyCrop, onSetAspect, isLoading, isCropping, onAutoCrop }) => {
  const { t } = useLanguage();
  const { handleDetectObjects, currentImage, setError } = useEditor();
  const [activeAspect, setActiveAspect] = React.useState<AspectRatio>('free');
  const [isDetecting, setIsDetecting] = React.useState(false);
  
  const handleAspectChange = (aspect: AspectRatio, value: number | undefined) => {
    setActiveAspect(aspect);
    onSetAspect(value);
  }

  const aspects: { name: AspectRatio, value: number | undefined }[] = [
    { name: 'free', value: undefined },
    { name: '1:1', value: 1 / 1 },
    { name: '16:9', value: 16 / 9 },
  ];

  const handleAutoCrop = async () => {
      if(!currentImage || !onAutoCrop) return;
      setIsDetecting(true);
      try {
          const boxes = await handleDetectObjects("main subject");
          if(boxes.length > 0) {
              onAutoCrop(boxes[0]);
          } else {
              setError(t('noObjectsFound'));
          }
      } catch(e) {
          console.error(e);
      } finally {
          setIsDetecting(false);
      }
  };

  return (
    <div className="w-full p-6 flex flex-col items-center gap-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{t('cropTitle')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 -mt-2">{t('cropDescription')}</p>
      
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-full text-center mb-1">{t('cropAspectRatio')}</span>
        {aspects.map(({ name, value }) => (
          <button
            key={name}
            onClick={() => handleAspectChange(name, value)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
              activeAspect === name 
              ? 'text-white shadow-md shadow-theme-accent/20 bg-theme-gradient' 
              : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {onAutoCrop && (
        <div className="w-full max-w-xs pt-2">
            <button
                onClick={handleAutoCrop}
                disabled={isLoading || isDetecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-theme-accent font-bold rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 disabled:opacity-50"
            >
                <CropAutoIcon className={`w-5 h-5 ${isDetecting ? 'animate-pulse' : ''}`} />
                {isDetecting ? t('detecting') : 'Smart Auto-Crop'}
            </button>
        </div>
      )}

      <button
        onClick={onApplyCrop}
        disabled={isLoading || !isCropping}
        className="w-full max-w-xs mt-2 bg-theme-gradient text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-theme-accent/20 hover:shadow-xl hover:shadow-theme-accent/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-gray-700 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        {t('applyCrop')}
      </button>
    </div>
  );
};

export default React.memo(CropPanel);
