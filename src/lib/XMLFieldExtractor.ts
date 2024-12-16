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

  private extractValue(value: any): string {
    if (!value) return '';

    // If it's a string, return it
    if (typeof value === 'string') return value;

    // If it's a number, convert to string
    if (typeof value === 'number') return value.toString();

    // If it's an object with a text value
    if (typeof value === 'object' && value !== null) {
      // Check for nil value
      if (value['@_xsi:nil'] === 'true') return '';

      // Try to get the text value
      return value['#text'] || value['@_value'] || value.toString() || '';
    }

    return '';
  }

  private findFinancialDataInProduct(product: any): any[] {
    const financialContainers = [];
    
    // Recursive function to find financial data containers
    const findContainers = (obj: any, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      // Check if this object has any financial data fields
      const financialFields = [
        // סכומים
        'TOTAL-HAFKADA', 'SCHUM-HAFRASHA', 'TOTAL-CHISACHON-MTZBR',
        'SCHUM-HAFKADA-CHODSHI', 'SCHUM-TZAVUR', 'YITRA-TZVURA',
        'YITRAT-KASPEY-TAGMULIM', 'YITRAT-TAGMULIM',
        'SCHUM-KITZVAT-ZIKNA', 'KITZVA-ZIKNA',
        'KITZVAT-HODSHIT-TZFUYA', 'KITZVA-TZFUYA',
        'SCHUM-HAFKADA', 'SCHUM-CHISACHON',
        'YITRA-TZVURA-LEFI-MISIM', 'YITRA-TZVURA-LIFNEI-MISIM',
        'SCHUM-HAFKADA-KOLEL', 'SCHUM-HAFKADA-OVED',
        'SCHUM-HAFKADA-MAASIK', 'SCHUM-HAFKADA-PITZUIM',

        // דמי ניהול
        'SHEUR-DMEI-NIHUL', 'TOTAL-DMEI-NIHUL-HAFKADA',
        'DMEI-NIHUL-NECHASIM', 'DMEI-NIHUL-HAFKADOT',
        'DMEI-NIHUL-KOLEL', 'DMEI-NIHUL-NECHASIM-BEPOEL',
        'DMEI-NIHUL-HAFKADOT-BEPOEL',

        // תשואות
        'TSUA-NETO', 'TSUA-SHNATI',
        'TSUA-NOMINALI', 'TSUA-REALI',
        'TSUA-MEMUZAAT', 'TSUA-MITZTABERET',

        // ביטוחים
        'ALUT-KISUI', 'ALUT-KISUI-BITUCHI',
        'SHEUR-KISUY-NECHUT', 'ACHUZ-KISUI-OVDAN-KOSHER-AVODA',
        'ALUT-KISUI-MAVET', 'ALUT-KISUI-OVDAN-KOSHER-AVODA',

        // אחוזי הפקדה
        'ACHUZ-HAFKADA-OVED', 'ACHUZ-HAFKADA-MAASIK',
        'ACHUZ-HAFKADA-PITZUIM',

        // רווח והפסד
        'REVACH-HEFSED-BENIKOI-HOZAHOT',
        'REVACH-HEFSED-SHKALI', 'REVACH-HEFSED-MADAD',
        'REVACH-HEFSED-MATACH'
      ];

      const foundFields = financialFields.filter(field => field in obj);
      if (foundFields.length > 0) {
        console.log(`Found financial data at ${path}:`, 
          foundFields.reduce((acc, field) => {
            acc[field] = obj[field];
            return acc;
          }, {}));
        financialContainers.push(obj);
      }

      // Recursively search in all object properties
      Object.entries(obj).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !('@_xmlns:xsi' in value)) {
          findContainers(value, path ? `${path}.${key}` : key);
        }
      });
    };

    findContainers(product);
    return financialContainers;
  }

  private extractFinancialData(product: any): any {
    console.log('Extracting financial data from product:', product);
    
    // Get all possible financial data containers
    const containers = this.findFinancialDataInProduct(product);
    console.log('Found financial data containers:', containers);

    // Initialize with default values
    const financialData = {
      // סכומים
      'TOTAL-HAFKADA': 0,
      'SCHUM-HAFRASHA': 0,
      'TOTAL-CHISACHON-MTZBR': 0,
      'YITRAT-KASPEY-TAGMULIM': 0,
      'KITZVAT-HODSHIT-TZFUYA': 0,
      'SCHUM-KITZVAT-ZIKNA': 0,

      // דמי ניהול
      'SHEUR-DMEI-NIHUL': 0,
      'TOTAL-DMEI-NIHUL-HAFKADA': 0,
      'DMEI-NIHUL-KOLEL': 0,

      // תש��אות
      'TSUA-NETO': 0,
      'TSUA-NOMINALI': 0,
      'TSUA-REALI': 0,
      'TSUA-MEMUZAAT': 0,
      'TSUA-MITZTABERET': 0,

      // ביטוחים
      'ALUT-KISUI': 0,
      'SHEUR-KISUY-NECHUT': 0,

      // אחוזי הפקדה
      'ACHUZ-HAFKADA-OVED': 0,
      'ACHUZ-HAFKADA-MAASIK': 0,
      'ACHUZ-HAFKADA-PITZUIM': 0,

      // רווח והפסד
      'REVACH-HEFSED-BENIKOI-HOZAHOT': 0
    };

    // Search for financial data in all containers
    for (const container of containers) {
      for (const [key, value] of Object.entries(container)) {
        // Map alternative field names to standard ones
        const mappings: { [key: string]: string } = {
          // סכומים
          'SCHUM-HAFKADA-CHODSHI': 'TOTAL-HAFKADA',
          'SCHUM-HAFKADA': 'TOTAL-HAFKADA',
          'SCHUM-TZAVUR': 'TOTAL-CHISACHON-MTZBR',
          'YITRA-TZVURA': 'TOTAL-CHISACHON-MTZBR',
          'YITRA-TZVURA-LEFI-MISIM': 'TOTAL-CHISACHON-MTZBR',
          'YITRA-TZVURA-LIFNEI-MISIM': 'TOTAL-CHISACHON-MTZBR',
          'SCHUM-CHISACHON': 'TOTAL-CHISACHON-MTZBR',
          'YITRAT-TAGMULIM': 'YITRAT-KASPEY-TAGMULIM',
          'KITZVA-TZFUYA': 'KITZVAT-HODSHIT-TZFUYA',
          'KITZVA-ZIKNA': 'SCHUM-KITZVAT-ZIKNA',

          // דמי ניהול
          'DMEI-NIHUL-NECHASIM': 'SHEUR-DMEI-NIHUL',
          'DMEI-NIHUL-HAFKADOT': 'TOTAL-DMEI-NIHUL-HAFKADA',
          'DMEI-NIHUL-NECHASIM-BEPOEL': 'SHEUR-DMEI-NIHUL',
          'DMEI-NIHUL-HAFKADOT-BEPOEL': 'TOTAL-DMEI-NIHUL-HAFKADA',

          // תשואות
          'TSUA-SHNATI': 'TSUA-NETO',

          // ביטוחים
          'ALUT-KISUI-BITUCHI': 'ALUT-KISUI',
          'ACHUZ-KISUI-OVDAN-KOSHER-AVODA': 'SHEUR-KISUY-NECHUT',
          'ALUT-KISUI-MAVET': 'ALUT-KISUI',
          'ALUT-KISUI-OVDAN-KOSHER-AVODA': 'ALUT-KISUI'
        };

        const standardKey = mappings[key] || key;
        if (standardKey in financialData) {
          const extractedValue = this.extractNumber(value);
          if (extractedValue > 0) { // Only update if we found a positive value
            console.log(`Found value for ${standardKey}:`, extractedValue, 'from original key:', key);
            financialData[standardKey] = extractedValue;
          }
        }
      }
    }

    console.log('Final financial data:', financialData);
    return financialData;
  }

  private extractProductData(product: any): any {
    // Extract basic product data
    const basicData = {
      'MISPAR-POLISA-O-HESHBON': this.extractValue(product['MISPAR-POLISA-O-HESHBON']) || 
                                 this.extractValue(product['MISPAR-POLISA']) || 
                                 this.extractValue(product['MISPAR-CHESHBON']) || '',
      'SUG-KUPA': this.extractValue(product['SUG-KUPA']) || '',
      'SUG-MUTZAR': this.extractValue(product['SUG-MUTZAR']) || '',
      'SUG-TOCHNIT-O-CHESHBON': this.extractValue(product['SUG-TOCHNIT-O-CHESHBON']) || 
                                this.extractValue(product['SUG-TOCHNIT']) || '',
      'SHEM-TOCHNIT': this.extractValue(product['SHEM-TOCHNIT']) || '',
      'STATUS-POLISA-O-CHESHBON': this.extractValue(product['STATUS-POLISA-O-CHESHBON']) || 
                                  this.extractValue(product['STATUS-POLISA']) || 
                                  this.extractValue(product['STATUS-CHESHBON']) || '',
      'TAARICH-TCHILAT-HABITUACH': this.extractValue(product['TAARICH-TCHILAT-HABITUACH']) || 
                                   this.extractValue(product['TAARICH-TCHILAT-BITTUACH']) || 
                                   this.extractValue(product['TAARICH-TCHILA']) || ''
    };

    // Get financial data
    const financialData = this.extractFinancialData(product);

    return {
      ...basicData,
      ...financialData
    };
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
                return this.extractProductData(product);
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
    if (!value) return 0;

    // If it's already a number, return it
    if (typeof value === 'number') return value;

    // If it's a string that can be converted to a number
    if (typeof value === 'string') {
      // Remove any non-numeric characters except decimal point and minus sign
      const cleanValue = value.replace(/[^\d.-]/g, '');
      const num = parseFloat(cleanValue);
      return isNaN(num) ? 0 : num;
    }

    // If it's an object with a text value
    if (typeof value === 'object' && value !== null) {
      // Check for nil value
      if (value['@_xsi:nil'] === 'true') return 0;

      // Try to get the text value
      const textValue = value['#text'] || value['@_value'] || value.toString();
      if (textValue) {
        const cleanValue = textValue.toString().replace(/[^\d.-]/g, '');
        const num = parseFloat(cleanValue);
        return isNaN(num) ? 0 : num;
      }
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

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
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

  private formatProductDetails(mutzar: any): string {
    return `
מספר פוליסה/חשבון: ${mutzar['MISPAR-POLISA-O-HESHBON'] || 'לא צוין'}
סוג קופה: ${mutzar['SUG-KUPA'] || 'לא צוין'}
סוג מוצר: ${mutzar['SUG-MUTZAR'] || 'לא צוין'}
סוג תוכנ��ת: ${mutzar['SUG-TOCHNIT-O-CHESHBON'] || 'לא צוין'}
שם תוכנית: ${mutzar['SHEM-TOCHNIT'] || 'לא צוין'}
סטטוס: ${mutzar['STATUS-POLISA-O-CHESHBON'] || 'לא צוין'}
תאריך תחילת ביטוח: ${mutzar['TAARICH-TCHILAT-HABITUACH'] || 'לא צוין'}

נתונים פיננסיים:
- סכומים:
  * סה"כ הפקדה חודשית: ${mutzar['TOTAL-HAFKADA'] ? this.formatCurrency(mutzar['TOTAL-HAFKADA']) : 'לא צוין'}
  * סה"כ חיסכון מצטבר: ${mutzar['TOTAL-CHISACHON-MTZBR'] ? this.formatCurrency(mutzar['TOTAL-CHISACHON-MTZBR']) : 'לא צוין'}
  * יתרת כספי תגמולים: ${mutzar['YITRAT-KASPEY-TAGMULIM'] ? this.formatCurrency(mutzar['YITRAT-KASPEY-TAGMULIM']) : 'לא צוין'}
  * קצבה חודשית צפויה: ${mutzar['KITZVAT-HODSHIT-TZFUYA'] ? this.formatCurrency(mutzar['KITZVAT-HODSHIT-TZFUYA']) : 'לא צוין'}
  * סכום קצבת זקנה: ${mutzar['SCHUM-KITZVAT-ZIKNA'] ? this.formatCurrency(mutzar['SCHUM-KITZVAT-ZIKNA']) : 'לא צוין'}

- דמי ניהול:
  * דמי ניהול מנכסים: ${mutzar['SHEUR-DMEI-NIHUL'] ? mutzar['SHEUR-DMEI-NIHUL'] + '%' : 'לא צוין'}
  * דמי ניהול מהפקדה: ${mutzar['TOTAL-DMEI-NIHUL-HAFKADA'] ? mutzar['TOTAL-DMEI-NIHUL-HAFKADA'] + '%' : 'לא צוין'}
  * דמי ניהול כול: ${mutzar['DMEI-NIHUL-KOLEL'] ? mutzar['DMEI-NIHUL-KOLEL'] + '%' : 'לא צוין'}

- תשואות:
  * תשואה נטו: ${mutzar['TSUA-NETO'] ? mutzar['TSUA-NETO'] + '%' : 'לא צוין'}
  * תשואה נומינלית: ${mutzar['TSUA-NOMINALI'] ? mutzar['TSUA-NOMINALI'] + '%' : 'לא צוין'}
  * תשואה ריאלית: ${mutzar['TSUA-REALI'] ? mutzar['TSUA-REALI'] + '%' : 'לא צוין'}
  * תשואה ממוצעת: ${mutzar['TSUA-MEMUZAAT'] ? mutzar['TSUA-MEMUZAAT'] + '%' : 'לא צוין'}
  * תשואה מצטברת: ${mutzar['TSUA-MITZTABERET'] ? mutzar['TSUA-MITZTABERET'] + '%' : 'לא צוין'}

- ביטוחים:
  * עלות כיסוי ביטוחי: ${mutzar['ALUT-KISUI'] ? this.formatCurrency(mutzar['ALUT-KISUI']) : 'לא צוין'}
  * שיעור כיסוי נכות: ${mutzar['SHEUR-KISUY-NECHUT'] ? mutzar['SHEUR-KISUY-NECHUT'] + '%' : 'לא צוין'}

- אחוזי הפקדה:
  * אחוז הפקדת עובד: ${mutzar['ACHUZ-HAFKADA-OVED'] ? mutzar['ACHUZ-HAFKADA-OVED'] + '%' : 'לא צוין'}
  * אחוז הפקדת מעסיק: ${mutzar['ACHUZ-HAFKADA-MAASIK'] ? mutzar['ACHUZ-HAFKADA-MAASIK'] + '%' : 'לא צוין'}
  * אחוז הפקדה לפיצויים: ${mutzar['ACHUZ-HAFKADA-PITZUIM'] ? mutzar['ACHUZ-HAFKADA-PITZUIM'] + '%' : 'לא צוין'}

- רווח והפסד:
  * רווח/הפסד בניכוי הוצאות: ${mutzar['REVACH-HEFSED-BENIKOI-HOZAHOT'] ? this.formatCurrency(mutzar['REVACH-HEFSED-BENIKOI-HOZAHOT']) : 'לא צוין'}
`;
  }

  private isPensionProduct(product: any): boolean {
    return (
      product?.SUG_MUTZAR === 2 || // קוד מוצר פנסיה
      product?.SUG_KEREN_PENSIA || // קיום שדה סוג קרן פנסיה
      (product?.SHEM_TOCHNIT && /פנסי|קרן|מקיפה/i.test(product.SHEM_TOCHNIT)) || // בדיקת שם התוכנית
      (product?.MaslulBituach?.SHEM_MASLUL_HABITUAH && 
        /פנסי|קרן|מקיפה/i.test(product.MaslulBituach.SHEM_MASLUL_HABITUAH))
    );
  }

  private determineProductType(product: any): ProductDetails['productType'] {
    if (this.isPensionProduct(product)) return 'פנסיה';
    
    const typeMap: { [key: string]: ProductDetails['productType'] } = {
      '1': 'ביטוח',
      '2': 'פנסיה',
      '3': 'גמל',
      '4': 'השתלמות'
    };
    
    return typeMap[product?.SUG_MUTZAR] || 'אחר';
  }

  private extractProductDetails(product: any): ProductDetails {
    return {
      productType: this.isPensionProduct(product) ? 'פנסיה' : this.determineProductType(product),
      pensionType: product?.SUG_KEREN_PENSIA ? 
        (product.SUG_KEREN_PENSIA === 2 ? 'חדשה' : 'ותיקה') : undefined,
      // ... other fields
    };
  }

  public processXmlContent(content: string) {
    const result = this.extractFieldsFromXml(content);
    return {
      client: result.data.lakoach,
      products: result.data.mutzarim || []
    };
  }
} 