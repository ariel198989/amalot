import React, { useState } from 'react';
import { 
  TableContainer, 
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Stack,
  Snackbar
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Client } from '../types/clearing-house';

export const ClientsTable: React.FC<{ 
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}> = ({ 
  clients,
  onEdit,
  onDelete 
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpenDialog = (client: Client) => {
    setSelectedClient(client);
  };

  const handleCloseDialog = () => {
    setSelectedClient(null);
  };

  const handleCopyId = (client: Client) => {
    navigator.clipboard.writeText(client.id_number);
    setSnackbarOpen(true);
  };

  const handleEdit = (client: Client) => {
    if (onEdit) {
      onEdit(client);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>פעולות</TableCell>
              <TableCell>תאריך הצטרפות</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>תעסוקה</TableCell>
              <TableCell>כתובת</TableCell>
              <TableCell>תעודת זהות</TableCell>
              <TableCell>דוא"ל</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>שם מלא</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(client)}
                      title="צפה בנתוני מסלקה"
                    >
                      <ArticleIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyId(client)}
                      title="העתק תעודת זהות"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(client)}
                      title="ערוך לקוח"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell>{client.join_date}</TableCell>
                <TableCell>{client.status}</TableCell>
                <TableCell>{client.employment_status}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>{client.id_number}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{`${client.first_name} ${client.last_name}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!selectedClient}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          נתוני לקוח - {selectedClient?.first_name} {selectedClient?.last_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              תעודת זהות: {selectedClient?.id_number}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              דוא"ל: {selectedClient?.email}
            </Typography>
            {selectedClient?.phone && (
              <Typography variant="subtitle1" gutterBottom>
                טלפון: {selectedClient?.phone}
              </Typography>
            )}
            {selectedClient?.address && (
              <Typography variant="subtitle1" gutterBottom>
                כתובת: {selectedClient?.address}
              </Typography>
            )}
            {selectedClient?.employment_status && (
              <Typography variant="subtitle1" gutterBottom>
                תעסוקה: {selectedClient?.employment_status}
              </Typography>
            )}
          </Box>
          
          {selectedClient?.products?.map((product, index) => (
            <Box key={index} sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1
            }}>
              <Typography variant="h6" gutterBottom>
                {product['SHEM-TOCHNIT'] || 'מוצר פנסיוני'}
              </Typography>
              <Typography>
                מספר פוליסה: {product['MISPAR-POLISA-O-HESHBON']}
              </Typography>
              <Typography>
                סוג מוצר: {product['SUG-MUTZAR']}
              </Typography>
              {product['TOTAL-CHISACHON-MTZBR'] && (
                <Typography>
                  סכום צבירה: {product['TOTAL-CHISACHON-MTZBR']}
                </Typography>
              )}
              {product['SHEUR-DMEI-NIHUL'] && (
                <Typography>
                  דמי ניהול: {product['SHEUR-DMEI-NIHUL']}%
                </Typography>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            סגור
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="תעודת זהות הועתקה ללוח"
      />
    </>
  );
}; 