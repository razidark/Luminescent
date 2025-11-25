
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
  },
  {
    version: '2.3.0',
    date: 'July 28, 2024',
    changes: [
      {
        category: 'new',
        titleKey: 'changelogColorPaletteTitle',
        descriptionKey: 'changelogColorPaletteDesc',
      },
      {
        category: 'improvement',
        titleKey: 'changelogToolImprovementsTitle',
        descriptionKey: 'changelogToolImprovementsDesc',
      },
      {
        category: 'improvement',
        titleKey: 'changelogUXImprovementsTitle',
        descriptionKey: 'changelogUXImprovementsDesc',
      },
      {
        category: 'fix',
        titleKey: 'changelogSpacebarFixTitle',
        descriptionKey: 'changelogSpacebarFixDesc',
      },
    ],
  },
  {
    version: '2.2.0',
    date: 'July 26, 2024',
    changes: [
      {
        category: 'new',
        titleKey: 'changelogRetouchTitle',
        descriptionKey: 'changelogRetouchDesc',
      },
      {
        category: 'new',
        titleKey: 'changelogMatrixTitle',
        descriptionKey: 'changelogMatrixDesc',
      },
      {
        category: 'improvement',
        titleKey: 'changelogToolbarTitle',
        descriptionKey: 'changelogToolbarDesc',
      },
      {
        category: 'improvement',
        titleKey: 'changelogDefaultMatrixTitle',
        descriptionKey: 'changelogDefaultMatrixDesc',
      },
    ],
  },
  {
    version: '2.1.0',
    date: 'July 24, 2024',
    changes: [
      {
        category: 'new',
        titleKey: 'changelogMemeifyTitle',
        descriptionKey: 'changelogMemeifyDesc',
      },
      {
        category: 'new',
        titleKey: 'changelogPhotoRestoreTitle',
        descriptionKey: 'changelogPhotoRestoreDesc',
      },
      {
        category: 'improvement',
        titleKey: 'changelogThemeTitle',
        descriptionKey: 'changelogThemeDesc',
      },
      {
        category: 'fix',
        titleKey: 'changelogCropTitle',
        descriptionKey: 'changelogCropDesc',
      },
    ],
  },
  {
    version: '2.0.0',
    date: 'July 15, 2024',
    changes: [
      {
        category: 'new',
        titleKey: 'changelogVideoTitle',
        descriptionKey: 'changelogVideoDesc',
      },
       {
        category: 'new',
        titleKey: 'changelogCardifyTitle',
        descriptionKey: 'changelogCardifyDesc',
      },
      {
        category: 'improvement',
        titleKey: 'changelogFilterTitle',
        descriptionKey: 'changelogFilterDesc',
      },
    ],
  },
];
