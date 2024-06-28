import { FiscalCode } from '@zxd/interfaces/fiscal-code.interface';
import { Methods } from '@zxd/util/methods';

describe('methods.ts', () => {
  describe('- isFiscalCodeValid', () => {
    it('a right fiscalCode should be valid', () => {
      const fiscalCode = 'RSSMRA98T29F206T';
      const valid = Methods.isFiscalCodeValid(fiscalCode);
      expect(valid).toBeTruthy();
    });

    it('a fiscalCode with wrong length should not be valid', () => {
      const fiscalCode = 'RSSMRA98T29F206';
      const valid = Methods.isFiscalCodeValid(fiscalCode);
      expect(valid).toBeFalsy();
    });
  });

  describe('- parseFiscalCode', () => {
    it('a fiscalCode with wrong last digit should not be valid', () => {
      const fiscalCode = 'RSSMRA98T29F206G';
      const result: FiscalCode = Methods.parseFiscalCode(fiscalCode);
      expect(result.lastChar).toBe('T');
    });

    it('should retrieve data from fiscalCode RSSMRA98T29F206T', () => {
      const fiscalCode = 'RSSMRA98T29F206T';
      const result: FiscalCode = Methods.parseFiscalCode(fiscalCode);
      expect(result.sex).toBe('M');
      expect(result.countryCode).toBe('IT');
      expect(result.provinceCode).toBe('ME');
      expect(result.year).toBe(1998);
      expect(result.month).toBe(12);
      expect(result.day).toBe(29);
    });

    it('should retrieve data from fiscalCode VRDMRP92L65G087R', () => {
      const fiscalCode = 'VRDMRP92L65G087R';
      const result: FiscalCode = Methods.parseFiscalCode(fiscalCode);
      expect(result.sex).toBe('F');
      expect(result.countryCode).toBe('IT');
      expect(result.provinceCode).toBe('TO');
      expect(result.year).toBe(1992);
      expect(result.month).toBe(7);
      expect(result.day).toBe(25);
    });
  });

  describe('- getItalianPluralArticle', () => {
    const random = Math.ceil(Math.random() * 100);
    it('gli 11 M', () => {
      const a = 11;
      const article = Methods.getItalianPluralArticle(a, 'M');
      expect(article).toBe('gli');
    });

    it('gli 85 M', () => {
      const a = 85;
      const article = Methods.getItalianPluralArticle(a, 'M');
      expect(article).toBe('gli');
    });

    it('i 45 M', () => {
      const a = 45;
      const article = Methods.getItalianPluralArticle(a, 'M');
      expect(article).toBe('i');
    });

    it(`le ${ random } F`, () => {
      const article = Methods.getItalianPluralArticle(random, 'F');
      expect(article).toBe('le');
    });
  });

  describe('- replaceDiacritics', () => {
    it('replacing diacritics in "àáâãèéêếìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ" should return simple vowels (aaaaeeeeiioooouuadiuouaaaaaaaaaaaaaeeeeeeeeiioooooooooooouuuuuuuyyyy)', () => {
      const text = 'àáâãèéêếìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ';
      const replaced = Methods.replaceDiacritics(text);
      expect(replaced).toBe('aaaaeeeeiioooouuadiuouaaaaaaaaaaaaaeeeeeeeeiioooooooooooouuuuuuuyyyy');
    });

    it('replacing diacritics in "ç" should return c', () => {
      const text = 'ç';
      const replaced = Methods.replaceDiacritics(text);
      expect(replaced).toBe('c');
    });

  });

  describe('- formatLocaleNumber', () => {
    it('should format 123456.789 to "123456,79" in Italian with 2 fraction digits and without thousand separator', () => {
      const formatted = Methods.formatLocaleNumber(123456.789, 'it-IT', 2, 2);
      expect(formatted).toBe('123456,79');
    });

    it('should format 123456.789 to "123.456,79" in Italian with 2 fraction digits and with thousand separator', () => {
      const formatted = Methods.formatLocaleNumber(123456.789, 'it-IT', 2, 2, true);
      expect(formatted).toBe('123.456,79');
    });

    it('should format 123456.789 to "123456,7890" in Italian with 4 fraction digits and without thousand separator', () => {
      const formatted = Methods.formatLocaleNumber(123456.789, 'it-IT', 4, 4);
      expect(formatted).toBe('123456,7890');
    });

    it('should format 123456.789 to "123456.79" in English with 2 fraction digits and without thousand separator', () => {
      const formatted = Methods.formatLocaleNumber(123456.789, 'en-US', 2, 2);
      expect(formatted).toBe('123456.79');
    });

    it('should format 123456.789 to "123,456.79" in English with 2 fraction digits and with thousand separator', () => {
      const formatted = Methods.formatLocaleNumber(123456.789, 'en-US', 2, 2, true);
      expect(formatted).toBe('123,456.79');
    });
  });

  describe('- formatCurrency', () => {
    it('should format 123456.789 to "123.456,79 €" in Italian currency with thousand separator', () => {
      // warning: normalize('NFKD') is needed to convert the non-breaking space to a normal space
      // otherwise the test will fail
      const formatted = Methods.formatCurrency(123456.789, 'it-IT', 'EUR').normalize('NFKD');
      expect(formatted).toBe('123.456,79 €');
    });

    it('should format 123456.789 to "123.456,79" € in Italian currency without thousand separator', () => {
      // warning: normalize('NFKD') is needed to convert the non-breaking space to a normal space
      // otherwise the test will fail
      const formatted = Methods.formatCurrency(123456.789, 'it-IT', 'EUR', false).normalize('NFKD');
      expect(formatted).toBe('123456,79 €');
    });

    it('should format 123456.789 to "$123,456.79" in American currency with thousand separator', () => {
      const formatted = Methods.formatCurrency(123456.789, 'en-US', 'USD');
      expect(formatted).toBe('$123,456.79');
    });
  });

});
