# מבנה קבצי מסלקה

## מבנה XML
המידע בקבצי המסלקה מאורגן במבנה היררכי:

```
Mimshak
└── YeshutYatzran
    └── Mutzarim
        └── Mutzar
            └── NetuneiMutzar
                ├── YeshutLakoach (פרטי לקוח)
                │   ├── SHEM-PRATI: שיר פרחיה
                │   ├── SHEM-MISHPACHA: עמר
                │   ├── MISPAR-ZIHUY: 205600224
                │   ├── TAARICH-LEYDA: 19940423
                │   ├── MISPAR-CELLULARI: 0526557865
                │   ├── E-MAIL: shiramar0014@gmail.com
                │   ├── ERETZ: ישראל
                │   ├── SHEM-YISHUV: אלעד
                │   ├── SHEM-RECHOV: רבן יוחנן בן זכאי
                │   ├── MISPAR-BAIT: 5
                │   └── MIKUD: 4080007
                │
                └── YeshutMaasik (פרטי מעסיק)
                    ├── SHEM-MAASIK: מנפאואר ישראל בע"מ
                    ├── MISPAR-MEZAHE-MAASIK: 510506744
                    ├── STATUS-MAASIK: 1
                    ├── MPR-MAASIK-BE-YATZRAN: 12345
                    ├── ERETZ: ישראל
                    ├── SHEM-YISHUV: תל אביב - יפו
                    ├── SHEM-RECHOV: אלון יגאל
                    ├── MISPAR-BAIT: 110
                    ├── MIKUD: 6330424
                    ├── MISPAR-TELEPHONE-KAVI: 03-5639999
                    ├── E-MAIL: manpower@manpower.co.il
                    │
                    └── IshKesherYeshutMaasik (איש קשר)
                        ├── SHEM-PRATI: אירין
                        ├── SHEM-MISHPACHA: לוי
                        ├── MISPAR-TELEPHONE-KAVI: 03-5639999
                        ├── MISPAR-CELLULARI: 053-3373704
                        └── E-MAIL: irenel@manpowergroup.co.il

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

### פרטי מעסיק (YeshutMaasik)
| שדה ב-XML | תיאור | דוגמה |
|-----------|--------|--------|
| SHEM-MAASIK | שם מעסיק | מנפאואר ישראל בע"מ |
| MISPAR-MEZAHE-MAASIK | מספר מזהה מעסיק | 510506744 |
| STATUS-MAASIK | סטטוס מעסיק | 1 (פעיל) |
| MPR-MAASIK-BE-YATZRAN | מספר מעסיק אצל יצרן | 12345 |
| ERETZ | ארץ | ישראל |
| SHEM-YISHUV | עיר | תל אביב - יפו |
| SHEM-RECHOV | רחוב | אלון יגאל |
| MISPAR-BAIT | מספר בית | 110 |
| MIKUD | מיקוד | 6330424 |
| MISPAR-TELEPHONE-KAVI | טלפון | 03-5639999 |
| E-MAIL | דוא"ל | manpower@manpower.co.il |

### פרטי איש קשר (IshKesherYeshutMaasik)
| שדה ב-XML | תיאור | דוגמה |
|-----------|--------|--------|
| SHEM-PRATI | שם פרטי | אירין |
| SHEM-MISHPACHA | שם משפחה | לוי |
| MISPAR-TELEPHONE-KAVI | טלפון | 03-5639999 |
| MISPAR-CELLULARI | נייד | 053-3373704 |
| E-MAIL | דוא"ל | irenel@manpowergroup.co.il |

## ערכי סטטוס מעסיק
| קוד | משמעות |
|-----|---------|
| 1 | פעיל |
| 2 | מוקפא |
| 3 | מבוטל | 

## טיפים לעיבוד הקבצים
1. יש לוודא שכל השדות מקודדים ב-UTF-8 לתמיכה בעברית
2. תאריכים מגיעים בפורמט YYYYMMDD ללא מפרידים
3. מספרי טלפון יכולים להכיל מקף (-)
4. יש לטפל במקרים בהם שדות אופציונליים חסרים

## שגיאות נפוצות
| קוד שגיאה | תיאור | טיפול מומלץ |
|-----------|--------|-------------|
| INVALID_ID | מספר זהות לא תקין | לוודא 9 ספרות וספרת ביקורת |
| MISSING_REQUIRED | שדה חובה חסר | לדחות את הקובץ ולדווח לשולח |
| INVALID_DATE | תאריך לא תקין | לוודא פורמט YYYYMMDD תקין |