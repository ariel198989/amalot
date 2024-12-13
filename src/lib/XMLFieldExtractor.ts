import { XMLParser } from 'fast-xml-parser';
import { toast } from 'sonner';

interface Categories {
  [key: string]: {
    fields: string[];
    display_order: string[];
  };
}

interface FieldMappings {
  [key: string]: {
    [key: string]: string;
  };
}

export class XMLFieldExtractor {
  private consolidatedFields: Map<string, Set<string>> = new Map();
  
  private categories: Categories = {
    'פרטים_אישיים': {
      fields: ['SHEM-PRATI', 'SHEM-MISHPACHA', 'MISPAR-ZIHUY', 'TAARICH-LEYDA', 
               'E-MAIL', 'ERETZ', 'MISPAR-TELEPHONE-KAVI', 'MISPAR-CELLULARI', 
               'SHEM-YISHUV', 'MIKUD', 'SHEM-RECHOV', 'MISPAR-BAIT'],
      display_order: ['SHEM-PRATI', 'SHEM-MISHPACHA', 'MISPAR-ZIHUY', 'TAARICH-LEYDA', 
                      'MISPAR-CELLULARI', 'E-MAIL', 'SHEM-YISHUV', 'SHEM-RECHOV']
    },
    'פרטי_מעסיקים': {
      fields: ['SHEM-MAASIK', 'MISPAR-MEZAHE-MAASIK', 'MPR-MAASIK-BE-YATZRAN', 
               'STATUS-MAASIK'],
      display_order: ['SHEM-MAASIK', 'MISPAR-MEZAHE-MAASIK', 'STATUS-MAASIK']
    },
    'פרטי_קופות': {
      fields: ['SHEM-YATZRAN', 'SHEM-METAFEL', 'KOD-MEZAHE-YATZRAN', 
               'MEZAHE-LAKOACH-MISLAKA', 'MISPAR-POLISA-O-HESHBON', 
               'MISPAR-POLISA-O-HESHBON-NEGDI'],
      display_order: ['SHEM-YATZRAN', 'SHEM-METAFEL', 'MISPAR-POLISA-O-HESHBON']
    },
    'סוג_קופות': {
      fields: ['SUG-KUPA', 'SUG-MUTZAR', 'SUG-TOCHNIT-O-CHESHBON', 'SHEM-TOCHNIT',
               'SHEM-MASLUL-HASHKAA', 'SHEM-MASLUL-HABITUAH'],
      display_order: ['SUG-KUPA', 'SUG-MUTZAR', 'SHEM-TOCHNIT']
    },
    'סכומים': {
      fields: ['SACH-ITRA-LESHICHVA-BESHACH', 'SCHUM-BITUACH', 'SCHUM-HAFRASHA',
               'SCHUM-HAFKADA-SHESHULAM', 'TOTAL-HAFKADA', 'TOTAL-HAFKADA-ACHRONA',
               'TOTAL-CHISACHON-MITZTABER-TZAFUY', 'TOTAL-CHISACHON-MTZBR'],
      display_order: ['TOTAL-HAFKADA', 'SCHUM-HAFRASHA', 'TOTAL-CHISACHON-MTZBR']
    },
    'דמי_ניהול': {
      fields: ['DMEI-NIHUL-ACHERIM', 'DMEI-NIHUL-ACHIDIM', 'SHEUR-DMEI-NIHUL',
               'SHEUR-DMEI-NIHUL-HAFKADA', 'SHEUR-DMEI-NIHUL-TZVIRA',
               'TOTAL-DMEI-NIHUL-HAFKADA', 'TOTAL-DMEI-NIHUL-POLISA-O-HESHBON'],
      display_order: ['SHEUR-DMEI-NIHUL', 'TOTAL-DMEI-NIHUL-HAFKADA']
    },
    'ביטוח': {
      fields: ['ALUT-KISUI', 'ALUT-KISUI-NECHUT', 'SUG-KISUY-BITOCHI',
               'TAARICH-TCHILAT-HABITUACH', 'SHEUR-KISUY-NECHUT'],
      display_order: ['ALUT-KISUI', 'SHEUR-KISUY-NECHUT', 'TAARICH-TCHILAT-HABITUACH']
    },
    'פיננסים': {
      fields: ['REVACH-HEFSED-BENIKOI-HOZAHOT', 'TSUA-NETO', 'SHEUR-TSUA-NETO',
               'TOTAL-ERKEI-PIDION', 'YITRAT-KASPEY-TAGMULIM'],
      display_order: ['TSUA-NETO', 'REVACH-HEFSED-BENIKOI-HOZAHOT', 'YITRAT-KASPEY-TAGMULIM']
    },
    'פנסיה': {
      fields: ['KITZVAT-HODSHIT-TZFUYA', 'SCHUM-KITZVAT-ZIKNA', 'GIL-PRISHA',
               'GIL-PRISHA-LEPENSIYAT-ZIKNA', 'MENAT-PENSIA-TZVURA', 'SUG-KEREN-PENSIA'],
      display_order: ['KITZVAT-HODSHIT-TZFUYA', 'GIL-PRISHA', 'SCHUM-KITZVAT-ZIKNA']
    },
    'ביטוח_מנהלים': {
      fields: ['STATUS-POLISA-O-CHESHBON', 'SUG-POLISA'],
      display_order: ['STATUS-POLISA-O-CHESHBON', 'SUG-POLISA']
    },
    'גמל': {
      fields: ['TIKRAT-HAFKADA-MUTEVET', 'YITRAT-PITZUIM-LELO-HITCHASHBENOT'],
      display_order: ['TIKRAT-HAFKADA-MUTEVET', 'YITRAT-PITZUIM-LELO-HITCHASHBENOT']
    },
    'השתלמות': {
      fields: ['TAARICH-NEZILUT-TAGMULIM', 'SCHUM-HAFKADA', 'YITRAT-KASPEY'],
      display_order: ['TAARICH-NEZILUT-TAGMULIM', 'YITRAT-KASPEY']
    }
  };

  private fieldMappings: FieldMappings = {
    'SUG-KUPA': {
      '1': 'קופת גמל',
      '2': 'קרן פנסיה',
      '3': 'קרן השתלמות',
      '4': 'ביטוח מנהלים'
    },
    'STATUS-POLISA-O-CHESHBON': {
      '1': 'פעיל',
      '2': 'מוקפא',
      '7': 'מבוטל'
    },
    'SUG-HAFRASHA': {
      '1': 'תגמולי עובד',
      '2': 'תגמולי מעביד',
      '3': 'פיצויים',
      '8': 'אחר',
      '9': 'הפקדה חד פעמית'
    }
  };

  private formatDate(value: string): string {
    if (value.length === 8 && /^\d+$/.test(value)) {
      return `${value.slice(6, 8)}/${value.slice(4, 6)}/${value.slice(0, 4)}`;
    }
    return value;
  }

  private formatValue(value: string, field: string): string {
    // Handle mappings
    if (/^\d+$/.test(value.trim()) && this.fieldMappings[field]) {
      return this.fieldMappings[field][value] || value;
    }

    // Handle dates
    if (field.startsWith('TAARICH-')) {
      return this.formatDate(value);
    }

    // Handle numbers
    try {
      const num = parseFloat(value);
      if (field.startsWith('SCHUM-') || field.startsWith('TOTAL-') || field.startsWith('SACH-')) {
        return num !== 0 ? `₪${num.toLocaleString('he-IL', { minimumFractionDigits: 2 })}` : "0";
      }
      if (field.startsWith('SHEUR-') || field.startsWith('ACHUZ-')) {
        return num !== 0 ? `${num.toFixed(2)}%` : "0";
      }
      return num !== 0 ? num.toLocaleString('he-IL', { minimumFractionDigits: 2 }) : "0";
    } catch {
      return value;
    }
  }

  private formatValuesList(values: string[]): string {
    const convertToSortable = (x: string): number | string => {
      try {
        return parseFloat(x.replace('��','').replace('%','').replace(',',''));
      } catch {
        return x;
      }
    };

    try {
      const uniqueValues = Array.from(new Set(values));
      const sortedValues = uniqueValues.sort((a, b) => {
        const aVal = convertToSortable(a);
        const bVal = convertToSortable(b);
        return typeof aVal === 'number' && typeof bVal === 'number' 
          ? aVal - bVal 
          : String(aVal).localeCompare(String(bVal));
      });

      if (sortedValues.length <= 3) {
        return sortedValues.join(' | ');
      }
      return `${sortedValues.slice(0, 3).join(' | ')} | ...`;
    } catch {
      return values.slice(0, 3).join(' | ');
    }
  }

  public async extractFieldsFromXml(xmlContent: string): Promise<void> {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        removeNSPrefix: true,
        isArray: (_name: string, _jpath: string, _isLeafNode: boolean, _isAttribute: boolean) => {
          // Handle arrays properly
          return false;
        },
        // Add proper parsing options
        parseAttributeValue: true,
        parseTagValue: true,
        trimValues: true
      });
      
      const result = parser.parse(xmlContent);
      // Log the parsed result to debug
      console.log('Parsed XML:', JSON.stringify(result, null, 2));
      this.extractFields(result);
    } catch (e) {
      console.error('Error processing XML:', e);
    }
  }

  private extractFields(obj: any, prefix: string = ''): void {
    if (typeof obj !== 'object') return;

    for (const key in obj) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string' || typeof value === 'number') {
        const stringValue = String(value).trim();
        if (stringValue) {
          if (!this.consolidatedFields.has(key)) {
            this.consolidatedFields.set(key, new Set());
          }
          this.consolidatedFields.get(key)?.add(stringValue);
        }
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'string' || typeof item === 'number') {
            if (!this.consolidatedFields.has(key)) {
              this.consolidatedFields.set(key, new Set());
            }
            this.consolidatedFields.get(key)?.add(String(item).trim());
          } else {
            this.extractFields(item, fullKey);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        this.extractFields(value, fullKey);
      }
    }
  }

  public createMarkdownReport(): string {
    let markdown = "# דוח מאוחד\n\n";

    for (const [category, config] of Object.entries(this.categories)) {
      const fieldsInCategory = new Map(
        Array.from(this.consolidatedFields.entries())
          .filter(([field]) => config.fields.includes(field))
      );

      if (fieldsInCategory.size > 0) {
        markdown += `## ${category.replace('_', ' ')}\n\n`;
        markdown += "| שדה | ערכים |\n|-----|--------|\n";

        const displayOrder = config.display_order || Array.from(fieldsInCategory.keys()).sort();
        for (const field of displayOrder) {
          if (fieldsInCategory.has(field)) {
            const values = Array.from(fieldsInCategory.get(field) || []);
            const formattedValues = values.map(v => this.formatValue(v, field));
            const valuesStr = this.formatValuesList(formattedValues);
            markdown += `| ${field} | ${valuesStr} |\n`;
          }
        }
        markdown += "\n";
      }
    }

    return markdown;
  }

  public extractClientData(): {
    first_name: string;
    last_name: string;
    id_number: string;
    email: string;
    phone: string;
    address_street: string;
    address_city: string;
    status: 'active' | 'inactive' | 'lead';
  } | null {
    try {
      const getFirstValue = (field: string): string => {
        const values = this.consolidatedFields.get(field);
        const value = values ? Array.from(values)[0] || '' : '';
        // Don't return 'NaN' as a value
        return value === 'NaN' ? '' : value;
      };

      // Log the consolidated fields for debugging
      console.log('Consolidated Fields:', 
        Object.fromEntries(
          Array.from(this.consolidatedFields.entries())
            .map(([k, v]) => [k, Array.from(v)])
        )
      );

      const data = {
        first_name: getFirstValue('SHEM-PRATI'),
        last_name: getFirstValue('SHEM-MISHPACHA'),
        id_number: getFirstValue('MISPAR-ZIHUY'),
        email: getFirstValue('E-MAIL'),
        phone: getFirstValue('MISPAR-CELLULARI') || getFirstValue('MISPAR-TELEPHONE-KAVI'),
        address_street: getFirstValue('SHEM-RECHOV'),
        address_city: getFirstValue('SHEM-YISHUV'),
        status: 'active' as const
      };

      // Log the extracted data
      console.log('Extracted Client Data:', data);

      // Only return if we have at least some basic data
      if (data.first_name || data.last_name || data.id_number) {
        return data;
      }
      
      toast.error('לא נמצאו פרטי לקוח ב��ובץ');
      return null;
    } catch (error) {
      console.error('Error extracting client data:', error);
      return null;
    }
  }
} 