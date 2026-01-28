import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { BackupInfoDTO } from '../../types/backup';
import { applySnapshot, createSnapshot, deleteSnapshot, getListSnapshots } from '../../api/backup';
import { showErrorToast, showSuccessToast } from '../../utils';
import { formatDate } from '../../utils/helper';
import { useDispatch } from 'react-redux';
import { AppDispatch, endLoadingStatus, startLoadingStatus, useAppContext } from '../../stores';

const ManageBackup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const context = useAppContext();

  const [snapshots, setSnapshots] = useState<BackupInfoDTO[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');

  useEffect(() => {
    handleRefreshList();
  }, []);

  const handleCreateSnapshot = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setSnapshotName('');
  };

  const handleConfirmCreate = async () => {
    dispatch(startLoadingStatus());
    handleCloseDialog();
    const res = await createSnapshot(snapshotName.trim());
    if (res.isSuccess) {
      handleRefreshList();
      showSuccessToast("Tạo snapshot thành công! (" + res.data! + ")");
    } else {
      showErrorToast(res.message || "Tạo mới snapshot thất bại");
    }
    dispatch(endLoadingStatus());
  };

  const handleApplySnapshot = async (snapshot: BackupInfoDTO) => {
    context?.showConfirmDialog({
      message: "Xác nhận backup với snapshot này?",
      onConfirm: async () => {
        dispatch(startLoadingStatus());
        const res = await applySnapshot(snapshot.name);
        if (res.isSuccess) {
          showSuccessToast("Áp dụng snapshot thành công!");
        } else {
          showErrorToast(res.message || "Cập nhật snapshot thất bại");
        }
        dispatch(endLoadingStatus());
      },
      onReject: () => {}
    });
  };

  const handleDeleteSnapshot = async (snapshot: BackupInfoDTO) => {
    context?.showConfirmDialog({
      message: "Xác nhận xóa snapshot này?",
      onConfirm: async () => {
        dispatch(startLoadingStatus());
        const res = await deleteSnapshot(snapshot.name);
        if (res.isSuccess) {
          setSnapshots(prev => {
            return [
              ... prev.filter(s => s.name != res.data!)
            ]
          })
          showSuccessToast("Xóa snapshot thành công!");
        } else {
          showErrorToast(res.message || "Xóa snapshot thất bại");
        }
        dispatch(endLoadingStatus());
      },
      onReject: () => {}
    });
  };

  const handleRefreshList = async () => {
    dispatch(startLoadingStatus());
    const res = await getListSnapshots();
    if (res.isSuccess) {
      setSnapshots(res.data!);
    } else {
      showErrorToast(res.message || "Lấy danh sách snapshot thất bại");
    }
    dispatch(endLoadingStatus());
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box>
        {/* Header Section */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Quản lý Backup
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshList}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSnapshot}
            >
              Tạo Snapshot
            </Button>
          </Stack>
        </Box>

        {/* Snapshots Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="snapshots table">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>STT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tên Snapshot</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày tạo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Kích thước</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {snapshots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      Chưa có snapshot nào. Hãy tạo snapshot đầu tiên!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                snapshots.map((snapshot, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    hover
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {snapshot.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(snapshot.createdAt, "HH:mm:ss dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Chip label={snapshot.size + ""} size="small" color="info" />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          color="primary"
                          aria-label="apply snapshot"
                          onClick={() => handleApplySnapshot(snapshot)}
                          title="Khôi phục snapshot này"
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          aria-label="delete snapshot"
                          onClick={() => handleDeleteSnapshot(snapshot)}
                          title="Xóa snapshot"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary Section */}
        {snapshots.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Tổng số snapshot: <strong>{snapshots.length}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng dung lượng: <strong>{snapshots.reduce((acc, s) => acc + s.size, 0)} MB</strong>
            </Typography>
          </Box>
        )}
      </Box>

      {/* Create Snapshot Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo Snapshot Mới</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên Snapshot"
            type="text"
            fullWidth
            variant="outlined"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            placeholder="Nhập tên snapshot..."
            helperText="Ví dụ: backup_2026_01_21"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& input': {
                  outline: 'none',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
                '&:focus-within': {
                  outline: 'none',
                },
              },
              '& input:focus': {
                outline: 'none',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmCreate} 
            variant="contained" 
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageBackup;
