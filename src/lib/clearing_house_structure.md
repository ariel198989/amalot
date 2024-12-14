# מבנה קבצי מסלקה

## מבנה XML
המידע בקבצי המסלקה מאורגן במבנה היררכי:

```
Mimshak
└── YeshutYatzran (פרטי יצרן)
    ├── SHEM-YATZRAN: שם יצרן
    ├── KOD-MEZAHE-YATZRAN: קוד מזהה יצרן
    ├── SHEM-METAFEL: שם מטפל
    ├── MEZAHE-LAKOACH-MISLAKA: מזהה לקוח מסלקה
    │
    └── Mutzarim
        └── Mutzar
            └── NetuneiMutzar
                ├── YeshutLakoach (פרטי לקוח)
                │   ├── SHEM-PRATI: שם פרטי
                │   ├── SHEM-MISHPACHA: שם משפחה
                │   ├── MISPAR-ZIHUY: מספר זהות
                │   ├── TAARICH-LEYDA: תאריך לידה
                │   ├── MISPAR-CELLULARI: טלפון נייד
                │   ├── E-MAIL: דוא"ל
                │   ├── ERETZ: ארץ
                │   ├── SHEM-YISHUV: עיר
                │   ├── SHEM-RECHOV: רחוב
                │   ├── MISPAR-BAIT: מספר בית
                │   └── MIKUD: מיקוד
                │
                ├── YeshutMaasik (פרטי מעסיק)
                │   ├── SHEM-MAASIK: שם מעסיק
                │   ├── MISPAR-MEZAHE-MAASIK: מספר מזהה מעסיק
                │   ├── STATUS-MAASIK: סטטוס מעסיק
                │   ├── MPR-MAASIK-BE-YATZRAN: מספר מעסיק אצל יצרן
                │   ├── ERETZ: ארץ
                │   ├── SHEM-YISHUV: עיר
                │   ├── SHEM-RECHOV: רחוב
                │   ├── MISPAR-BAIT: מספר בית
                │   ├── MIKUD: מיקוד
                │   ├── MISPAR-TELEPHONE-KAVI: טלפון
                │   ├── E-MAIL: דוא"ל
                │   │
                │   └── IshKesherYeshutMaasik (איש קשר)
                │       ├── SHEM-PRATI: שם פרטי
                │       ├── SHEM-MISHPACHA: שם משפחה
                │       ├── MISPAR-TELEPHONE-KAVI: טלפון
                │       ├── MISPAR-CELLULARI: נייד
                │       └── E-MAIL: דוא"ל
                │
                └── HeshbonotOPolisot (חשבונות ופוליסות)
                    └── HeshbonOPolisa
                        ├── MISPAR-POLISA-O-HESHBON: מספר פוליסה/חשבון
                        ├── SUG-KUPA: סוג קופה
                        ├── SUG-MUTZAR: סוג מוצר
                        ├── SUG-TOCHNIT-O-CHESHBON: סוג תכנית/חשבון
                        ├── SHEM-TOCHNIT: שם תכנית
                        ├── STATUS-POLISA-O-CHESHBON: סטטוס פוליסה/חשבון
                        │
                        ├── סכומים
                        │   ├── TOTAL-HAFKADA: סה"כ הפקדה
                        │   ├── SCHUM-HAFRASHA: סכום הפרשה
                        │   └── TOTAL-CHISACHON-MTZBR: סה"כ חיסכון מצטבר
                        │
                        ├── דמי ניהול
                        │   ├── SHEUR-DMEI-NIHUL: שיעור דמי ניהול
                        │   └── TOTAL-DMEI-NIHUL-HAFKADA: סה"כ דמי ניהול הפקדה
                        │
                        ├── ביטוח
                        │   ├── ALUT-KISUI: עלות כיסוי
                        │   ├── SHEUR-KISUY-NECHUT: שיעור כיסוי נכות
                        │   └── TAARICH-TCHILAT-HABITUACH: תאר��ך תחילת ביטוח
                        │
                        ├── נתונים פיננסיים
                        │   ├── TSUA-NETO: תשואה נטו
                        │   ├── REVACH-HEFSED-BENIKOI-HOZAHOT: רווח/הפסד בניכוי הוצאות
                        │   └── YITRAT-KASPEY-TAGMULIM: יתרת כספי תגמולים
                        │
                        └── פנסיה (אופציונלי)
                            ├── KITZVAT-HODSHIT-TZFUYA: קצבה חודשית צפויה
                            ├── GIL-PRISHA: גיל פרישה
                            └── SCHUM-KITZVAT-ZIKNA: סכום קצבת זקנה
```

## מיפוי שדות

### פרטי לקוח (YeshutLakoach)
| שדה ב-XML | תיאור | דוגמה |
|-----------|--------|--------|
| SHEM-PRATI | שם פרטי | שיר פרחיה |
| SHEM-MISHPACHA | שם משפחה | עמר |
| MISPAR-ZIHUY | מספר זהות | 205600224 |
| TAARICH-LEYDA | תאריך לידה | 19940423 |
| MISPAR-CELLULARI | טלפון נייד | 0526557865 |
| E-MAIL | דוא"ל | shiramar0014@gmail.com |
| ERETZ | ארץ | ישראל |
| SHEM-YISHUV | עיר | אלעד |
| SHEM-RECHOV | רחוב | רבן יוחנן בן זכאי |
| MISPAR-BAIT | מספר בית | 5 |
| MIKUD | מיקוד | 4080007 |

### פרטי מצרן (YeshutYatzran)
| שדה ב-XML | תיאור | דוגמה |
|-----------|--------|--------|
| SHEM-YATZRAN | שם יצרן | הפניקס חברה לביטוח בע"מ |
| KOD-MEZAHE-YATZRAN | קוד מזהה יצרן | 520023185 |
| SHEM-METAFEL | שם מטפל | הפניקס חברה לביטוח בע"מ |
| MEZAHE-LAKOACH-MISLAKA | מזהה לקוח מסלקה | 520023185 |

### פרטי מעסיק (YeshutMaasik)
| שדה ב-XML | תיאור | דוגמה |
|-----------|--------|--------|
| SHEM-MAASIK | שם מעסיק | הסתדרות המורים בישראל בע"מ |
| MISPAR-MEZAHE-MAASIK | מספר מזהה מעסיק | 589924810 |
| STATUS-MAASIK | סטטוס מעסיק | 1 |
| MPR-MAASIK-BE-YATZRAN | מספר מעסיק אצל יצרן | 0400030003 |
| ERETZ | ארץ | ישראל |
| SHEM-YISHUV | עיר | תל אביב-יפו |
| SHEM-RECHOV | רחוב | - |
| MISPAR-BAIT | מספר בית | - |
| MIKUD | מיקוד | - |
| MISPAR-TELEPHONE-KAVI | טלפון | - |
| E-MAIL | דוא"ל | - |

### פרטי איש קשר (IshKesherYeshutMaasik)
| שדה ב-XML | תיאור | דוגמה |
|-----------|--------|--------|
| SHEM-PRATI | שם פרטי | אירין |
| SHEM-MISHPACHA | שם משפחה | לוי |
| MISPAR-TELEPHONE-KAVI | טלפון | 03-5639999 |
| MISPAR-CELLULARI | נייד | 053-3373704 |
| E-MAIL | דוא"ל | irenel@manpowergroup.co.il |

### פרטי חשבון/פוליסה (HeshbonOPolisa)
| שדה ב-XML | תיאור | דוגמה |
|-----------|--------|--------|
| MISPAR-POLISA-O-HESHBON | מספר פוליסה/חשבון | 3000-205600224 |
| SUG-KUPA | סוג קופה | ריסק |
| SUG-MUTZAR | סוג מוצר | 8 |
| SUG-TOCHNIT-O-CHESHBON | סוג תכנית/חשבון | 4 |
| SHEM-TOCHNIT | שם תכנית | ריסק |
| STATUS-POLISA-O-CHESHBON | סטטוס פוליסה/חשבון | פעיל |
| TOTAL-HAFKADA | סה"כ הפקדה | ₪186.00 |
| SCHUM-HAFRASHA | סכום הפרשה | ₪186.00 |
| TOTAL-CHISACHON-MTZBR | סה"כ חיסכון מצטבר | ₪0.00 |
| SHEUR-DMEI-NIHUL | שיעור דמי ניהול | 0.00% |
| TOTAL-DMEI-NIHUL-HAFKADA | סה"כ דמי ניהול הפקדה | ₪0.00 |
| ALUT-KISUI | עלות כיסוי | ₪168.77 |
| SHEUR-KISUY-NECHUT | שיעור כיסוי נכות | 75.00% |
| TAARICH-TCHILAT-HABITUACH | תאריך תחילת ביטוח | 01/01/2023 |
| TSUA-NETO | תשואה נטו | 0.00% |
| REVACH-HEFSED-BENIKOI-HOZAHOT | רווח/הפסד בניכוי הוצאות | ₪0.00 |
| YITRAT-KASPEY-TAGMULIM | יתרת כספי תגמולים | ₪0.00 |
| KITZVAT-HODSHIT-TZFUYA | קצבה חודשית צפויה | - |
| GIL-PRISHA | גיל פרישה | - |
| SCHUM-KITZVAT-ZIKNA | סכום קצבת זקנה | - |

## ערכי סטטוס מעסיק
| קוד | משמעות |
|-----|---------|
| 1 | פעיל |
| 2 | מוקפא |
| 3 | מבוטל |