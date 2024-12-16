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
                │   ├── MPR-MAASIK-BE-YATZRAN: מספר מעסיק אצל היצרן
                │   ├── ERETZ: ארץ
                │   ├── SHEM-YISHUV: עיר
                │   ├── SHEM-RECHOV: רחוב
                │   ├── MISPAR-BAIT: מספר בית
                │   ├── MIKUD: מיקוד
                │   ├── MISPAR-TELEPHONE-KAVI: טלפון
                │   └── E-MAIL: דוא"ל
                │   └── IshKesherYeshutMaasik (איש קשר)
                │       ├── SHEM-PRATI: שם פרטי
                │       ├── SHEM-MISHPACHA: שם משפחה
                │       ├── MISPAR-TELEPHONE-KAVI: טלפון
                │       ├── MISPAR-CELLULARI: נייד
                │       └── E-MAIL: דוא"ל
                │
                └── HeshbonotOPolisot
                    └── HeshbonOPolisa (מוצר פנסיוני)
                        ├── MISPAR-POLISA-O-HESHBON: מספר פוליסה/חשבון
                        ├── MISPAR-POLISA-O-HESHBON-NEGDI: מספר חשבון נגדי
                        ├── SUG-KUPA: סוג קופה
                        ├── SUG-MUTZAR: סוג מוצר
                        ├── SUG-TOCHNIT-O-CHESHBON: סוג תכנית
                        ├── SHEM-TOCHNIT: שם תכנית
                        ├── SHEM-MASLUL-HASHKAA: שם מסלול השקעה
                        ├── SHEM-MASLUL-HABITUAH: שם מסלול ביטוח
                        ├── STATUS-POLISA-O-CHESHBON: סטטוס
                        │
                        ├── סכומים
                        │   ├── TOTAL-HAFKADA: סה"כ הפקדה
                        │   ├── TOTAL-HAFKADA-ACHRONA: סה"כ הפקדה אחרונה
                        │   ├── SCHUM-HAFRASHA: סכום הפרשה
                        │   ├── SCHUM-HAFKADA-SHESHULAM: סכום הפקדה ששולם
                        │   ├── TOTAL-CHISACHON-MTZBR: סה"כ חיסכון מצטבר
                        │   ├── TOTAL-CHISACHON-MITZTABER-TZAFUY: סה"כ חיסכון מצטבר צפוי
                        │   ├── YITRAT-PITZUIM-LELO-HITCHASHBENOT: יתרת פיצויים ללא התחשבנות
                        │   └── YITRAT-KASPEY: יתרת כספים
                        │
                        ├── דמי ניהול
                        │   ├── SHEUR-DMEI-NIHUL: שיעור דמי ניהול
                        │   ├── SHEUR-DMEI-NIHUL-TZVIRA: שיעור דמי ניהול מצבירה
                        │   ├── SHEUR-DMEI-NIHUL-HAFKADA: שיעור דמי ניהול מהפקדה
                        │   ├── TOTAL-DMEI-NIHUL-HAFKADA: סה"כ דמי ניהול מהפקדה
                        │   └── TOTAL-DMEI-NIHUL-POLISA-O-HESHBON: סה"כ דמי ניהול פוליסה/חשבון
                        │
                        ├── ביטוח
                        │   ├── ALUT-KISUI: עלות כיסוי
                        │   ├── ALUT-KISUI-NECHUT: עלות כיסוי נכות
                        │   ├── SHEUR-KISUY-NECHUT: שיעור כיסוי נכות
                        │   ├── TAARICH-TCHILAT-HABITUACH: תאריך תחילת ביטוח
                        │   └── SUG-KISUY-BITOCHI: סוג כיסוי ביטוחי
                        │
                        ├── נתונים פיננסיים
                        │   ├── TSUA-NETO: תשואה נטו
                        │   ├── SHEUR-TSUA-NETO: שיעור תשואה נטו
                        │   ├── REVACH-HEFSED-BENIKOI-HOZAHOT: רווח/הפסד בניכוי הוצאות
                        │   └── YITRAT-KASPEY-TAGMULIM: יתרת כספי תגמולים
                        │
                        └── פנסיה
                            ├── KITZVAT-HODSHIT-TZFUYA: קצבה חודשית צפויה
                            ├── GIL-PRISHA: גיל פרישה
                            ├── GIL-PRISHA-LEPENSIYAT-ZIKNA: גיל פרישה לפנסיית זקנה
                            ├── SCHUM-KITZVAT-ZIKNA: סכום קצבת זקנה
                            ├── MENAT-PENSIA-TZVURA: מנת פנסיה צבורה
                            └── SUG-KEREN-PENSIA: סוג קרן פנסיה
```

## מיפוי קודים

### סוג קופה (SUG-KUPA)
- 1: קופת גמל
- 2: קרן פנסיה
- 3: קרן השתלמות
- 4: ביטוח מנהלים

### סטטוס פוליסה/חשבון (STATUS-POLISA-O-CHESHBON)
- 1: פעיל
- 2: מוקפא
- 3: מבוטל
- 7: מבוטל

### סטטוס מעסיק (STATUS-MAASIK)
- 1: פעיל
- 2: לא פעיל
- 3: מוקפ��

### סוג הפרש (SUG-HAFRASHA)
- 1: תגמולי עובד
- 2: תגמולי מעביד
- 3: פיצויים
- 8: אחר
- 9: הפקדה חד פעמית

## פורמט נתונים
- סכומים: מוצגים בש"ח עם שתי ספרות אחרי הנקודה
- אחוזים: מוצגים עם סימן % ושתי ספרות אחרי הנקודה
- תאריכים: מוצגים בפורמט DD/MM/YYYY
- מספרי טלפון: מוצגים עם מקף מפריד
- ערכים חסרים: מוצגים כ"לא צוין"

## דוגמאות מהקבצים

### דוגמה 1 - ביטוח מנהלים (הפניקס)
```xml
<YeshutYatzran>
    <SHEM-YATZRAN>הפניקס חברה לביטוח בע"מ</SHEM-YATZRAN>
    <KOD-MEZAHE-YATZRAN>520023185</KOD-MEZAHE-YATZRAN>
    <YeshutLakoach>
        <SHEM-PRATI>ר פרחיה</SHEM-PRATI>
        <SHEM-MISHPACHA>עמר</SHEM-MISHPACHA>
        <MISPAR-ZIHUY-LAKOACH>205600224</MISPAR-ZIHUY-LAKOACH>
        <TAARICH-LEYDA>19940423</TAARICH-LEYDA>
    </YeshutLakoach>
    <HeshbonOPolisa>
        <MISPAR-POLISA-O-HESHBON>3000-205600224</MISPAR-POLISA-O-HESHBON>
        <SHEM-TOCHNIT>ריסק</SHEM-TOCHNIT>
        <STATUS-POLISA-O-CHESHBON>1</STATUS-POLISA-O-CHESHBON>
        <PerutMitryot>
            <SCHUM-BITUACH>130000.00</SCHUM-BITUACH>
            <ALUT-KISUI>168.77</ALUT-KISUI>
        </PerutMitryot>
    </HeshbonOPolisa>
</YeshutYatzran>
```

### דוגמה 2 - קרן השתלמות (קרן השתלמות למורים)
```xml
<YeshutYatzran>
    <SHEM-YATZRAN>קרן השתלמות למורים תיכוניים מורי סמינרים ומפקחים ב</SHEM-YATZRAN>
    <KOD-MEZAHE-YATZRAN>520028390</KOD-MEZAHE-YATZRAN>
    <HeshbonOPolisa>
        <MISPAR-POLISA-O-HESHBON>18144675</MISPAR-POLISA-O-HESHBON>
        <SHEM-TOCHNIT>קרן השתלמות למורים תיכוניים, מורי סמינרים ומפקחים - המסלול הרגיל-כללי</SHEM-TOCHNIT>
        <STATUS-POLISA-O-CHESHBON>7</STATUS-POLISA-O-CHESHBON>
        <BlockItrot>
            <PerutYitrot>
                <TOTAL-CHISACHON-MTZBR>34581.53</TOTAL-CHISACHON-MTZBR>
            </PerutYitrot>
        </BlockItrot>
        <Tsua>
            <SHEUR-TSUA-NETO>12.26</SHEUR-TSUA-NETO>
        </Tsua>
    </HeshbonOPolisa>
</YeshutYatzran>
```

### דוגמה 3 - פרטי מעסיק
```xml
<YeshutMaasik>
    <SHEM-MAASIK>הסתדרות המורים בישראל בע"מ</SHEM-MAASIK>
    <MISPAR-MEZAHE-MAASIK>589924810</MISPAR-MEZAHE-MAASIK>
    <STATUS-MAASIK>1</STATUS-MAASIK>
    <MPR-MAASIK-BE-YATZRAN>0400030003</MPR-MAASIK-BE-YATZRAN>
    <ERETZ>ישראל</ERETZ>
    <SHEM-YISHUV>תל אביב-יפו</SHEM-YISHUV>
</YeshutMaasik>
```

### דוגמה 4 - הפקדות והפרשות
```xml
<PerutHafrashotLePolisa>
    <SUG-HAMAFKID>2</SUG-HAMAFKID>
    <SUG-HAFRASHA>8</SUG-HAFRASHA>
    <ACHUZ-HAFRASHA>4.2</ACHUZ-HAFRASHA>
    <SCHUM-HAFRASHA>186.00</SCHUM-HAFRASHA>
</PerutHafrashotLePolisa>
```

### דוגמה 5 - דמי ניהול
```xml
<HotzaotBafoalLehodeshDivoach>
    <SHEUR-DMEI-NIHUL-HAFKADA>0.00</SHEUR-DMEI-NIHUL-HAFKADA>
    <TOTAL-DMEI-NIHUL-HAFKADA>0.00</TOTAL-DMEI-NIHUL-HAFKADA>
    <SHEUR-DMEI-NIHUL-TZVIRA>0.0109</SHEUR-DMEI-NIHUL-TZVIRA>
    <TOTAL-DMEI-NIHUL-TZVIRA>11.06</TOTAL-DMEI-NIHUL-TZVIRA>
    <TOTAL-DMEI-NIHUL-POLISA-O-HESHBON>122.3</TOTAL-DMEI-NIHUL-POLISA-O-HESHBON>
</HotzaotBafoalLehodeshDivoach>
```

## מבנה המסמך

## קרנות פנסיה

### מבנה נתונים
```xml
<YeshutYatzran>
    <SHEM-YATZRAN>הראל פנסיה וגמל בע"מ</SHEM-YATZRAN>
    <KOD-MEZAHE-YATZRAN>512267592</KOD-MEZAHE-YATZRAN>
    <HeshbonOPolisa>
        <TAARICH-HITZTARFUT-RISHON>20140201</TAARICH-HITZTARFUT-RISHON>
        <SUG-KEREN-PENSIA>2</SUG-KEREN-PENSIA>
        <STATUS-POLISA-O-CHESHBON>1</STATUS-POLISA-O-CHESHBON>
        <MaslulBituach>
            <MASLUL-BITUACH-BAKEREN-PENSIA>512267592000000000000000000116</MASLUL-BITUACH-BAKEREN-PENSIA>
            <SHEM-MASLUL-HABITUAH>פנסיה מקיפה נכות מוגדלת 75%</SHEM-MASLUL-HABITUAH>
        </MaslulBituach>
        <TOTAL-CHISACHON-MTZBR>270397</TOTAL-CHISACHON-MTZBR>
        <SCHUM-KITZVAT-ZIKNA>18040.70</SCHUM-KITZVAT-ZIKNA>
        <KITZVAT-HODSHIT-TZFUYA>5044.35</KITZVAT-HODSHIT-TZFUYA>
    </HeshbonOPolisa>
</YeshutYatzran>
```

### דוגמאות מהקבצים

#### קרן פנסיה פעילה - הראל
- סוג קרן: 2 (פנסיה חדשה)
- סטטוס: פעיל (1)
- מסלול ביטוח: פנסיה מקיפה נכות מוגדלת 75%
- צבירה: 270,397 ש"ח
- קצבה חודשית צפויה: 5,044.35 ש"ח
- קצבת זקנה: 18,040.70 ש"ח
- תאריך הצטרפות: 01/02/2014

#### קרן פנסיה נוספת
- סוג קרן: 2 (פנסיה חדשה)
- סטטוס: פעיל (1)
- מסלול ביטוח: מסלול ביטוח 75% לנכות ו-100% לשאירים
- קצבה חודשית צפויה: 3,817.38 ש"ח
- קצבת זקנה: 11,626.16 ש"ח
- תאריך הצטרפות: 01/09/2022

### מיפוי שדות
| שדה | תיאור | דוגמה |
|-----|--------|--------|
| SUG-KEREN-PENSIA | סוג קרן הפנסיה | 2 = פנסיה חדשה |
| STATUS-POLISA-O-CHESHBON | סטטוס הפוליסה | 1 = פעיל, 2 = מוקפא |
| SHEM-MASLUL-HABITUAH | שם מסלול הביטוח | פנסיה מקיפה נכות מוגדלת 75% |
| TOTAL-CHISACHON-MTZBR | סך צבירה | 270,397 |
| SCHUM-KITZVAT-ZIKNA | סכום קצבת זקנה | 18,040.70 |
| KITZVAT-HODSHIT-TZFUYA | קצבה חודשית צפויה | 5,044.35 |
| TAARICH-HITZTARFUT-RISHON | תאריך הצטרפות ראשון | 20140201 |