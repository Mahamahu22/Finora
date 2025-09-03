"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Alert,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

import api from "../utils/api";
import { getUser, removeUser } from "../utils/storage";
import Sidebar from "./SideBar";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Other",
];
const INCOME_SOURCES = ["Salary", "Business", "Freelance", "Gift", "Other"];

const RecordManager = ({ type }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  const [records, setRecords] = useState([]);
  const [linkedIncomes, setLinkedIncomes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRows, setTotalRows] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    amount: "",
    category: "",
    source: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    incomeId: "",
  });

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Income", icon: <AttachMoneyIcon />, path: "/income" },
    { text: "Expenses", icon: <MoneyOffIcon />, path: "/expenses" },
    { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  // Fetch data
  useEffect(() => {
    const stored = getUser();
    if (stored?.user) setUser(stored.user);
    fetchRecords(page, rowsPerPage);
    if (type === "expense") fetchLinkedIncomes();
  }, [page, rowsPerPage, type]);

  const fetchRecords = async (pageNum = 0, limitNum = rowsPerPage) => {
    setLoading(true);
    try {
      const endpoint =
        type === "income"
          ? `/income?page=${pageNum + 1}&limit=${limitNum}`
          : `/expenses?page=${pageNum + 1}&limit=${limitNum}`;
      const res = await api.get(endpoint);
      setRecords(res.data.data || res.data.items || []);
      setTotalRows(res.data.pagination?.total || 0);
    } catch (err) {
      if (err?.response?.status === 401) {
        removeUser();
        router.push("/loginpage");
        return;
      }
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedIncomes = async () => {
    try {
      const res = await api.get("/income?page=1&limit=1000");

      const root = res?.data ?? {};
      const list =
        root.items ??
        root.data ??
        root.data?.items ??
        (Array.isArray(root) ? root : []) ??
        [];

      const enriched = list.map((inc) => ({
        id: inc.id,
        source: inc.source ?? "",
        amount: Number(inc.amount || 0),
        expenses: Number(inc.expenses || 0),
        remaining:
          inc.remaining !== undefined
            ? Number(inc.remaining)
            : Number(inc.amount || 0) - Number(inc.expenses || 0),
      }));

      setLinkedIncomes(enriched);
    } catch (err) {
      console.error("Error fetching incomes:", err);
      setLinkedIncomes([]);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const endpoint = type === "income" ? "/income" : "/expenses";
      let payload = {
        amount: Number(form.amount),
        note: form.note,
        date: form.date,
      };
      if (type === "income") payload.source = form.source;
      else {
        payload.category = form.category;
        if (form.incomeId) payload.incomeId = form.incomeId;
      }

      if (editing) await api.put(`${endpoint}/${editing}`, payload);
      else await api.post(endpoint, payload);

      setSnackbar({
        open: true,
        message: `${type} ${editing ? "updated" : "added"} successfully!`,
        severity: "success",
      });
      fetchRecords(page, rowsPerPage);
      handleClose();
    } catch (err) {
      console.error("Error saving record:", err);
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.message || `Failed to save ${type}!`,
        severity: "error",
      });
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const endpoint = type === "income" ? "/income" : "/expenses";
      await api.delete(`${endpoint}/${deleteId}`);
      setSnackbar({
        open: true,
        message: `${type} deleted successfully!`,
        severity: "success",
      });
      fetchRecords(page, rowsPerPage);
    } catch (err) {
      console.error("Error deleting record:", err);
      setSnackbar({
        open: true,
        message: `Failed to delete ${type}!`,
        severity: "error",
      });
    } finally {
      setDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleOpen = async (record = null) => {
    if (type === "expense") {
      await fetchLinkedIncomes();
    }

    if (record) {
      setEditing(record._id || record.id);
      setForm({
        amount: record.amount,
        category: record.category || "",
        source: record.source || "",
        note: record.note,
        date: record.date.split("T")[0],
        incomeId: record.income
          ? record.income.id || record.income._id
          : "",
      });
    } else {
      setEditing(null);
      setForm({
        amount: "",
        category: "",
        source: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
        incomeId: "",
      });
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  return (
    <Box display="flex" bgcolor="#ceb097ff" minHeight="100vh">
      <Sidebar
  menuItems={menuItems}
  pathname={pathname}
  user={user}
  onNavigate={(path) => router.push(path)}   // ✅ wrap it
/>

      <Box flex={1} p={3}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h5"
            sx={{ color: "#6b4226", fontWeight: "bold" }}
          >
            {type === "income" ? "Income Overview" : "Expense Overview"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            sx={{ bgcolor: "#6b4226", "&:hover": { bgcolor: "#8d6e63" } }}
          >
            Add {type === "income" ? "Income" : "Expense"}
          </Button>
        </Box>

        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ color: "#6b4226", mb: 2 }}
            >
              {type === "income" ? "Income Records" : "Expense Records"}
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : records.length === 0 ? (
              <Typography color="text.secondary">
                No {type} records yet.
              </Typography>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#6b4226" }}>
                      <TableCell sx={{ color: "white" }}>Date</TableCell>
                      {type === "income" ? (
                        <>
                          <TableCell sx={{ color: "white" }}>
                            Source
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Amount
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Expenses
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Remaining
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Note
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ color: "white" }}>
                            Category
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Amount
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Linked Income
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Note
                          </TableCell>
                        </>
                      )}
                      <TableCell sx={{ color: "white" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((rec) => (
                      <TableRow key={rec._id || rec.id}>
                        <TableCell>
                          {new Date(rec.date).toLocaleDateString("en-GB")}
                        </TableCell>
                        {type === "income" ? (
                          <>
                            <TableCell>{rec.source}</TableCell>
                            <TableCell>₹{rec.amount}</TableCell>
                            <TableCell>₹{rec.expenses || 0}</TableCell>
                            <TableCell>
                              ₹
                              {rec.remaining !== undefined
                                ? rec.remaining
                                : rec.amount - (rec.expenses || 0)}
                            </TableCell>
                            <TableCell>{rec.note}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{rec.category}</TableCell>
                            <TableCell>₹{rec.amount}</TableCell>
                            <TableCell>
                              {rec.income
                                ? `${rec.income.source} - ₹${
                                    rec.income.remaining !== undefined
                                      ? rec.income.remaining
                                      : rec.income.amount || 0
                                  }`
                                : "-"}
                            </TableCell>
                            <TableCell>{rec.note}</TableCell>
                          </>
                        )}
                        <TableCell>
                          <IconButton
                            onClick={() => handleOpen(rec)}
                            sx={{ color: "#6b4226" }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => confirmDelete(rec._id || rec.id)}
                            sx={{ color: "red" }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <TablePagination
                    component="div"
                    count={totalRows}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                  />
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#f0c27b", color: "#6b4226" }}>
            {editing ? `Edit ${type}` : `Add New ${type}`}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            {type === "income" ? (
              <TextField
                select
                label="Source"
                name="source"
                value={form.source}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                {INCOME_SOURCES.map((src) => (
                  <MenuItem key={src} value={src}>
                    {src}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <>
                <TextField
                  select
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Linked Income (optional)"
                  name="incomeId"
                  value={form.incomeId}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                >
                  <MenuItem value="">None</MenuItem>
                  {linkedIncomes.length > 0 ? (
                    linkedIncomes.map((inc) => (
                      <MenuItem key={inc.id} value={inc.id}>
                        {inc.source} - ₹{inc.amount} (Remaining: ₹
                        {inc.remaining})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No incomes available</MenuItem>
                  )}
                </TextField>
              </>
            )}
            <TextField
              label="Note"
              name="note"
              value={form.note}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} sx={{ color: "#6b4226" }}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{ bgcolor: "#6b4226" }}
            >
              Save {type === "income" ? "Income" : "Expense"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete */}
        <Dialog
          open={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this {type} record?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default RecordManager;
