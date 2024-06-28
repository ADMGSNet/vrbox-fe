import { TValue } from '@zxd/types/value.type';

import { en_GB } from './en_GB';
import { en_US } from './en_US';
import { es_ES } from './es_ES';
import { fr_FR } from './fr_FR';
import { it_IT } from './it_IT';

export class ZLocaleSettingsMethods {
  /**
   * Retrieves the localization object based on the specified locale.
   *
   * @param locale - The locale string.
   */
  static getLocalization(locale: string) {
    switch (locale) {
      case 'en-GB':
        return en_GB;
      case 'en-US':
        return en_US;
      case 'es-ES':
        return es_ES;
      case 'fr-FR':
        return fr_FR;
      case 'it-IT':
        return it_IT;
      default:
        return it_IT;
    }
  }

  /**
   * Retrieves the value associated with the specified key from the localization object for the given locale.
   *
   * @param locale - The locale for which to retrieve the value.
   * @param key - The key of the value to retrieve.
   */
  static getValue(locale: string, key: string) {
    const localization = ZLocaleSettingsMethods.getLocalization(locale);
    const map = new Map<string, TValue>(Object.entries(localization));
    return map.get(key);
  }
}
