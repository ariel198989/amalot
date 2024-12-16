export interface Product {
  'SHEM-TOCHNIT': string;
  'MISPAR-POLISA-O-HESHBON': string;
  'SUG-MUTZAR': string;
  'STATUS-POLISA-O-CHESHBON': string;
  'TAARICH-TCHILAT-HABITUACH'?: string;
  'SUG-KUPA'?: string;
  'TOTAL-HAFKADA'?: number;
  'TOTAL-CHISACHON-MTZBR'?: number;
  'YITRAT-KASPEY-TAGMULIM'?: number;
  'SHEUR-DMEI-NIHUL'?: number;
  'TSUA-NETO'?: number;
  'KITZVAT-HODSHIT-TZFUYA'?: number;
  'SCHUM-KITZVAT-ZIKNA'?: number;
  'GIL-PRISHA'?: number;
  'SHEUR-KISUY-NECHUT'?: number;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone?: string;
  employment_status?: string;
  address?: string;
  join_date?: string;
  status?: string;
  raw_data?: any;
  products?: Product[];
}

export interface YeshutLakoach {
  'SHEM-PRATI': string;
  'SHEM-MISHPACHA': string;
  'MISPAR-ZIHUY': string;
  'E-MAIL'?: string;
  // ... other fields
}

export interface YeshutMaasik {
  'SHEM-MAASIK': string;
  'MISPAR-MEZAHE-MAASIK': string;
  'STATUS-MAASIK': string;
  // ... other fields
}

export interface ExtractedData {
  lakoach: YeshutLakoach;
  maasik: YeshutMaasik;
  mutzarim: any[];
} 