/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { type translations } from '../i18n/locales';

type TranslationKey = keyof typeof translations['en'];

export interface ChangeItem {
  category: 'new' | 'improvement' | 'fix';
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}

export interface ChangelogVersion {
  version: string;
  date: string;
  changes: ChangeItem[];
}

export const changelogData: ChangelogVersion[] = [
  {
    version: '3.0.0',
    date: 'August 24, 2024',
    changes: [
      {
        category: 'new',
        titleKey: 'inspectorTitle',
        descriptionKey: 'inspectorAnalyzing',
      },
      {
        category: 'improvement',
        titleKey: 'wikiArchPerformance',
        descriptionKey: 'wikiArchPerformanceContent',
      },
      {
        category: 'fix',
        titleKey: 'changelogUXImprovementsTitle',
        descriptionKey: 'changelogUXImprovementsDesc',
      }
    ]
  },
  {
    version: '2.5.0',
    date: 'August 15, 2024',
    changes: [
      {
        category: 'improvement',
        titleKey: 'changelogSliderTitle',
        descriptionKey: 'changelogSliderDesc',
      },
      {
        category: 'new',
        titleKey: 'changelogTiltTitle',
        descriptionKey: 'changelogTiltDesc',
      },
      {
        category: 'improvement',
        titleKey: 'changelogTypewriterTitle',
        descriptionKey: 'changelogTypewriterDesc',
      },
    ],
  },
  {
    version: '2.4.0',
    date: 'August 10, 2024',
    changes: [
      {
        category: 'new',
        titleKey: 'changelogRGBTitle',
        descriptionKey: 'changelogRGBDesc',
      },
      {
        category: 'improvement',
        titleKey: 'changelogGlassTitle',
        descriptionKey: 'changelogGlassDesc',
      },
      {
        category: 'new',
        titleKey: 'changelogThemes24Title',
        descriptionKey: 'changelogThemes24Desc',
      },
    ],
  }
];