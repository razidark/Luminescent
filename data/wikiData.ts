/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { 
    LuminescenceIcon, 
    PaintBrushIcon, 
    VideoIcon, 
    GenerateIcon, 
    CodeBracketIcon, 
    CpuIcon,
    SparkleIcon,
    InfoIcon,
    ChatIcon
} from '../components/icons';

export const wikiData = [
    {
        id: 'intro',
        titleKey: 'wikiIntroTitle',
        icon: LuminescenceIcon,
        sections: [
            { titleKey: 'wikiIntroWelcome', contentKey: 'wikiIntroContent' },
            { titleKey: 'wikiIntroPhilosophy', contentKey: 'wikiIntroPhilosophyContent' }
        ]
    },
    {
        id: 'vision',
        titleKey: 'inspectorTitle',
        icon: InfoIcon,
        sections: [
            { titleKey: 'inspectorTitle', contentKey: 'inspectorAnalyzing' },
            { titleKey: 'wikiTipsMasking', contentKey: 'wikiTipsMaskingContent' }
        ]
    },
    {
        id: 'live',
        titleKey: 'voiceInput',
        icon: ChatIcon,
        sections: [
            { titleKey: 'voiceInput', contentKey: 'wikiIntroWelcome' }, // Reusing keys for structure
            { titleKey: 'wikiModelsGemini', contentKey: 'wikiModelsGeminiContent' }
        ]
    },
    {
        id: 'tips',
        titleKey: 'wikiTipsTitle',
        icon: SparkleIcon,
        sections: [
            { titleKey: 'wikiTipsPrompts', contentKey: 'wikiTipsPromptsContent' },
            { titleKey: 'wikiTipsMasking', contentKey: 'wikiTipsMaskingContent' }
        ]
    },
    {
        id: 'tools',
        titleKey: 'wikiToolsTitle',
        icon: PaintBrushIcon,
        sections: [
            { titleKey: 'wikiToolsEdit', contentKey: 'wikiToolsEditContent' },
            { titleKey: 'wikiToolsGen', contentKey: 'wikiToolsGenContent' },
            { titleKey: 'wikiToolsVideo', contentKey: 'wikiToolsVideoContent' }
        ]
    },
    {
        id: 'architecture',
        titleKey: 'wikiArchTitle',
        icon: CodeBracketIcon,
        sections: [
            { titleKey: 'wikiArchStack', contentKey: 'wikiArchStackContent' },
            { titleKey: 'wikiArchPerformance', contentKey: 'wikiArchPerformanceContent' }
        ]
    }
];