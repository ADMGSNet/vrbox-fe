import isMobile from 'ismobilejs';
import { DateTime } from 'luxon';
import { Md5 } from 'md5-typescript';

import { Renderer2 } from '@angular/core';
import { ZRootComponent } from '@zxd/components/root/z-root.component';
import { ZBase64 } from '@zxd/consts/base64';
import { ZPopupAnchor } from '@zxd/consts/popup-anchor';
import { MCountry } from '@zxd/data/countries';
import { MFlag } from '@zxd/data/flags';
import { MItalianCity } from '@zxd/data/italian-cities';
import { CountryLocale, CountryWithId, CountryWithIdAndFlag } from '@zxd/interfaces/country.interface';
import { FiscalCode, FiscalCodeItem } from '@zxd/interfaces/fiscal-code.interface';
import { KeyValue, KeyValueBoolean, KeyValueNumber, KeyValueString } from '@zxd/interfaces/key-value.interface';
import { PopupPosition } from '@zxd/interfaces/popup-position.interface';

/**
 * Map to convert diacritic symbols into ascii non accented chars
 */
const DefaultDiacriticsRemovalMap = [
  { base: 'A', letters: /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g, },
  { base: 'AA', letters: /[\uA732]/g },
  { base: 'AE', letters: /[\u00C6\u01FC\u01E2]/g },
  { base: 'AO', letters: /[\uA734]/g },
  { base: 'AU', letters: /[\uA736]/g },
  { base: 'AV', letters: /[\uA738\uA73A]/g },
  { base: 'AY', letters: /[\uA73C]/g },
  { base: 'B', letters: /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g, },
  { base: 'C', letters: /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g, },
  { base: 'D', letters: /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g, },
  { base: 'DZ', letters: /[\u01F1\u01C4]/g },
  { base: 'Dz', letters: /[\u01F2\u01C5]/g },
  { base: 'E', letters: /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g, },
  { base: 'F', letters: /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g },
  { base: 'G', letters: /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g, },
  { base: 'H', letters: /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g, },
  { base: 'I', letters: /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g, },
  { base: 'J', letters: /[\u004A\u24BF\uFF2A\u0134\u0248]/g },
  { base: 'K', letters: /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g, },
  { base: 'L', letters: /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g, },
  { base: 'LJ', letters: /[\u01C7]/g },
  { base: 'Lj', letters: /[\u01C8]/g },
  { base: 'M', letters: /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g },
  { base: 'N', letters: /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g, },
  { base: 'NJ', letters: /[\u01CA]/g },
  { base: 'Nj', letters: /[\u01CB]/g },
  { base: 'O', letters: /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g, },
  { base: 'OI', letters: /[\u01A2]/g },
  { base: 'OO', letters: /[\uA74E]/g },
  { base: 'OU', letters: /[\u0222]/g },
  { base: 'P', letters: /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g, },
  { base: 'Q', letters: /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g },
  { base: 'R', letters: /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g, },
  { base: 'S', letters: /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g, },
  { base: 'T', letters: /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g, },
  { base: 'TZ', letters: /[\uA728]/g },
  { base: 'U', letters: /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g, },
  { base: 'V', letters: /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g },
  { base: 'VY', letters: /[\uA760]/g },
  { base: 'W', letters: /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g, },
  { base: 'X', letters: /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g },
  { base: 'Y', letters: /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g, },
  { base: 'Z', letters: /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g, },
  { base: 'a', letters: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g, },
  { base: 'aa', letters: /[\uA733]/g },
  { base: 'ae', letters: /[\u00E6\u01FD\u01E3]/g },
  { base: 'ao', letters: /[\uA735]/g },
  { base: 'au', letters: /[\uA737]/g },
  { base: 'av', letters: /[\uA739\uA73B]/g },
  { base: 'ay', letters: /[\uA73D]/g },
  { base: 'b', letters: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g, },
  { base: 'c', letters: /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g, },
  { base: 'd', letters: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g, },
  { base: 'dz', letters: /[\u01F3\u01C6]/g },
  { base: 'e', letters: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g, },
  { base: 'f', letters: /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g },
  { base: 'g', letters: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g, },
  { base: 'h', letters: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g, },
  { base: 'hv', letters: /[\u0195]/g },
  { base: 'i', letters: /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g, },
  { base: 'j', letters: /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g },
  { base: 'k', letters: /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g, },
  { base: 'l', letters: /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g, },
  { base: 'lj', letters: /[\u01C9]/g },
  { base: 'm', letters: /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g },
  { base: 'n', letters: /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g, },
  { base: 'nj', letters: /[\u01CC]/g },
  { base: 'o', letters: /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g, },
  { base: 'oi', letters: /[\u01A3]/g },
  { base: 'ou', letters: /[\u0223]/g },
  { base: 'oo', letters: /[\uA74F]/g },
  { base: 'p', letters: /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g, },
  { base: 'q', letters: /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g },
  { base: 'r', letters: /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g, },
  { base: 's', letters: /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g, },
  { base: 't', letters: /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g, },
  { base: 'tz', letters: /[\uA729]/g },
  { base: 'u', letters: /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g, },
  { base: 'v', letters: /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g },
  { base: 'vy', letters: /[\uA761]/g },
  { base: 'w', letters: /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g, },
  { base: 'x', letters: /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g },
  { base: 'y', letters: /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g, },
  { base: 'z', letters: /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g, },
];

/**
 * List of fiscal code month codes
 */
export const FiscalCodeMonthCodes = [
  'A', // January
  'B', // February
  'C', // March
  'D', // April
  'E', // May
  'H', // June
  'L', // July
  'M', // August
  'P', // September
  'R', // October
  'S', // November
  'T', // December
];

/**
 * List of fiscal code odd check codes
 */
export const FiscalCodeCheckCodeOdd: KeyValueNumber = {
  0: 1,
  1: 0,
  2: 5,
  3: 7,
  4: 9,
  5: 13,
  6: 15,
  7: 17,
  8: 19,
  9: 21,
  A: 1,
  B: 0,
  C: 5,
  D: 7,
  E: 9,
  F: 13,
  G: 15,
  H: 17,
  I: 19,
  J: 21,
  K: 2,
  L: 4,
  M: 18,
  N: 20,
  O: 11,
  P: 3,
  Q: 6,
  R: 8,
  S: 12,
  T: 14,
  U: 16,
  V: 10,
  W: 22,
  X: 25,
  Y: 24,
  Z: 23,
};

/**
 * List of fiscal code even check codes
 */
export const FiscalCodeCheckCodeEven: KeyValueNumber = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21,
  W: 22,
  X: 23,
  Y: 24,
  Z: 25,
};

/**
 * List of fiscal code alternative check codes
 */
export const FiscalCodeAlternativeCheckCodes = {
  0: 'L',
  1: 'M',
  2: 'N',
  3: 'P',
  4: 'Q',
  5: 'R',
  6: 'S',
  7: 'T',
  8: 'U',
  9: 'V',
};

/**
 * String of allowed chars for fiscal codes
 */
export const FiscalCodeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * List of fiscal code errors
 */
export const FiscalCodeError = {
  Invalid: 'invalid',
};

/**
 * Class of shared methods
 */
export class Methods {
  /**
   * Transforms a generic type value into a string value
   *
   * @template T Type
   * @param arg Value
   */
  static asString<T extends KeyValueString>(arg: T): T {
    return arg;
  }

  /**
   * Transforms a generic type value into a boolean value
   *
   * @template T Type
   * @param arg Value
   */
  static asBoolean<T extends KeyValueBoolean>(arg: T): T {
    return arg;
  }

  /**
   * Transforms a generic type value into a number value
   *
   * @template T Type
   * @param arg  Value
   */
  static asNumber<T extends KeyValueNumber>(arg: T): T {
    return arg;
  }

  /**
   * Parses a partial fiscal code
   *
   * @param fiscalCode Fiscal code
   */
  static parsePartialFiscalCode(fiscalCode: string) {
    const item: FiscalCodeItem = {
      year: 0,
      month: 0,
      day: 0,
      sex: '',
      countryCode: '',
      city: '',
      provinceCode: '',
    };

    const F = fiscalCode.length;
    if (F === 16) {
      const d = Methods.parseFiscalCode(fiscalCode);
      if (!d.error) {
        item.year = d.year;
        item.month = d.month;
        item.day = d.day;
        item.sex = d.sex;

        const countryCode = d.countryCode;
        item.countryCode = countryCode;
        if (countryCode === 'IT') {
          item.city = d.city;
          item.provinceCode = d.provinceCode;
        } else {
          item.city = '';
          item.provinceCode = '';
        }
      }
    } else if (F > 10) {
      const yy = +fiscalCode.substring(6, 8);
      if (!Number.isNaN(yy)) {
        const today = new Date();
        const currentYear = +today.getFullYear().toString().substring(2);
        item.year = currentYear >= yy ? 2000 + yy : 1900 + yy;
        const m = fiscalCode.substring(8, 9);
        const month = FiscalCodeMonthCodes.indexOf(m) + 1;
        if (month) {
          item.month = month;

          const dd = +fiscalCode.substring(9, 11);
          if (!Number.isNaN(dd)) {
            item.day = dd > 40 ? dd - 40 : dd;
            item.sex = dd > 40 ? 'F' : 'M';
          }
        }
      }
    }
    return item;
  }

  /**
   * Determines whether a fiscal code is valid
   *
   * @param fiscalCode Fiscal code
   */
  static isFiscalCodeValid(fiscalCode: string) {
    const re =
      /^(?:[A-Z][AEIOU][AEIOUX]|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i;
    return !!re.test(fiscalCode);
  }

  /**
   * Parses a fiscal code
   *
   * @param fiscalCode Fiscal code
   */
  static parseFiscalCode(fiscalCode: string) {
    const result: FiscalCode = {};
    if (!Methods.isFiscalCodeValid(fiscalCode)) {
      result.error = FiscalCodeError.Invalid;
      return result;
    }
    let val = 0;
    for (let i = 0; i < 15; i++) {
      const c = fiscalCode[i];
      val +=
        i % 2 !== 0 ? FiscalCodeCheckCodeEven[c] : FiscalCodeCheckCodeOdd[c];
    }
    val = val % 26;
    const lastChar = FiscalCodeAlphabet.charAt(val);
    const F = fiscalCode.length;
    if (lastChar !== fiscalCode.substring(F - 1)) {
      result.error = FiscalCodeError.Invalid;
      result.lastChar = lastChar;
      return result;
    }

    const today = new Date();
    const yy = +fiscalCode.substring(6, 8);
    const currentYear = +today.getFullYear().toString().substring(2);
    const year = currentYear >= yy ? 2000 + yy : 1900 + yy;
    const m = fiscalCode.substring(8, 9);
    const month = FiscalCodeMonthCodes.indexOf(m) + 1;
    const dd = +fiscalCode.substring(9, 11);
    const day = dd > 40 ? dd - 40 : dd;

    result.sex = dd > 40 ? 'F' : 'M';
    result.day = day;
    result.month = month;
    result.year = year;

    const istat = fiscalCode.substring(11, 15);
    if (istat.startsWith('Z')) {
      for (const [code, item] of MCountry.entries()) {
        if (item.istat === istat) {
          result.countryCode = code;
          break;
        }
      }
    } else {
      const place = MItalianCity.get(istat);
      if (place) {
        result.city = place.name;
        result.provinceCode = place.provinceCode;
        result.countryCode = 'IT';
      }
    }
    result.fiscalCode = fiscalCode;
    return result;
  }

  /**
   * Determines whether input value is undefined
   *
   * @param u Input value
   */
  static isUndefined(u: any): boolean {
    return u === undefined;
  }

  /**
   * Determines whether input value is null
   *
   * @param x Input value
   */
  static isNull(x: any): boolean {
    return x === null;
  }

  /**
   * Determines whether input value is null or undefined
   *
   * @param x Input value
   */
  static isNullOrUndefined(x: any): boolean {
    return Methods.isNull(x) || Methods.isUndefined(x);
  }

  /**
   * Determines whether input value is an object
   *
   * @param o Input value
   */
  static isObject(o: any): boolean {
    if (Methods.isNullOrUndefined(o)) {
      return false;
    }
    return typeof o === 'object';
  }

  /**
   * Determines whether input value is an empty object
   *
   * @param obj Input value
   */
  static isEmptyObject(obj: any): boolean {
    if (!Methods.isObject(obj)) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return Object.keys(obj).length === 0;
  }

  /**
   * Determines whether input value is an array
   *
   * @param a Input value
   */
  static isArray(a: any): boolean {
    if (Methods.isNullOrUndefined(a)) {
      return false;
    }
    return Array.isArray(a);
  }

  /**
   * Determines whether input value is a string
   *
   * @param s Input value
   */
  static isString(s: any): boolean {
    if (Methods.isNullOrUndefined(s)) {
      return false;
    }
    return typeof s === 'string';
  }

  /**
   * Determines whether input value is a function
   *
   * @param fn Input value
   */
  static isFunction(fn: any) {
    return typeof fn === 'function';
  }

  /**
   * Determines whether input value is a valid date
   *
   * @param d
   */
  static isValidDate(d: any): boolean {
    return (
      Object.prototype.toString.call(d) === '[object Date]' &&
      !Number.isNaN((d as Date).getTime())
    );
  }

  /**
   * Replaces diacritics symbols in a string with related non-accented ascii chars
   *
   * @param s String to transform
   */
  static replaceDiacritics(s: string): string {
    if (!s) {
      return '';
    }
    let result = s;
    const MAP = DefaultDiacriticsRemovalMap;
    for (let i = 0, I = MAP.length; i < I; i++) {
      result = result.replace(MAP[i].letters, MAP[i].base);
    }
    return result;
  }

  /**
   * Whether the user is using a mobile device
   */
  static isMobile(): boolean {
    return isMobile(window.navigator).any;
  }

  /**
   * Determines whether current browser is MS Edge
   */
  static isEdge(): boolean {
    return /Edge/i.test(navigator.userAgent);
  }

  /**
   * Determines whether current OS is a MacOS
   */
  static isMacOS(): boolean {
    return /Mac OS/i.test(navigator.userAgent);
  }

  /**
   * Determines whether current browser is Opera
   */
  static isOpera(): boolean {
    return /Opera/i.test(navigator.userAgent);
  }

  /**
   * Determines whether current browser is Firefox
   */
  static isFirefox(): boolean {
    return /Firefox/i.test(navigator.userAgent);
  }

  /**
   * Determines whether current browser is Chrome
   */
  static isChrome(): boolean {
    return /Chrome/i.test(navigator.userAgent);
  }

  /**
   * Determines whether current browser is Safari
   */
  static isSafari(): boolean {
    return /Safari/i.test(navigator.userAgent) && !Methods.isChrome();
  }

  /**
   * Determines whether current browser is based on WebKit
   */
  static isWebKit(): boolean {
    return /AppleWebKit/i.test(navigator.userAgent);
  }

  /**
   * Handles ctrl keys
   *
   * @param ev Keyboard Event
   */
  static ctrlKey(ev: KeyboardEvent | MouseEvent | TouchEvent) {
    return ev.ctrlKey;
  }

  /**
   * Handles Meta keys
   *
   * @param ev Keyboard Event
   */
  static metaKey(ev: KeyboardEvent | MouseEvent | TouchEvent) {
    return Methods.isMacOS() && !Methods.isOpera() ? ev.metaKey : ev.ctrlKey;
  }

  /**
   * Handles Shift keys
   *
   * @param ev Keyboard Event
   */
  static shiftKey(ev: KeyboardEvent | MouseEvent | TouchEvent) {
    return ev.shiftKey;
  }

  /**
   * Capitalizes a string
   *
   * @param s Input string
   */
  static capitalize(s: string): string {
    return s.replace(
      /\w\S*/g,
      (txt: string) =>
        txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
    );
  }

  /**
   * Determines whether an email is valid
   *
   * @param email Email
   */
  static isEmailValid(email: string): boolean {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
    const re = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
    return re.test(email);
  }

  /**
   * Converts a plain text into an html text
   *
   * @param s Plain text string
   */
  static string2HTML(s: string) {
    const el = document.createElement('div');
    el.innerText = s;
    return el.innerHTML;
  }

  /**
   * Converts an html text into a plain text string
   *
   * @param html HTML text
   * @param singleLine Determines whether plain text should be a single line text or a multiline (with \n chars) text
   */
  static html2text(html: string, singleLine = false) {
    if (!html) {
      return '';
    }
    // Create a new div element
    const tempDivElement = document.createElement('div');

    // Set the HTML content with the given value
    tempDivElement.innerHTML = html;

    // Retrieve the text property of the element
    let text = tempDivElement.textContent || tempDivElement.innerText || '';
    if (singleLine) {
      // replaces new line characters with spaces
      text = text.replace(/\n/g, ' ');
    }
    return text;
  }

  /**
   * Converts a string to a number
   *
   * @param s A string containg numeric digits and decimal separators
   */
  static stringToNumber(s: string) {
    return +s.replace(/,/g, '.');
  }

  /**
   * Converts a string to a hex string
   *
   * @param s Input string
   */
  static stringToHex(s: string) {
    let result = '';
    const I = s.length;
    for (let i = 0; i < I; i++) {
      const hex = s.charCodeAt(i).toString(16);
      result += `000${ hex }`.slice(-4);
    }
    return result;
  }

  /**
   * Computes a MD5 value form an object
   *
   * @param obj Source
   * @param fields Array of fields to include in serialization
   */
  static getMd5FromObject(obj: any, fields: string[]) {
    const json = JSON.stringify(obj, fields);
    return Md5.init(json);
  }

  /**
   * Converts a datetimestring to a datetime
   *
   * @param dts    DateTimeString
   * @param locale Locale string
   */
  static dateTimeString2DateTime(dts: string, locale: string) {
    const year = +dts.substring(0, 4);
    const month = +dts.substring(4, 6);
    const day = +dts.substring(6, 8);
    const hours = +dts.substring(8, 10);
    const minutes = +dts.substring(10, 12);

    let dt: DateTime;
    if (!year) {
      dt = DateTime.local();
    } else if (!month) {
      dt = DateTime.local(year, 1).setLocale(locale);
    } else if (!day) {
      dt = DateTime.local(year, month).setLocale(locale);
    } else if (!hours) {
      dt = DateTime.local(year, month, day).setLocale(locale);
    } else if (!minutes) {
      dt = DateTime.local(year, month, day, hours).setLocale(locale);
    } else {
      dt = DateTime.local(year, month, day, hours, minutes).setLocale(locale);
    }
    return dt;
  }

  /**
   * Replaces node content
   *
   * @param oldNode Old node
   * @param html    New node inner html content
   */
  static replaceNodeContent(oldNode: HTMLElement, html: string) {
    const parent = oldNode.parentElement;
    if (parent) {
      parent.innerHTML = html;
    }
  }

  /**
   * Prevents default event
   *
   * @param event Event
   */
  static preventDefault(event: Event) {
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  /**
   * Stops events on mouse down or touch start
   *
   * @param event Event
   */
  static stopEventsOnMouseDownOrTouchStart(event: MouseEvent | TouchEvent) {
    if (event) {
      Methods.preventDefault(event);
      event.stopPropagation();
    }
  }

  /**
   * Opens a new page
   *
   * @param url URL
   * @param target Target (_blank, _self)
   */
  static openURL(url: string, target = '_blank') {
    window.open(url, target);
  }

  /**
   * Create an email link
   *
   * @param address Email address
   */
  static sendEmail(address: string) {
    const url = `mailto:${ address }`;
    window.open(url, '_self');
  }

  /**
   * Gets italian plural article
   *
   * @param number Cardinality
   * @param sex Male or female
   */
  static getItalianPluralArticle(number: number, sex = 'M') {
    if (sex === 'M') {
      if (number === 11) {
        return 'gli';
      }
      const s = `${ number }`;
      if (s.startsWith('8')) {
        return 'gli';
      }
      return 'i';
    }
    return 'le';
  }

  /**
   * Clears all selections on window objects
   */
  static clearAllSelections() {
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }

  /**
   * Deep clones an object
   *
   * @template T Type
   * @param source Object to clone
   */
  static clone<T>(source: T): T {
    const result: T = Array.isArray(source)
      ? source.map((item: T) => Methods.clone(item))
      : source instanceof Date
        ? new Date(source.getTime())
        : source && typeof source === 'object'
          ? Object.getOwnPropertyNames(source).reduce(
            (o, prop) => {
              Object.defineProperty(
                o,
                prop,
                Object.getOwnPropertyDescriptor(source, prop)!,
              );
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              o[prop] = Methods.clone((source as KeyValue<any>)[prop]);
              return o as T;
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            },
            Object.create(Object.getPrototypeOf(source)),
          )
          : source;
    return result;
  }

  /**
   * Gets country name from code and locale
   *
   * @param countryCode Country code
   * @param locale Locale
   */
  static getCountryName(countryCode: string, locale: string) {
    if (!MCountry.has(countryCode)) {
      return '';
    }
    const country = MCountry.get(countryCode) as CountryLocale;
    return country.name[locale];
  }

  /**
   * Gets country name from code and locale
   *
   * @param cityId City ID
   */
  static getProvinceCode(cityId: string) {
    if (!MItalianCity.has(cityId)) {
      return '';
    }
    const city = MItalianCity.get(cityId);
    return city?.provinceCode ?? '';
  }

  /**
   * Gets flag by code
   *
   * @param code 2 digit country code
   */
  static getFlag(code: string) {
    const code_2_digit = code.substring(0, 2);
    if (MFlag.has(code_2_digit)) {
      return MFlag.get(code_2_digit) as string;
    }
    return ZBase64.TransparentGif;
  }

  /**
   * Makes the intersection between two arrays (a ∩ b)
   */
  static intersection(a: any[], b: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return a.filter((x) => b.includes(x));
  }

  /**
   * Makes the differece between two arrays (a \ b)
   */
  static difference(a: any[], b: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return a.filter((x) => !b.includes(x));
  }

  /**
   * Makes the simmetrical differece between two arrays (a ⊖ b)
   */
  static simmetricalDifference(a: any[], b: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return a
      .filter((x) => !b.includes(x))
      .concat(b.filter((x) => !a.includes(x)));
  }

  /**
   * Makes the union between two arrays (a ∪ b)
   */
  static union(a: any[], b: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return [...new Set([...a, ...b])];
  }

  /**
   * Gets a property from an object
   *
   * @template T Object type
   * @template K Key type
   * @param obj Object
   * @param key Key field
   */
  static getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key]; // Inferred type is T[K]
  }

  /**
   * Sets a property into an object
   *
   * @template T Object type
   * @template K Key type
   * @param obj Object
   * @param key Key field
   * @param value Value to set
   */
  static setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
    obj[key] = value;
  }

  /**
   * Converts a number of bytes into a more readable string indicating size
   *
   * @param bytes Number of bytes
   */
  static bytesToSize(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes) {
      return '0 byte';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `<span class='number'>${ Math.round(
      bytes / 1024 ** i,
    ) }</span><span class='unit'>${ sizes[i] }</span>`;
  }

  /**
   * Sets a cookie
   *
   * @param name Cookie name
   * @param value Cookie value
   * @param expireDays Expire time (in days)
   */
  static setCookie(name: string, value: string, expireDays = 60) {
    const d = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);

    const expires = `expires=${ d.toUTCString() }`;
    document.cookie = `${ name }=${ value }; ${ expires }`;
  }

  /**
   * Deletes a cookie
   *
   * @param name Cookie name
   */
  static deleteCookie(name: string) {
    const value = 'false';
    const expires = 'expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = `${ name }=${ value }; ${ expires }`;
  }

  /**
   * Gets a cookie
   *
   * @param name Cookie name
   */
  static getCookie(name: string) {
    const nameLenPlus = name.length + 1;
    return (
      document.cookie
        .split(';')
        .map((c) => c.trim())
        .filter((cookie) => cookie.substring(0, nameLenPlus) === `${ name }=`)
        .map((cookie) =>
          decodeURIComponent(cookie.substring(nameLenPlus)),
        )[0] || ''
    );
  }

  /**
   * Moves an element to a specific position on the screen
   *
   * @param renderer Angular renderer
   * @param el DOM element
   */
  static move(
    renderer: Renderer2,
    el: HTMLElement,
    x: number,
    y: number,
    dragStartX: number,
    dragStartY: number,
  ) {
    const htmlCollection = document.getElementsByClassName('z-root');
    if (!htmlCollection.length) {
      return;
    }
    const root = htmlCollection[0] as HTMLElement;
    const bodyWidth = root.clientWidth;
    const bodyHeight = root.clientHeight;
    let top = y - dragStartY;

    const marginTop = 5;
    const marginBottom = 40;
    const marginLeft = 5;
    const marginRight = 100;

    if (top <= marginTop) {
      top = marginTop;
    } else if (top > bodyHeight - marginBottom) {
      top = bodyHeight - marginBottom;
    }

    let left = x - dragStartX - 1;
    if (left <= marginLeft) {
      left = marginLeft;
    } else if (left > bodyWidth - marginRight) {
      left = bodyWidth - marginRight;
    }
    renderer.setStyle(el, 'top', `${ top }px`);
    renderer.setStyle(el, 'left', `${ left }px`);
  }

  /**
   * Moves an element to the center of the screen
   *
   * @param renderer Angular renderer
   * @param el DOM element
   */
  static resetWindowPosition(renderer: Renderer2, el: HTMLElement) {
    renderer.removeClass(el, 'z_dialog_moved');

    renderer.setStyle(el, 'top', '');
    renderer.setStyle(el, 'left', '');
  }

  /**
   * Parse a localized number to a float.
   *
   * @param stringNumber The localized number
   * @param locale The locale that the number is represented in. Omit this parameter to use the current locale.
   */
  static parseLocaleNumber(stringNumber: string, locale: string) {
    const thousandSeparator = Intl.NumberFormat(locale)
      .format(11111)
      .replace(/\p{Number}/gu, '');
    const decimalSeparator = Intl.NumberFormat(locale)
      .format(1.1)
      .replace(/\p{Number}/gu, '');

    return Number.parseFloat(
      stringNumber
        .replace(new RegExp(`\\${ thousandSeparator }`, 'g'), '')
        .replace(new RegExp(`\\${ decimalSeparator }`), '.'),
    );
  }

  /**
   * Format a number as locale string
   *
   * @param number The number to format
   * @param locale The locale that the number is represented in. Omit this parameter to use the current locale.
   * @param maximumFractionDigits The maximum number of digits after the decimal separator.
   * @param showThousandSeparator Whether to show the thousand separator.
   */
  static formatLocaleNumber(
    number: number,
    locale: string,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    showThousandSeparator = false,
  ) {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping: showThousandSeparator,
    };
    return new Intl.NumberFormat(locale, options).format(number);
  }

  /**
   * Format a currency
   *
   * @param number The number to format
   * @param locale The locale that the number is represented in. Omit this parameter to use the current locale.
   * @param currency The currency to use in formatting. The default is the currency of the environment locale.
   * @param showThousandSeparator Whether to show the thousand separator.
   */
  static formatCurrency(
    number: number,
    locale: string,
    currency = 'EUR',
    showThousandSeparator = true,
  ) {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: showThousandSeparator,
      style: 'currency',
      currency,
    };
    return new Intl.NumberFormat(locale, options).format(number);
  }

  /**
   * Gets the best foreground color based on background color
   *
   * @param backgroundColor Background color
   */
  static getForegroundColor(backgroundColor: string): string {
    const text_color_default = '#222';
    const white = '#fff';
    if (!backgroundColor) {
      return text_color_default; // returns a dark grey, instead black, because antialias renders it more readable than black
    }
    let bgColor = backgroundColor;
    if (bgColor[0] === '#') {
      bgColor = bgColor.substring(1, bgColor.length);
    }
    if (bgColor.length === 3) {
      bgColor =
        bgColor[0] +
        bgColor[0] +
        bgColor[1] +
        bgColor[1] +
        bgColor[2] +
        bgColor[2];
    }
    const r = Number.parseInt(bgColor.substring(0, 2), 16);
    const g = Number.parseInt(bgColor.substring(2, 4), 16);
    const b = Number.parseInt(bgColor.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 >= 128
      ? text_color_default
      : white;
  }

  /**
   * Returns _true_ if popup should open downwards, _false_ otherwise
   *
   * @param root      Root component
   * @param ownerRect Owner DOM rectangle
   * @param h         Popup height (in px)
   */
  static openUpwards(root: ZRootComponent, ownerRect: DOMRect, h: number) {
    // root height
    const H = root.height;
    // popup initial top position
    const t = ownerRect.top + ownerRect.height;

    // ownerRect:
    //    ▀▀▀▀▀▀
    //
    // (1) => true
    //
    //   |<-----  W ------>|       |<-----  W ------>|
    //   ┌-----------------┐       ┌-----------------┐
    //   |                 |       |       ┌-------┐ |
    // H |                 |  ==>  |       |       | |
    //   |                 |       |       |_______| |
    //   |<- l ->┌▀▀▀▀▀▀▀┐ |       |<left-> ▀▀▀▀▀▀▀  |
    //   └-------|-------|-┘       └-----------------┘
    //           └-------┘
    //
    // (2) => false
    //
    //   |<-----  W ------>|       |<-----  W ------>|
    //                                  ┌-------┐
    //   ┌-----------------┐       ┌----|       |----┐
    // H |                 |       |    |_______|    |
    //   |<- l ->┌▀▀▀▀▀▀▀┐ |       |     ▀▀▀▀▀▀▀     |
    //   └-------|-------|-┘       └-----------------┘
    //           └-------┘
    //
    // (3) => false
    //
    //   |<-----  W ------>|
    //   ┌-----------------┐
    //   |<- l ->┌▀▀▀▀▀▀▀┐ |
    // H |       |       |h|  ==> true
    //   |       └-------┘ |
    //   |                 |
    //   └-----------------┘
    //
    if (t + h > H) {
      if (t - h - ownerRect.height < 0) {
        return false; // (1)
      }
      return false; // (2)
    }
    return false; // (3)
  }

  /**
   * Sets popup position
   *
   * @param root      Root component
   * @param ownerRect Owner DOM rectangle
   * @param w         Popup width (in px)
   * @param h         Popup height (in px)
   * @param anchor    Popup anchor (left or right)
   */
  static setPopupPosition(
    root: ZRootComponent,
    ownerRect: DOMRect,
    w: number,
    h: number,
    anchor = ZPopupAnchor.Left,
  ) {
    // root width
    const W = root.width;
    // root height
    const H = root.height;

    // popup initial vertical positions
    const t = ownerRect.top + ownerRect.height;
    const b = ownerRect.bottom - ownerRect.height;
    // popup initial left position
    const l = anchor === ZPopupAnchor.Left ? ownerRect.left : ownerRect.right;

    let x = l;
    let top = `${ t }px`;
    let bottom = 'auto';

    // ownerRect:
    //   anchor: left    anchor: right
    //      ●▀▀▀▀▀▀      ▀▀▀▀▀▀●
    //   (t, l)                   (t, l)
    //
    // (1)
    //
    //   |<--------- W -------->|            |<--------- W -------->|
    //   ┌----------------------┐            ┌----------------------┐
    //   |         (l, t)       |            |   (x, top)           |
    //   |            ●▀▀▀▀▀▀---|---┐        |      ●------▀▀▀▀▀▀┐  |
    // H |            |            h|   ==>  |      |            |h |
    //   |            └---------|---┘        |      └------------┘  |
    //   |                   w  |            |             w        |
    //   └----------------------┘            └----------------------┘
    //
    if (anchor === ZPopupAnchor.Left) {
      if (l + w > W) {
        x = Math.max(0, l - (w - ownerRect.width));
      }
    }

    // (2)
    //
    //    |<--------- W -------->|       |<--------- W -------->|
    //    ┌----------------------┐       ┌----------------------┐
    //    |         (l, t)       |       | (x, top)             |
    //  ┌-|----▀▀▀▀▀▀●           |       ●----▀▀▀▀▀▀--┐         |
    //  | |          |h          |   ==> |            |h        | H
    //  └-|----------┘           |       |------------┘         |
    //    |    w                 |       |     w                |
    //    └----------------------┘       └----------------------┘
    //
    if (anchor === ZPopupAnchor.Right) {
      if (l - w < 0) {
        x = 0;
      } else {
        x = l - W;
      }
    }

    //
    // (3)
    //
    //   |<-----  W ------>|       |<-----  W ------>|
    //   ┌-----------------┐       ┌-----------------┐
    //   |                 |       |       ┌-------┐ |
    // H |                 |  ==>  |       |       | |
    //   |                 |       |       |_______| |
    //   |<- l ->┌▀▀▀▀▀▀▀┐ |       |<- x -> ▀▀▀▀▀▀▀  |
    //   └-------|-------|-┘       └-----------------┘
    //           └-------┘
    //
    if (t + h > H) {
      if (t - h - ownerRect.height >= 0) {
        top = 'auto';
        bottom = `-${ b }px`;
      }
    }
    const position: PopupPosition = { top, x, bottom };
    return position;
  }

  /**
   * Gets list of all countries
   *
   * @param locale Locale
   */
  static getCountries(locale: string) {
    const countries: CountryWithId[] = [];
    for (const [code, v] of MCountry.entries()) {
      const name = v.name[locale];
      const name_ = v.name_?.[locale] ? v.name_[locale] : '';
      const nationality = v.nationality[locale];
      const nationality_ = v.nationality_?.[locale]
        ? v.nationality_[locale]
        : '';
      const istat = v.istat;
      const item: CountryWithId = {
        id: code,
        code,
        name,
        nationality,
        phonePrefixes: v.phonePrefixes,
      };
      if (name_) {
        item.name_ = name_;
      }
      if (nationality_) {
        item.nationality_ = nationality_;
      }
      if (istat) {
        item.istat = istat;
      }
      countries.push(item);
    }
    return countries;
  }

  /**
   * Gets list of all countries and flags
   *
   * @param locale Locale
   */
  static getCountriesAndFlags(locale: string) {
    if (!locale) {
      console.warn('Locale is not defined');
      return [];
    }
    const countries: CountryWithIdAndFlag[] = [];
    for (const [code, v] of MCountry.entries()) {
      const name = v.name[locale];
      const name_ = v.name_?.[locale] ? v.name_[locale] : '';
      const nationality = v.nationality[locale];
      const nationality_ = v.nationality_?.[locale]
        ? v.nationality_[locale]
        : '';
      const istat = v.istat;
      const flag = Methods.getFlag(code);
      const item: CountryWithIdAndFlag = {
        id: code,
        code,
        name,
        nationality,
        phonePrefixes: v.phonePrefixes,
        flag,
      };
      if (name_) {
        item.name_ = name_;
      }
      if (nationality_) {
        item.nationality_ = nationality_;
      }
      if (istat) {
        item.istat = istat;
      }
      countries.push(item);
    }
    return countries;
  }

  /**
   * Checks if the given locale uses a 24-hour time format.
   *
   * @param locale The locale to check.
   */
  static is24hFormat(locale: string) {
    const formatter = new Intl.DateTimeFormat(locale, { hour: 'numeric' });
    const result = formatter.format(new Date());
    return result.includes('AM') || result.includes('PM') ? false : true;
  }
}
