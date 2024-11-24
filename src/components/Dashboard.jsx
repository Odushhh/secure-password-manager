import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function Dashboard({ passwords, onPasswordsChange }) {
  const [newDomain, setNewDomain] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAddPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: newDomain,
          password: newPassword,
        }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Password added successfully',
          severity: 'success',
        });
        setNewDomain('');
        setNewPassword('');
        onPasswordsChange();
      } else {
        throw new Error('Failed to add password');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error adding password',
        severity: 'error',
      });
    }
  };

  const handleDeletePassword = async (domain) => {
    try {
      const response = await fetch(`/api/password/${domain}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Password deleted successfully',
          severity: 'success',
        });
        onPasswordsChange();
      } else {
        throw new Error('Failed to delete password');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting password',
        severity: 'error',
      });
    }
  };

  const handleViewPassword = async (domain) => {
    try {
      const response = await fetch(`/api/password/${domain}`);
      const data = await response.json();
      
      if (data.password) {
        setCurrentPassword(data.password);
        setSelectedDomain(domain);
        setOpenDialog(true);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error retrieving password',
        severity: 'error',
      });
    }
  };

  const handleCopyPassword = async (domain) => {
    try {
      const response = await fetch(`/api/password/${domain}`);
      const data = await response.json();
      
      if (data.password) {
        await navigator.clipboard.writeText(data.password);
        setSnackbar({
          open: true,
          message: 'Password copied to clipboard',
          severity: 'success',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error copying password',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add New Password
          </Typography>
          <form onSubmit={handleAddPassword}>
            <TextField
              fullWidth
              label="Domain/Website"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Add Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Stored Passwords
          </Typography>
          <List>
            {passwords.map((domain) => (
              <ListItem key={domain} divider>
                <ListItemText primary={domain} />
                <ListItemSecondaryAction>
                  <Tooltip title="View Password">
                    <IconButton
                      edge="end"
                      onClick={() => handleViewPassword(domain)}
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy Password">
                    <IconButton
                      edge="end"
                      onClick={() => handleCopyPassword(domain)}
                      sx={{ mr: 1 }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      onClick={() => handleDeletePassword(domain)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {passwords.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No passwords stored"
                  secondary="Add your first password using the form above"
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setCurrentPassword('');
          setSelectedDomain(null);
        }}
      >
        <DialogTitle>Password for {selectedDomain}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={currentPassword}
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setCurrentPassword('');
            setSelectedDomain(null);
          }}>
            Close
          </Button>
          <Button
            onClick={() => handleCopyPassword(selectedDomain)}
            variant="contained"
          >
            Copy
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Dashboard;
