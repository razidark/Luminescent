
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
    CpuIcon 
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
        id: 'models',
        titleKey: 'wikiModelsTitle',
        icon: CpuIcon,
        sections: [
            { titleKey: 'wikiModelsGemini', contentKey: 'wikiModelsGeminiContent' },
            { titleKey: 'wikiModelsImagen', contentKey: 'wikiModelsImagenContent' },
            { titleKey: 'wikiModelsVeo', contentKey: 'wikiModelsVeoContent' }
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
