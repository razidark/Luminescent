
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import ptBR from './pt-BR';
// Import English as a fallback just in case types depend on it
import en from './en'; 

export const translations = {
  'en': en, // Kept for type safety fallback
  'pt-BR': ptBR,
  // Map other codes to pt-BR to prevent crashes if user has old localstorage preference
  'es': ptBR,
};
