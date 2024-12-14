import { XMLParser } from 'fast-xml-parser';

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

    // המר למחרוזת אם מגיע כמספר
    let idStr = id.toString();
    
    // הוסף אפס מוביל אם חסר
    if (idStr.length === 8) {
      idStr = '0' + idStr;
      console.log('Added leading zero to ID:', idStr);
    }
    
    // נקה את המספר מכל תו שאינו ספרה
    const cleanId = idStr.replace(/\D/g, '');
    
    // בדוק שהאורך הוא 9 ספרות
    if (cleanId.length !== 9) {
      console.log('ID length is not 9:', cleanId.length);
      return false;
    }

    // חישוב ספרת ביקורת
    const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1];
    let sum = 0;

    // עבור על כל ספרה
    for (let i = 0; i < 9; i++) {
      let digit = parseInt(cleanId.charAt(i)) * weights[i];
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

  extractFieldsFromXml(xmlContent: string) {
    try {
      const data = this.parser.parse(xmlContent);
      
      // טיפול במקרה שיש מערך של YeshutYatzran
      const yeshutYatzran = Array.isArray(data.Mimshak?.YeshutYatzran) 
        ? data.Mimshak.YeshutYatzran[0] 
        : data.Mimshak?.YeshutYatzran;

      // טיפול במקרה שיש מערך של Mutzar
      const mutzar = Array.isArray(yeshutYatzran?.Mutzarim?.Mutzar)
        ? yeshutYatzran.Mutzarim.Mutzar[0]
        : yeshutYatzran?.Mutzarim?.Mutzar;

      const netuneiMutzar = mutzar?.NetuneiMutzar;

      if (!netuneiMutzar) {
        console.log('Missing NetuneiMutzar data');
        throw new Error('MISSING_REQUIRED: NetuneiMutzar not found');
      }

      // מבנה איש קשר צריך להיות:
      // YeshutMaasik -> IshKesherYeshutMaasik -> {
      //   'SHEM-PRATI': string
      //   'SHEM-MISHPACHA': string
      //   'MISPAR-TELEPHONE-KAVI'?: string
      //   'MISPAR-CELLULARI'?: string
      //   'E-MAIL'?: string
      // }

      const yeshutLakoach = netuneiMutzar.YeshutLakoach;
      const yeshutMaasik = netuneiMutzar.YeshutMaasik;

      if (!yeshutLakoach || !yeshutMaasik) {
        console.log('Missing data:', { yeshutLakoach, yeshutMaasik });
        throw new Error('MISSING_REQUIRED: Required sections not found');
      }

      console.log('YeshutLakoach full data:', yeshutLakoach);
      
      // שימוש בשם השדה הנכון
      const idNumber = yeshutLakoach['MISPAR-ZIHUY-LAKOACH'];
      console.log('Validating ID:', idNumber);

      if (!this.validateId(idNumber)) {
        throw new Error(`INVALID_ID: ${idNumber} (length: ${idNumber?.toString().length})`);
      }

      if (!this.validateDate(yeshutLakoach['TAARICH-LEYDA'])) {
        throw new Error('INVALID_DATE');
      }

      const result = {
        lakoach: {
          ...yeshutLakoach,
          'MISPAR-ZIHUY': idNumber
        } as YeshutLakoach,
        maasik: yeshutMaasik as YeshutMaasik
      };

      // יצירת הדוח
      const report = this.createMarkdownReport(result.lakoach, result.maasik);
      
      return {
        data: result,
        report
      };

    } catch (error) {
      console.error('Error in extractFieldsFromXml:', error);
      throw error;
    }
  }

  createMarkdownReport(lakoach: YeshutLakoach, maasik: YeshutMaasik): string {
    try {
      return `# דוח מסלקה

## פרטי לקוח
- שם מלא: ${lakoach['SHEM-PRATI'] || ''} ${lakoach['SHEM-MISHPACHA'] || ''}
- מספר זהות: ${lakoach['MISPAR-ZIHUY'] || lakoach['MISPAR-ZIHUY-LAKOACH'] || ''}
- תאריך לידה: ${lakoach['TAARICH-LEYDA'] ? this.formatDate(lakoach['TAARICH-LEYDA']) : 'לא צוין'}
- טלפון נייד: ${lakoach['MISPAR-CELLULARI'] || 'לא צוין'}
- דוא"ל: ${lakoach['E-MAIL'] || 'לא צוין'}
- כתובת: ${[
    lakoach['SHEM-RECHOV'] || '',
    lakoach['MISPAR-BAIT'] || '',
    lakoach['SHEM-YISHUV'] || ''
  ].filter(Boolean).join(', ') || 'לא צוין'}

## פרטי מעסיק
- שם מעסיק: ${maasik['SHEM-MAASIK'] || 'לא צוין'}
- מספר מזהה: ${maasik['MISPAR-MEZAHE-MAASIK'] || 'לא צוין'}
- סטטוס: ${maasik['STATUS-MAASIK'] ? this.getStatusText(maasik['STATUS-MAASIK']) : 'לא צוין'}

${maasik.IshKesherYeshutMaasik ? `
### איש קשר
- שם: ${[
    maasik.IshKesherYeshutMaasik['SHEM-PRATI'] || '',
    maasik.IshKesherYeshutMaasik['SHEM-MISHPACHA'] || ''
  ].filter(Boolean).join(' ') || 'לא צוין'}
- טלפון: ${maasik.IshKesherYeshutMaasik['MISPAR-TELEPHONE-KAVI'] || 'לא צוין'}
- נייד: ${maasik.IshKesherYeshutMaasik['MISPAR-CELLULARI'] || 'לא צוין'}
- דוא"ל: ${maasik.IshKesherYeshutMaasik['E-MAIL'] || 'לא צוין'}
` : ''}`;
    } catch (error) {
      console.error('Error creating markdown report:', error);
      return '# שגיאה ביצירת הדוח';
    }
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

  extractClientData(data: { lakoach: YeshutLakoach; maasik: YeshutMaasik }) {
    const { lakoach } = data;
    return {
      id: lakoach['MISPAR-ZIHUY'] || lakoach['MISPAR-ZIHUY-LAKOACH'],
      firstName: lakoach['SHEM-PRATI'],
      lastName: lakoach['SHEM-MISHPACHA'],
      email: lakoach['E-MAIL'],
      phone: lakoach['MISPAR-CELLULARI'],
      address: [
        lakoach['SHEM-RECHOV'],
        lakoach['MISPAR-BAIT'],
        lakoach['SHEM-YISHUV']
      ].filter(Boolean).join(', ')
    };
  }
} 