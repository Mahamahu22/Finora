"use client";
import React, { useEffect, useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Card, CardContent, Typography, CircularProgress, Box } from "@mui/material";
import api from "../utils/api";
import dayjs from "dayjs";

// ✅ helper to format date as dd.mm.yyyy
const formatDateDMY = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const Reports = ({ type, data, exportScope, startDate, endDate, formatter }) => {
  const [exportData, setExportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch export data if exportScope is provided
  useEffect(() => {
    let mounted = true;
    const fetchExportData = async () => {
      if (!exportScope) return;
      if (!startDate || !endDate) return;

      setLoading(true);
      try {
        const res = await api.get("/reports/export", {
          params: {
            scope: exportScope,
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
          },
        });
        if (mounted) {
          if (res?.data?.status === "success") {
            setExportData(res.data.data || []);
          } else {
            setExportData([]);
          }
        }
      } catch (err) {
        console.error("Reports fetchExportData error:", err);
        if (mounted) setExportData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchExportData();
    return () => {
      mounted = false;
    };
  }, [exportScope, startDate, endDate]);

  // Show loading for export table
  if (exportScope && loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const tableData = exportScope ? exportData : data || [];

  // compute totals (for preview)
  const totals = tableData.reduce(
    (acc, row) => {
      const rtype = row.type || (row.source ? "Income" : row.category ? "Expense" : "Expense");
      const amount = Number(row.amount || 0);
      if (rtype.toLowerCase() === "income") acc.income += amount;
      else acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {exportScope ? "Export Preview" : type === "monthly" ? "Monthly Summary" : "Category Totals"}
          </Typography>

          {exportScope && (
            <Box textAlign="right">
              <Typography variant="body2" fontWeight="bold">
                Total Income: {formatter ? formatter(totals.income) : totals.income}
              </Typography>

              <Typography variant="body2" fontWeight="bold">
                Total Expense: {formatter ? formatter(totals.expense) : totals.expense}
              </Typography>

              <Typography variant="body2" fontWeight="bold">
                Net balance: {formatter ? formatter(totals.income - totals.expense) : totals.income - totals.expense}
              </Typography>
            </Box>
          )}
        </Box>

        {tableData.length === 0 ? (
          <Typography>No records found for this range.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {exportScope ? (
                  <>
                    <TableCell sx={{ width: "15%" }}>Date</TableCell>
                    <TableCell sx={{ width: "15%" }}>Type</TableCell>
                    <TableCell sx={{ width: "15%" , pr: 6 }} align="right" >
                      Amount
                    </TableCell>
                    <TableCell sx={{ width: "25%" }}>Category / Source</TableCell>
                    <TableCell sx={{ width: "30%" }}>Note</TableCell>
                  </>
                ) : type === "monthly" ? (
                  <>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Income</TableCell>
                    <TableCell align="right">Expenses</TableCell>
                    <TableCell align="right">Net Balance</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, idx) =>
                exportScope ? (
                  <TableRow key={row.id || row._id || idx}>
                    <TableCell>{formatDateDMY(row.date)}</TableCell>
                    <TableCell>{row.type || (row.source ? "Income" : "Expense")}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ pr: 6 }}
                      style={{
                        color: (row.type || (row.source ? "Income" : "Expense")).toLowerCase() === "income" ? "green" : "red",
                      }}
                    >
                      {formatter ? formatter(row.amount || 0) : row.amount || 0}
                    </TableCell>
                    <TableCell>{row.category || row.source || "-"}</TableCell>
                    <TableCell>{row.note || "-"}</TableCell>
                  </TableRow>
                ) : type === "monthly" ? (
                  <TableRow key={idx}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell align="right" style={{ color: "green" }}>
                      {formatter ? formatter(row.income) : row.income}
                    </TableCell>
                    <TableCell align="right" style={{ color: "red" }}>
                      {formatter ? formatter(row.expenses) : row.expenses}
                    </TableCell>
                    <TableCell align="right" style={{ color: row.net >= 0 ? "green" : "red" }}>
                      {formatter ? formatter(row.net) : row.net}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={idx}>
                    <TableCell>{row.category}</TableCell>
                    <TableCell align="right">{formatter ? formatter(row.total) : row.total}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default Reports;
