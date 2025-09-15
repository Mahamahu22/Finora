"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { removeUser } from "../utils/storage";
import Sidebar from "../components/SideBar";
import { useUser } from "../context/UserContext";

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

const DEFAULT_CURRENCY = "INR";

const RecordManager = ({ type = "income" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const [records, setRecords] = useState([]);
  const [linkedIncomes, setLinkedIncomes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // id when editing
  const [originalForm, setOriginalForm] = useState(null); // used to detect changes
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
  const [isSaving, setIsSaving] = useState(false);

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

  const currencyCode = user?.preferences?.currency ?? DEFAULT_CURRENCY;

  const formatter = useMemo(() => {
    const locale = currencyCode === "INR" ? "en-IN" : undefined;
    const maximumFractionDigits = currencyCode === "INR" ? 0 : 2;
    const nf = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits,
    });
    return (value) => nf.format(Number(value || 0));
  }, [currencyCode]);

  // Detect user locale for date display
  const userLocale = typeof navigator !== "undefined" ? navigator.language : "en-GB";
  const isUSLocale = userLocale === "en-US";

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString(isUSLocale ? "en-US" : "en-GB", options);
  };

  const parseInputDate = (inputDate) => {
    // inputDate is YYYY-MM-DD from input[type=date]
    return inputDate;
  };

  // Fetch records and linked incomes
  useEffect(() => {
    fetchRecords(page, rowsPerPage);
    if (type === "expense") fetchLinkedIncomes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, type, user]);

  const fetchRecords = async (pageNum = 0, limitNum = rowsPerPage) => {
    setLoading(true);
    try {
      const endpoint =
        type === "income"
          ? `/income?page=${pageNum + 1}&limit=${limitNum}`
          : `/expenses?page=${pageNum + 1}&limit=${limitNum}`;
      const res = await api.get(endpoint);
      const data = res?.data ?? {};
      const list = data.items ?? data.data ?? res?.data ?? [];
      setRecords(Array.isArray(list) ? list : []);
      setTotalRows(data.pagination?.total ?? data.total ?? (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      if (err?.response?.status === 401) {
        removeUser();
        router.push("/loginpage");
        return;
      }
      console.error("Error fetching records:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedIncomes = async () => {
    try {
      const res = await api.get("/income?page=1&limit=1000");
      const root = res?.data ?? {};
      const list = root.items ?? root.data ?? (Array.isArray(root) ? root : []);
      const enriched = Array.isArray(list)
        ? list.map((inc) => ({
            id: inc.id ?? inc._id,
            source: inc.source ?? inc.catOrSource ?? "",
            amount: Number(inc.amount ?? 0),
            expenses: Number(inc.expenses ?? 0),
            remaining:
              inc.remaining !== undefined
                ? Number(inc.remaining)
                : Number(inc.amount ?? 0) - Number(inc.expenses ?? 0),
          }))
        : [];
      setLinkedIncomes(enriched);
    } catch (err) {
      console.error("Error fetching incomes:", err);
      setLinkedIncomes([]);
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const normalizeForm = (f) => ({
    amount: String(Number(f.amount || 0)),
    category: String(f.category || ""),
    source: String(f.source || ""),
    note: String(f.note || ""),
    date: String(f.date || ""),
    incomeId: String(f.incomeId || ""),
  });

  const handleSave = async () => {
    try {
      const amountNum = Number(form.amount);
      if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
        setSnackbar({ open: true, message: "Amount is required and must be > 0", severity: "warning" });
        return;
      }
      if (type === "income" && (!form.source || form.source.trim() === "")) {
        setSnackbar({ open: true, message: "Source is required", severity: "warning" });
        return;
      }
      if (type === "expense" && (!form.category || form.category.trim() === "")) {
        setSnackbar({ open: true, message: "Category is required", severity: "warning" });
        return;
      }

      if (editing && originalForm) {
        if (JSON.stringify(normalizeForm(originalForm)) === JSON.stringify(normalizeForm(form))) {
          setSnackbar({ open: true, message: "No changes to save", severity: "info" });
          setOpen(false);
          setEditing(null);
          setOriginalForm(null);
          return;
        }
      }

      setIsSaving(true);
      const endpoint = type === "income" ? "/income" : "/expenses";
      const payload = {
        amount: amountNum,
        note: form.note || "",
        date: parseInputDate(form.date),
      };
      if (type === "income") payload.source = form.source;
      else {
        payload.category = form.category;
        if (form.incomeId) payload.incomeId = form.incomeId;
      }

      if (editing) await api.put(`${endpoint}/${editing}`, payload);
      else await api.post(endpoint, payload);

      setSnackbar({ open: true, message: `${type} ${editing ? "updated" : "added"} successfully!`, severity: "success" });
      await fetchRecords(page, rowsPerPage);
      setOpen(false);
      setEditing(null);
      setOriginalForm(null);
    } catch (err) {
      console.error("Error saving record:", err);
      setSnackbar({ open: true, message: err?.response?.data?.message || `Failed to save ${type}!`, severity: "error" });
    } finally {
      setIsSaving(false);
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
      setSnackbar({ open: true, message: `${type} deleted successfully!`, severity: "success" });
      await fetchRecords(page, rowsPerPage);
    } catch (err) {
      console.error("Error deleting record:", err);
      setSnackbar({ open: true, message: `Failed to delete ${type}!`, severity: "error" });
    } finally {
      setDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleOpen = async (record = null) => {
    if (type === "expense") await fetchLinkedIncomes();

    if (record) {
      const id = record.id ?? record._id;
      setEditing(id);
      const dateStr = record.date ? record.date.split("T")[0] : new Date().toISOString().split("T")[0];
      const incomeIdFromRecord = (record.income && (record.income.id || record.income._id)) || record.incomeId || "";

      const filledForm = {
        amount: record.amount ?? "",
        category: record.category ?? "",
        source: record.source ?? "",
        note: record.note ?? "",
        date: dateStr,
        incomeId: incomeIdFromRecord ?? "",
      };

      setForm(filledForm);
      setOriginalForm(filledForm);
    } else {
      setEditing(null);
      setOriginalForm(null);
      setForm({ amount: "", category: "", source: "", note: "", date: new Date().toISOString().split("T")[0], incomeId: "" });
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setOriginalForm(null);
  };

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar menuItems={menuItems} pathname={pathname} user={user} onNavigate={(path) => router.push(path)} />

      <Box flex={1} p={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{  fontWeight: "bold" }}>
            {type === "income" ? "Income Overview" : "Expense Overview"}
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ bgcolor: "#6b4226", "&:hover": { bgcolor: "#8d6e63" } }}>
            Add {type === "income" ? "Income" : "Expense"}
          </Button>
        </Box>

        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {type === "income" ? "Income Records" : "Expense Records"}
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : records.length === 0 ? (
              <Typography color="text.secondary">No {type} records yet.</Typography>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#6b4226" }}>
                      <TableCell sx={{ color: "white" }}>Date</TableCell>
                      {type === "income" ? (
                        <>
                          <TableCell sx={{ color: "white" }}>Source</TableCell>
                          <TableCell sx={{ color: "white" }}>Amount</TableCell>
                          <TableCell sx={{ color: "white" }}>Expenses</TableCell>
                          <TableCell sx={{ color: "white" }}>Remaining</TableCell>
                          <TableCell sx={{ color: "white" }}>Note</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ color: "white" }}>Category</TableCell>
                          <TableCell sx={{ color: "white" }}>Amount</TableCell>
                          <TableCell sx={{ color: "white" }}>Linked Income</TableCell>
                          <TableCell sx={{ color: "white" }}>Note</TableCell>
                        </>
                      )}
                      <TableCell sx={{ color: "white" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((rec) => {
                      const recId = rec.id ?? rec._id;
                      return (
                        <TableRow key={recId}>
                          <TableCell>{formatDisplayDate(rec.date)}</TableCell>
                          {type === "income" ? (
                            <>
                              <TableCell>{rec.source}</TableCell>
                              <TableCell>{formatter(rec.amount)}</TableCell>
                              <TableCell>{formatter(rec.expenses || 0)}</TableCell>
                              <TableCell>{formatter(rec.remaining ?? rec.amount - (rec.expenses || 0))}</TableCell>
                              <TableCell>{rec.note}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{rec.category}</TableCell>
                              <TableCell>{formatter(rec.amount)}</TableCell>
                              <TableCell>{rec.income ? `${rec.income.source} - ${formatter(rec.income.remaining ?? rec.income.amount)}` : "-"}</TableCell>
                              <TableCell>{rec.note}</TableCell>
                            </>
                          )}
                          <TableCell>
                            <IconButton onClick={() => handleOpen(rec)} sx={{ color: "#6b4226" }}>
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => confirmDelete(recId)} sx={{ color: "red" }}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
          <DialogTitle sx={{ bgcolor: "#f0c27b", color: "#6b4226" }}>{editing ? `Edit ${type}` : `Add New ${type}`}</DialogTitle>
          <DialogContent>
            <TextField
              label="Amount (required number)"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              inputProps={{ min: 0, step: "0.01" }}
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
                required
              >
                <MenuItem value="">-- Select --</MenuItem>
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
                  required
                >
                  <MenuItem value="">-- Select --</MenuItem>
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
                  {linkedIncomes.length > 0
                    ? linkedIncomes.map((inc) => (
                        <MenuItem key={inc.id} value={inc.id}>
                          {inc.source} - {formatter(inc.amount)} (Remaining: {formatter(inc.remaining)})
                        </MenuItem>
                      ))
                    : <MenuItem disabled>No incomes available</MenuItem>}
                </TextField>
              </>
            )}

            <TextField
              label="Note (optional)"
              name="note"
              value={form.note}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Date(MM-DD-YYYY)"
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
            <Button onClick={handleClose} sx={{ color: "#6b4226" }} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#6b4226" }} disabled={isSaving}>
              {isSaving ? "Saving..." : `Save ${type === "income" ? "Income" : "Expense"}`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete */}
        <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this {type} record?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
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