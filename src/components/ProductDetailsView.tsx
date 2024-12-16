import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Product } from '../types/clearing-house';
import { formatCurrency } from '../utils/formatters';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetailsView: React.FC<ProductDetailsProps> = ({ product }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {product['SHEM-TOCHNIT']}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenDialog}
        >
          הצג את כל הנתונים
        </Button>
      </Box>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>מידע כללי</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>מספר פוליסה: {product['MISPAR-POLISA-O-HESHBON']}</Typography>
              <Typography>סוג מוצר: {product['SUG-MUTZAR']}</Typography>
              <Typography>סטטוס: {product['STATUS-POLISA-O-CHESHBON']}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>תאריך תחילת ביטוח: {product['TAARICH-TCHILAT-HABITUACH']}</Typography>
              <Typography>סוג קופה: {product['SUG-KUPA']}</Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>נתונים פיננסיים</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>
                סה"כ הפקדה: {product['TOTAL-HAFKADA'] && 
                  formatCurrency(product['TOTAL-HAFKADA'])}
              </Typography>
              <Typography>
                חיסכון מצטבר: {product['TOTAL-CHISACHON-MTZBR'] && 
                  formatCurrency(product['TOTAL-CHISACHON-MTZBR'])}
              </Typography>
              <Typography>
                יתרת תגמולים: {product['YITRAT-KASPEY-TAGMULIM'] && 
                  formatCurrency(product['YITRAT-KASPEY-TAGMULIM'])}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                דמי ניהול: {product['SHEUR-DMEI-NIHUL']}%
              </Typography>
              <Typography>
                תשואה נטו: {product['TSUA-NETO']}%
              </Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {product['SUG-MUTZAR'] === '2' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>נתוני פנסיה</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>
                  קצבה חודשית צפויה: {product['KITZVAT-HODSHIT-TZFUYA'] && 
                    formatCurrency(product['KITZVAT-HODSHIT-TZFUYA'])}
                </Typography>
                <Typography>
                  ק��בת זקנה: {product['SCHUM-KITZVAT-ZIKNA'] && 
                    formatCurrency(product['SCHUM-KITZVAT-ZIKNA'])}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>גיל פרישה: {product['GIL-PRISHA']}</Typography>
                <Typography>
                  שיעור כיסוי נכות: {product['SHEUR-KISUY-NECHUT']}%
                </Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          כל הנתונים מהמסלקה
        </DialogTitle>
        <DialogContent>
          <pre style={{ 
            direction: 'ltr', 
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}>
            {JSON.stringify(product, null, 2)}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 