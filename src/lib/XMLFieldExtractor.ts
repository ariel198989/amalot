import { XMLParser } from 'fast-xml-parser';

export interface HeshbonOPolisa {
  'MISPAR-POLISA-O-HESHBON': string;
  'SUG-KUPA': string;
  'SUG-MUTZAR': string;
  'SUG-TOCHNIT-O-CHESHBON': string;
  'SHEM-TOCHNIT': string;
  'STATUS-POLISA-O-CHESHBON': string;
  'TOTAL-HAFKADA'?: number;
  'SCHUM-HAFRASHA'?: number;
  'TOTAL-CHISACHON-MTZBR'?: number;
  'SHEUR-DMEI-NIHUL'?: number;
  'TOTAL-DMEI-NIHUL-HAFKADA'?: number;
  'ALUT-KISUI'?: number;
  'SHEUR-KISUY-NECHUT'?: number;
  'TAARICH-TCHILAT-HABITUACH'?: string;
  'TSUA-NETO'?: number;
  'REVACH-HEFSED-BENIKOI-HOZAHOT'?: number;
  'YITRAT-KASPEY-TAGMULIM'?: number;
  'KITZVAT-HODSHIT-TZFUYA'?: number;
  'GIL-PRISHA'?: number;
  'SCHUM-KITZVAT-ZIKNA'?: number;
}

export interface PirteiMutzar {
  'SUG-MUTZAR': string;
  'SHEM-MUTZAR': string;
  'MISPAR-POLISA'?: string;
  'TAARICH-TCHILAT-BITTUACH'?: string;
  'TAARICH-TSHURA'?: string;
  'SCHUM-TZURA'?: number;
  'SCHUM-HAFKADA-CHODSHI'?: number;
  'ACHUZ-HAFKADA-OVED'?: number;
  'ACHUZ-HAFKADA-MAASIK'?: number;
  'ACHUZ-HAFKADA-PITZUIM'?: number;
  'TAARICH-HAFKADA-ACHRONA'?: string;
  'SCHUM-TZAVUR'?: number;
  'STATUS-POLISA'?: '1' | '2' | '3';
}

export interface YeshutLakoach {
  'SHEM-PRATI': string;
  'SHEM-MISHPACHA': string;
  'MISPAR-ZIHUY': string;
  'MISPAR-ZIHUY-LAKOACH': string;
  'SHEM-MISHPACHA-KODEM'?: {
    '@_xmlns:xsi'?: string;
    '@_xsi:nil'?: boolean;
  };
  'TAARICH-LEYDA': string;
  'MISPAR-CELLULARI'?: string;
  'E-MAIL'?: string;
  'ERETZ': string;
  'SHEM-YISHUV': string;
  'SHEM-RECHOV': string;
  'MISPAR-BAIT': string;
  'MIKUD': string;
  'SUG-MEZAHE-LAKOACH': number;
}

export interface YeshutMaasik {
  'SHEM-MAASIK': string;
  'MISPAR-MEZAHE-MAASIK': string;
  'STATUS-MAASIK': '1' | '2' | '3';
  'MPR-MAASIK-BE-YATZRAN': string;
  IshKesherYeshutMaasik?: {
    'SHEM-PRATI': string;
    'SHEM-MISHPACHA': string;
    'MISPAR-TELEPHONE-KAVI'?: string;
    'MISPAR-CELLULARI'?: string;
    'E-MAIL'?: string;
  };
}

export interface MutzarPensioni {
  'MISPAR-POLISA-O-HESHBON': string;
  'SUG-KUPA': string;
  'SUG-MUTZAR': string;
  'SUG-TOCHNIT-O-CHESHBON': string;
  'SHEM-TOCHNIT': string;
  'STATUS-POLISA-O-CHESHBON': string;
  'TOTAL-HAFKADA'?: number;
  'SCHUM-HAFRASHA'?: number;
  'TOTAL-CHISACHON-MTZBR'?: number;
  'SHEUR-DMEI-NIHUL'?: number;
  'TOTAL-DMEI-NIHUL-HAFKADA'?: number;
  'ALUT-KISUI'?: number;
  'SHEUR-KISUY-NECHUT'?: number;
  'TAARICH-TCHILAT-HABITUACH'?: string;
  'TSUA-NETO'?: number;
  'REVACH-HEFSED-BENIKOI-HOZAHOT'?: number;
  'YITRAT-KASPEY-TAGMULIM'?: number;
  'KITZVAT-HODSHIT-TZFUYA'?: number;
  'GIL-PRISHA'?: number;
  'SCHUM-KITZVAT-ZIKNA'?: number;
}

export interface KupatGemel {
  'MISPAR-POLISA-O-HESHBON': string;
  'SUG-KUPA': string;
  'SUG-MUTZAR': string;
  'SUG-TOCHNIT-O-CHESHBON': string;
  'SHEM-TOCHNIT': string;
  'STATUS-POLISA-O-CHESHBON': string;
  'TOTAL-HAFKADA'?: number;
  'SCHUM-HAFRASHA'?: number;
  'TOTAL-CHISACHON-MTZBR'?: number;
  'SHEUR-DMEI-NIHUL'?: number;
  'TOTAL-DMEI-NIHUL-HAFKADA'?: number;
  'ALUT-KISUI'?: number;
  'SHEUR-KISUY-NECHUT'?: number;
  'TAARICH-TCHILAT-HABITUACH'?: string;
  'TSUA-NETO'?: number;
  'REVACH-HEFSED-BENIKOI-HOZAHOT'?: number;
  'YITRAT-KASPEY-TAGMULIM'?: number;
  'KITZVAT-HODSHIT-TZFUYA'?: number;
  'GIL-PRISHA'?: number;
  'SCHUM-KITZVAT-ZIKNA'?: number;
}

export interface PolisatMenahalim {
  'MISPAR-POLISA-O-HESHBON': string;
  'SUG-KUPA': string;
  'SUG-MUTZAR': string;
  'SUG-TOCHNIT-O-CHESHBON': string;
  'SHEM-TOCHNIT': string;
  'STATUS-POLISA-O-CHESHBON': string;
  'TOTAL-HAFKADA'?: number;
  'SCHUM-HAFRASHA'?: number;
  'TOTAL-CHISACHON-MTZBR'?: number;
  'SHEUR-DMEI-NIHUL'?: number;
  'TOTAL-DMEI-NIHUL-HAFKADA'?: number;
  'ALUT-KISUI'?: number;
  'SHEUR-KISUY-NECHUT'?: number;
  'TAARICH-TCHILAT-HABITUACH'?: string;
  'TSUA-NETO'?: number;
  'REVACH-HEFSED-BENIKOI-HOZAHOT'?: number;
  'YITRAT-KASPEY-TAGMULIM'?: number;
  'KITZVAT-HODSHIT-TZFUYA'?: number;
  'GIL-PRISHA'?: number;
  'SCHUM-KITZVAT-ZIKNA'?: number;
}

export interface NetuneiMutzar {
  YeshutLakoach: YeshutLakoach;
  YeshutMaasik: YeshutMaasik;
  HeshbonotOPolisot?: {
    HeshbonOPolisa: HeshbonOPolisa | HeshbonOPolisa[];
  };
}

export class XMLFieldExtractor {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
    });
  }

  validateId(id: string | number | undefined): boolean {
    if (!id) {
      console.log('ID is undefined');
      return false;
    }

    // Convert to string if number
    let idStr = id.toString();
    
    // Clean the ID from any non-digit characters
    const cleanId = idStr.replace(/\D/g, '');
    
    // Handle 7-digit IDs by padding with zeros
    if (cleanId.length === 7) {
      idStr = '00' + cleanId;
      console.log('Added leading zeros to 7-digit ID:', idStr);
    } else if (cleanId.length === 8) {
      idStr = '0' + cleanId;
      console.log('Added leading zero to 8-digit ID:', idStr);
    } else if (cleanId.length !== 9) {
      console.log('ID length is not 7, 8, or 9:', cleanId.length);
      return false;
    }

    // Calculate checksum
    const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1];
    let sum = 0;

    // Calculate weighted sum
    for (let i = 0; i < 9; i++) {
      let digit = parseInt(idStr.charAt(i)) * weights[i];
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
      sum += digit;
    }

    return sum % 10 === 0;
  }

  validateDate(date: string | number | undefined): boolean {
    if (!date) {
      console.log('Date is undefined');
      return false;
    }

    // המר למחרוזת אם מגיע כמספר
    const dateStr = date.toString();
    
    // בדוק פורמט תאריך תקין
    if (!/^\d{8}$/.test(dateStr)) {
      console.log('Invalid date format:', dateStr);
      return false;
    }

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));
    
    // בדוק טווח תאריכים הגיוני
    if (year < 1900 || year > new Date().getFullYear()) {
      console.log('Invalid year:', year);
      return false;
    }

    const d = new Date(year, month - 1, day);
    const isValid = d.getFullYear() === year && 
                   d.getMonth() === month - 1 && 
                   d.getDate() === day;

    if (!isValid) {
      console.log('Invalid date components:', { year, month, day });
    }

    return isValid;
  }

  private isNilValue(value: any): boolean {
    return value && typeof value === 'object' && 
           ('@_xmlns:xsi' in value || '@_xsi:nil' in value);
  }

  private extractValue(value: any): any {
    if (this.isNilValue(value)) {
      return null;
    }
    if (value && typeof value === 'object') {
      // If it's an object but not a nil value, try to get its actual value
      const objValues = Object.values(value).filter(v => !this.isNilValue(v));
      return objValues.length > 0 ? objValues[0] : null;
    }
    return value;
  }

  extractFieldsFromXml(xmlContent: string) {
    try {
      const data = this.parser.parse(xmlContent);
      
      // Handle array of YeshutYatzran
      const yeshutYatzran = Array.isArray(data.Mimshak?.YeshutYatzran) 
        ? data.Mimshak.YeshutYatzran[0] 
        : data.Mimshak?.YeshutYatzran;

      console.log('Full XML structure:', JSON.stringify(data, null, 2));
      console.log('YeshutYatzran structure:', JSON.stringify(yeshutYatzran, null, 2));

      // Get all Mutzar entries
      const mutzarim = yeshutYatzran?.Mutzarim?.Mutzar;
      const mutzarArray = Array.isArray(mutzarim) ? mutzarim : [mutzarim];

      // Extract data from each Mutzar
      const allProducts = [];
      const allNetuneiMutzar = [];

      for (const mutzar of mutzarArray) {
        console.log('Processing Mutzar:', JSON.stringify(mutzar, null, 2));
        
        if (mutzar?.NetuneiMutzar) {
          allNetuneiMutzar.push(mutzar.NetuneiMutzar);
          
          // Try to find products in all possible locations
          const possibleLocations = [
            {
              path: 'HeshbonotOPolisot.HeshbonOPolisa',
              data: mutzar.NetuneiMutzar.HeshbonotOPolisot?.HeshbonOPolisa
            },
            {
              path: 'PirteiMutzar',
              data: mutzar.NetuneiMutzar.PirteiMutzar
            },
            {
              path: 'Mutzar.PirteiMutzar',
              data: mutzar.PirteiMutzar
            },
            {
              path: 'Mutzar.HeshbonotOPolisot.HeshbonOPolisa',
              data: mutzar.HeshbonotOPolisot?.HeshbonOPolisa
            },
            {
              path: 'NetuneiCheshbon',
              data: mutzar.NetuneiMutzar.NetuneiCheshbon
            },
            {
              path: 'PirteiPolisa',
              data: mutzar.NetuneiMutzar.PirteiPolisa
            }
          ];

          for (const location of possibleLocations) {
            if (location.data) {
              console.log(`Found products in ${location.path}:`, location.data);
              const products = Array.isArray(location.data) ? location.data : [location.data];
              
              // Map each product to our standardized format
              const mappedProducts = products.map(product => {
                // Extract financial data from all possible paths
                const financialData = {
                  ...product,
                  ...product.NetuneiCheshbon,
                  ...product.PirteiPolisa,
                  ...product.NetuneiPolisa,
                  ...product.YitraOTnua,
                  ...product.PirteiTochnit,
                  ...product.NetuneiTochnit
                };

                // Clean up nil values and extract actual values from objects
                const cleanData = Object.entries(financialData).reduce((acc, [key, value]) => {
                  acc[key] = this.extractValue(value);
                  return acc;
                }, {} as Record<string, any>);

                return {
                  'MISPAR-POLISA-O-HESHBON': cleanData['MISPAR-POLISA-O-HESHBON'] || cleanData['MISPAR-POLISA'] || cleanData['MISPAR-CHESHBON'] || '',
                  'SUG-KUPA': cleanData['SUG-KUPA'] || mutzar.NetuneiMutzar['SUG-KUPA'] || '',
                  'SUG-MUTZAR': cleanData['SUG-MUTZAR'] || mutzar.NetuneiMutzar['SUG-MUTZAR'] || '',
                  'SUG-TOCHNIT-O-CHESHBON': cleanData['SUG-TOCHNIT-O-CHESHBON'] || cleanData['SUG-TOCHNIT'] || '',
                  'SHEM-TOCHNIT': cleanData['SHEM-TOCHNIT'] || '',
                  'STATUS-POLISA-O-CHESHBON': cleanData['STATUS-POLISA-O-CHESHBON'] || cleanData['STATUS-POLISA'] || cleanData['STATUS-CHESHBON'] || '',
                  'TOTAL-HAFKADA': this.extractNumber(cleanData['TOTAL-HAFKADA']) || this.extractNumber(cleanData['SCHUM-HAFKADA-CHODSHI']) || this.extractNumber(cleanData['SCHUM-HAFKADA']) || 0,
                  'SCHUM-HAFRASHA': this.extractNumber(cleanData['SCHUM-HAFRASHA']) || 0,
                  'TOTAL-CHISACHON-MTZBR': this.extractNumber(cleanData['TOTAL-CHISACHON-MTZBR']) || this.extractNumber(cleanData['SCHUM-TZAVUR']) || this.extractNumber(cleanData['YITRA-TZVURA']) || 0,
                  'SHEUR-DMEI-NIHUL': this.extractNumber(cleanData['SHEUR-DMEI-NIHUL']) || this.extractNumber(cleanData['DMEI-NIHUL-NECHASIM']) || 0,
                  'TOTAL-DMEI-NIHUL-HAFKADA': this.extractNumber(cleanData['TOTAL-DMEI-NIHUL-HAFKADA']) || this.extractNumber(cleanData['DMEI-NIHUL-HAFKADOT']) || 0,
                  'ALUT-KISUI': this.extractNumber(cleanData['ALUT-KISUI']) || this.extractNumber(cleanData['ALUT-KISUI-BITUCHI']) || 0,
                  'SHEUR-KISUY-NECHUT': this.extractNumber(cleanData['SHEUR-KISUY-NECHUT']) || this.extractNumber(cleanData['ACHUZ-KISUI-OVDAN-KOSHER-AVODA']) || 0,
                  'TAARICH-TCHILAT-HABITUACH': cleanData['TAARICH-TCHILAT-HABITUACH'] || cleanData['TAARICH-TCHILAT-BITTUACH'] || cleanData['TAARICH-TCHILA'] || '',
                  'TSUA-NETO': this.extractNumber(cleanData['TSUA-NETO']) || this.extractNumber(cleanData['TSUA-SHNATI']) || 0,
                  'REVACH-HEFSED-BENIKOI-HOZAHOT': this.extractNumber(cleanData['REVACH-HEFSED-BENIKOI-HOZAHOT']) || 0,
                  'YITRAT-KASPEY-TAGMULIM': this.extractNumber(cleanData['YITRAT-KASPEY-TAGMULIM']) || this.extractNumber(cleanData['YITRAT-TAGMULIM']) || 0,
                  'KITZVAT-HODSHIT-TZFUYA': this.extractNumber(cleanData['KITZVAT-HODSHIT-TZFUYA']) || this.extractNumber(cleanData['KITZVA-TZFUYA']) || 0,
                  'GIL-PRISHA': this.extractNumber(cleanData['GIL-PRISHA']) || 0,
                  'SCHUM-KITZVAT-ZIKNA': this.extractNumber(cleanData['SCHUM-KITZVAT-ZIKNA']) || this.extractNumber(cleanData['KITZVA-ZIKNA']) || 0
                };
              });

              allProducts.push(...mappedProducts);
            }
          }
        }
      }

      // Use the first NetuneiMutzar for client and employer info
      const netuneiMutzar = allNetuneiMutzar[0];

      if (!netuneiMutzar) {
        console.log('Missing NetuneiMutzar data');
        throw new Error('MISSING_REQUIRED: NetuneiMutzar not found');
      }

      const yeshutLakoach = netuneiMutzar.YeshutLakoach;
      const yeshutMaasik = netuneiMutzar.YeshutMaasik;

      if (!yeshutLakoach || !yeshutMaasik) {
        console.log('Missing data:', { yeshutLakoach, yeshutMaasik });
        throw new Error('MISSING_REQUIRED: Required sections not found');
      }

      // Clean up nil values in YeshutLakoach
      const cleanLakoach = Object.entries(yeshutLakoach).reduce((acc, [key, value]) => {
        acc[key] = this.extractValue(value);
        return acc;
      }, {} as Record<string, any>);

      // Clean up nil values in YeshutMaasik
      const cleanMaasik = Object.entries(yeshutMaasik).reduce((acc, [key, value]) => {
        acc[key] = this.extractValue(value);
        return acc;
      }, {} as Record<string, any>);

      console.log('YeshutLakoach full data:', cleanLakoach);
      console.log('Found pension products:', allProducts);
      
      const idNumber = cleanLakoach['MISPAR-ZIHUY-LAKOACH'];
      console.log('Validating ID:', idNumber);

      if (!this.validateId(idNumber)) {
        throw new Error(`INVALID_ID: ${idNumber} (length: ${idNumber?.toString().length})`);
      }

      if (!this.validateDate(cleanLakoach['TAARICH-LEYDA'])) {
        throw new Error('INVALID_DATE');
      }

      const result = {
        lakoach: {
          ...cleanLakoach,
          'MISPAR-ZIHUY': idNumber
        } as YeshutLakoach,
        maasik: cleanMaasik as YeshutMaasik,
        mutzarim: allProducts
      };

      const report = this.createMarkdownReport(result.lakoach, result.maasik, result.mutzarim);
      
      return {
        data: result,
        report
      };

    } catch (error) {
      console.error('Error in extractFieldsFromXml:', error);
      throw error;
    }
  }

  private extractNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? 0 : num;
    }
    if (value && typeof value === 'object' && !('@_xmlns:xsi' in value)) {
      return this.extractNumber(Object.values(value)[0]);
    }
    return 0;
  }

  createMarkdownReport(lakoach: YeshutLakoach, maasik: YeshutMaasik, mutzarim: (HeshbonOPolisa | MutzarPensioni | KupatGemel | PolisatMenahalim)[]): string {
    try {
      let report = `# דוח מסלקה\n\n## פרטי לקוח
- שם מלא: ${lakoach['SHEM-PRATI'] || ''} ${lakoach['SHEM-MISHPACHA'] || ''}
- מספר זהות: ${lakoach['MISPAR-ZIHUY'] || lakoach['MISPAR-ZIHUY-LAKOACH'] || ''}
- תאריך לידה: ${lakoach['TAARICH-LEYDA'] ? this.formatDate(lakoach['TAARICH-LEYDA']) : 'לא צוין'}
- טלפון נייד: ${lakoach['MISPAR-CELLULARI'] || 'לא צוין'}
- דוא"ל: ${lakoach['E-MAIL'] || 'לא צוין'}
- כתובת: ${[
        lakoach['SHEM-RECHOV'] || '',
        lakoach['MISPAR-BAIT'] || '',
        lakoach['SHEM-YISHUV'] || ''
      ].filter(Boolean).join(', ') || 'לא צוין'}\n\n## פרטי מעסיק
- שם מעסיק: ${maasik['SHEM-MAASIK'] || 'לא צוין'}
- מספר מזהה: ${maasik['MISPAR-MEZAHE-MAASIK'] || 'לא צוין'}
- סטטוס: ${maasik['STATUS-MAASIK'] ? this.getStatusText(maasik['STATUS-MAASIK']) : 'לא צוין'}`;

      if (mutzarim?.length > 0) {
        report += '\n\n## מוצרים פנסיוניים';
        mutzarim.forEach((mutzar, index) => {
          report += `\n\n### מוצר ${index + 1}`;

          // Basic fields that exist in all products
          report += `
- סוג מוצר: ${this.getProductTypeText(mutzar['SUG-MUTZAR'])}
- שם תכנית: ${mutzar['SHEM-TOCHNIT'] || 'לא צוין'}
- סטטוס: ${this.getProductStatusText(mutzar['STATUS-POLISA-O-CHESHBON'])}
- תאריך תחילת ביטוח: ${mutzar['TAARICH-TCHILAT-HABITUACH'] ? this.formatDate(mutzar['TAARICH-TCHILAT-HABITUACH']) : 'לא צוין'}
- סה"כ הפקדה: ${mutzar['TOTAL-HAFKADA'] ? this.formatCurrency(mutzar['TOTAL-HAFKADA']) : 'לא צוין'}
- סה"כ חיסכון מצטבר: ${mutzar['TOTAL-CHISACHON-MTZBR'] ? this.formatCurrency(mutzar['TOTAL-CHISACHON-MTZBR']) : 'לא צוין'}
- שיעור דמי ניהול: ${mutzar['SHEUR-DMEI-NIHUL'] ? mutzar['SHEUR-DMEI-NIHUL'] + '%' : 'לא צוין'}
- דמי ניהול מהפקדה: ${mutzar['TOTAL-DMEI-NIHUL-HAFKADA'] ? mutzar['TOTAL-DMEI-NIHUL-HAFKADA'] + '%' : 'לא צוין'}
- עלות כיסוי: ${mutzar['ALUT-KISUI'] ? this.formatCurrency(mutzar['ALUT-KISUI']) : 'לא צוין'}
- שיעור כיסוי נכות: ${mutzar['SHEUR-KISUY-NECHUT'] ? mutzar['SHEUR-KISUY-NECHUT'] + '%' : 'לא צוין'}
- תשואה נטו: ${mutzar['TSUA-NETO'] ? mutzar['TSUA-NETO'] + '%' : 'לא צוין'}
- רווח/הפסד בניכוי הוצאות: ${mutzar['REVACH-HEFSED-BENIKOI-HOZAHOT'] ? this.formatCurrency(mutzar['REVACH-HEFSED-BENIKOI-HOZAHOT']) : 'לא צוין'}
- יתרת כספי תגמולים: ${mutzar['YITRAT-KASPEY-TAGMULIM'] ? this.formatCurrency(mutzar['YITRAT-KASPEY-TAGMULIM']) : 'לא צוין'}
- קצבה חודשית צפויה: ${mutzar['KITZVAT-HODSHIT-TZFUYA'] ? this.formatCurrency(mutzar['KITZVAT-HODSHIT-TZFUYA']) : 'לא צוין'}
- גיל פרישה: ${mutzar['GIL-PRISHA'] || 'לא צוין'}
- סכום קצבת זקנה: ${mutzar['SCHUM-KITZVAT-ZIKNA'] ? this.formatCurrency(mutzar['SCHUM-KITZVAT-ZIKNA']) : 'לא צוין'}
- מספר פוליסה/חשבון: ${mutzar['MISPAR-POLISA-O-HESHBON'] || 'לא צוין'}
- סוג קופה: ${this.getFundTypeText(mutzar['SUG-KUPA'])}`;
        });
      } else {
        report += '\n\n## מוצרים פנסיוניים\nלא נמצאו מוצרים פנסיוניים';
      }

      if (maasik.IshKesherYeshutMaasik) {
        const contacts = Array.isArray(maasik.IshKesherYeshutMaasik) ? 
          maasik.IshKesherYeshutMaasik : [maasik.IshKesherYeshutMaasik];

        contacts.forEach((contact, index) => {
          const contactName = [
            this.extractValue(contact['SHEM-PRATI']) || '',
            this.extractValue(contact['SHEM-MISHPACHA']) || ''
          ].filter(Boolean).join(' ');

          report += `\n\n### איש קשר ${contacts.length > 1 ? (index + 1) : ''}
- שם: ${contactName || 'לא צוין'}
- טלפון: ${this.extractValue(contact['MISPAR-TELEPHONE-KAVI']) || 'לא צוין'}
- נייד: ${this.extractValue(contact['MISPAR-CELLULARI']) || 'לא צוין'}
- דוא"ל: ${this.extractValue(contact['E-MAIL']) || 'לא צוין'}`;
        });
      }

      return report;
    } catch (error) {
      console.error('Error creating markdown report:', error);
      return '# שגיאה ביצירת הדוח';
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  }

  private formatDate(date: string | number): string {
    const dateStr = date.toString();
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}/${month}/${year}`;
  }

  private getStatusText(status: string): string {
    const statuses: Record<string, string> = {
      '1': 'פעיל',
      '2': 'מוקפא',
      '3': 'מבוטל'
    };
    return statuses[status] || 'לא ידוע';
  }

  private getProductTypeText(type: string | undefined): string {
    const types: Record<string, string> = {
      '1': 'ביטוח מנהלים',
      '2': 'קרן פנסיה',
      '3': 'קופת גמל',
      '4': 'קרן השתלמות',
      '5': 'קופת גמל להשקעה',
      '6': 'ביטוח חיים'
    };
    return types[type || ''] || 'לא צוין';
  }

  private getFundTypeText(type: string | undefined): string {
    const types: Record<string, string> = {
      '1': 'קופת גמל',
      '2': 'קרן השתלמות',
      '3': 'קופת גמל להשקעה',
      '4': 'קופת גמל מרכזית לפיצויים',
      '5': 'קרן פנסיה ותיקה',
      '6': 'קרן פנסיה חדשה מקיפה',
      '7': 'קרן פנסיה חדשה כללית'
    };
    return types[type || ''] || 'לא צוין';
  }

  private getProductStatusText(status: string | undefined): string {
    const statuses: Record<string, string> = {
      '1': 'פעיל',
      '2': 'מוקפא',
      '3': 'מבוטל',
      '4': 'משיכה חלקית',
      '5': 'משיכה מלאה',
      '6': 'ניוד יוצא',
      '7': 'בתהליך ניוד',
      '8': 'מעוכב'
    };
    return statuses[status || ''] || 'לא צוין';
  }

  extractClientData(data: { lakoach: YeshutLakoach; maasik: YeshutMaasik; mutzarim: HeshbonOPolisa[] }) {
    const { lakoach, mutzarim } = data;
    return {
      id: this.extractValue(lakoach['MISPAR-ZIHUY']) || this.extractValue(lakoach['MISPAR-ZIHUY-LAKOACH']),
      firstName: this.extractValue(lakoach['SHEM-PRATI']),
      lastName: this.extractValue(lakoach['SHEM-MISHPACHA']),
      email: this.extractValue(lakoach['E-MAIL']),
      phone: this.extractValue(lakoach['MISPAR-CELLULARI']),
      address: [
        this.extractValue(lakoach['SHEM-RECHOV']),
        this.extractValue(lakoach['MISPAR-BAIT']),
        this.extractValue(lakoach['SHEM-YISHUV'])
      ].filter(Boolean).join(', '),
      products: mutzarim?.length ? mutzarim.map(mutzar => ({
        type: this.extractValue(mutzar['SUG-MUTZAR']),
        name: this.extractValue(mutzar['SHEM-TOCHNIT']),
        policyNumber: this.extractValue(mutzar['MISPAR-POLISA-O-HESHBON']),
        startDate: this.extractValue(mutzar['TAARICH-TCHILAT-HABITUACH']),
        balance: this.extractNumber(mutzar['TOTAL-CHISACHON-MTZBR']),
        monthlyDeposit: this.extractNumber(mutzar['TOTAL-HAFKADA']),
        status: this.extractValue(mutzar['STATUS-POLISA-O-CHESHBON'])
      })) : []
    };
  }
} 