package com.spendix.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.spendix.backend.dto.CategorySummaryDto;
import com.spendix.backend.dto.ReportDtos.*;
import com.spendix.backend.entity.Expense;
import com.spendix.backend.entity.Income;
import com.spendix.backend.entity.User;
import com.spendix.backend.repository.ExpenseRepository;
import com.spendix.backend.repository.IncomeRepository;
import com.spendix.backend.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ReportService(IncomeRepository incomeRepository,
                         ExpenseRepository expenseRepository,
                         UserRepository userRepository) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public ReportSummaryResponse getReportSummary(Long userId, LocalDate startDate, LocalDate endDate, String categoryFilter) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<Income> incomes = incomeRepository.findByUserAndDateBetween(user, startDate, endDate);
        List<Expense> expenses = expenseRepository.findByUserAndDateBetween(user, startDate, endDate);

        if (categoryFilter != null && !categoryFilter.isBlank() && !"ALL".equalsIgnoreCase(categoryFilter)) {
            incomes = incomes.stream()
                    .filter(i -> i.getCategory() != null && categoryFilter.equalsIgnoreCase(i.getCategory().getName()))
                    .collect(Collectors.toList());
            expenses = expenses.stream()
                    .filter(e -> e.getCategory() != null && categoryFilter.equalsIgnoreCase(e.getCategory().getName()))
                    .collect(Collectors.toList());
        }

        double totalIncome = incomes.stream().mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0).sum();
        double totalExpense = expenses.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();
        double netBalance = totalIncome - totalExpense;

        // Group category summary
        Map<String, CategorySummaryDto> catMap = new LinkedHashMap<>();
        for (Expense e : expenses) {
            String catName = e.getCategory() != null ? e.getCategory().getName() : "Uncategorized";
            String icon = e.getCategory() != null ? e.getCategory().getIcon() : "📦";
            String color = e.getCategory() != null ? e.getCategory().getColor() : "#6b7280";
            double amount = e.getAmount() != null ? e.getAmount() : 0.0;

            if (catMap.containsKey(catName)) {
                CategorySummaryDto existing = catMap.get(catName);
                catMap.put(catName, new CategorySummaryDto(catName, icon, color, existing.amount() + amount));
            } else {
                catMap.put(catName, new CategorySummaryDto(catName, icon, color, amount));
            }
        }
        List<CategorySummaryDto> categorySummaries = new ArrayList<>(catMap.values());

        // Build combined transactions
        List<TransactionItem> transactions = new ArrayList<>();
        for (Income i : incomes) {
            transactions.add(new TransactionItem(
                    i.getId(),
                    "INCOME",
                    i.getTitle(),
                    i.getAmount(),
                    i.getCategory() != null ? i.getCategory().getName() : "Income",
                    i.getDate(),
                    "-",
                    "-"
            ));
        }
        for (Expense e : expenses) {
            transactions.add(new TransactionItem(
                    e.getId(),
                    "EXPENSE",
                    e.getTitle(),
                    e.getAmount(),
                    e.getCategory() != null ? e.getCategory().getName() : "Expense",
                    e.getDate(),
                    e.getPaymentMethod() != null ? e.getPaymentMethod() : "-",
                    e.getMerchant() != null ? e.getMerchant() : "-"
            ));
        }

        transactions.sort(Comparator.comparing(TransactionItem::date).reversed());

        return new ReportSummaryResponse(
                startDate,
                endDate,
                totalIncome,
                totalExpense,
                netBalance,
                transactions.size(),
                categorySummaries,
                transactions
        );
    }

    public byte[] generatePdfReport(Long userId, LocalDate startDate, LocalDate endDate, String categoryFilter) {
        ReportSummaryResponse summary = getReportSummary(userId, startDate, endDate, categoryFilter);
        User user = userRepository.findById(userId).orElseThrow();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(212, 175, 55)); // Gold/Dark Gold accent
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(148, 163, 184));
            Font sectionHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(30, 41, 59));
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 65, 85));
            Font boldCellFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(30, 41, 59));

            // Header section
            Paragraph title = new Paragraph("SPENDIX FINANCIAL REPORT", titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            document.add(title);

            Paragraph sub = new Paragraph("Statement Period: " + summary.startDate() + " to " + summary.endDate() +
                    "  |  Account Holder: " + (user.getName() != null ? user.getName() : user.getEmail()), subTitleFont);
            sub.setSpacingAfter(15);
            document.add(sub);

            // Financial Summary KPI Cards Table
            PdfPTable summaryTable = new PdfPTable(3);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(20);

            addKpiCell(summaryTable, "Total Income", String.format("$%.2f", summary.totalIncome()), new Color(16, 185, 129));
            addKpiCell(summaryTable, "Total Expenses", String.format("$%.2f", summary.totalExpense()), new Color(239, 68, 68));
            addKpiCell(summaryTable, "Net Balance", String.format("$%.2f", summary.netBalance()),
                    summary.netBalance() >= 0 ? new Color(16, 185, 129) : new Color(239, 68, 68));

            document.add(summaryTable);

            // Category Summary Section
            if (!summary.categorySummaries().isEmpty()) {
                Paragraph catHeading = new Paragraph("Expense Summary by Category", sectionHeaderFont);
                catHeading.setSpacingAfter(8);
                document.add(catHeading);

                PdfPTable catTable = new PdfPTable(3);
                catTable.setWidthPercentage(100);
                catTable.setWidths(new float[]{4, 3, 3});
                catTable.setSpacingAfter(20);

                addTableHeaderCell(catTable, "Category", tableHeaderFont, new Color(30, 41, 59));
                addTableHeaderCell(catTable, "Amount Spent", tableHeaderFont, new Color(30, 41, 59));
                addTableHeaderCell(catTable, "% of Total Expenses", tableHeaderFont, new Color(30, 41, 59));

                for (CategorySummaryDto cat : summary.categorySummaries()) {
                    double pct = summary.totalExpense() > 0 ? (cat.amount() / summary.totalExpense()) * 100 : 0;

                    PdfPCell c1 = new PdfPCell(new Phrase(cat.icon() + " " + cat.category(), cellFont));
                    c1.setPadding(6);
                    catTable.addCell(c1);

                    PdfPCell c2 = new PdfPCell(new Phrase(String.format("$%.2f", cat.amount()), cellFont));
                    c2.setPadding(6);
                    catTable.addCell(c2);

                    PdfPCell c3 = new PdfPCell(new Phrase(String.format("%.1f%%", pct), cellFont));
                    c3.setPadding(6);
                    catTable.addCell(c3);
                }

                document.add(catTable);
            }

            // Transactions Table Section
            Paragraph transHeading = new Paragraph("Transaction Ledger (" + summary.totalTransactions() + " items)", sectionHeaderFont);
            transHeading.setSpacingAfter(8);
            document.add(transHeading);

            PdfPTable transTable = new PdfPTable(6);
            transTable.setWidthPercentage(100);
            transTable.setWidths(new float[]{2, 1.5f, 4, 2.5f, 2, 2});

            addTableHeaderCell(transTable, "Date", tableHeaderFont, new Color(30, 41, 59));
            addTableHeaderCell(transTable, "Type", tableHeaderFont, new Color(30, 41, 59));
            addTableHeaderCell(transTable, "Title", tableHeaderFont, new Color(30, 41, 59));
            addTableHeaderCell(transTable, "Category", tableHeaderFont, new Color(30, 41, 59));
            addTableHeaderCell(transTable, "Method", tableHeaderFont, new Color(30, 41, 59));
            addTableHeaderCell(transTable, "Amount", tableHeaderFont, new Color(30, 41, 59));

            boolean alternate = false;
            for (TransactionItem item : summary.recentTransactions()) {
                Color rowBg = alternate ? new Color(248, 250, 252) : Color.WHITE;
                alternate = !alternate;

                addStyledCell(transTable, item.date().toString(), cellFont, rowBg);

                Font typeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9,
                        "INCOME".equals(item.type()) ? new Color(16, 185, 129) : new Color(239, 68, 68));
                addStyledCell(transTable, item.type(), typeFont, rowBg);

                addStyledCell(transTable, item.title(), boldCellFont, rowBg);
                addStyledCell(transTable, item.category(), cellFont, rowBg);
                addStyledCell(transTable, item.paymentMethod(), cellFont, rowBg);

                String amtStr = ("INCOME".equals(item.type()) ? "+$" : "-$") + String.format("%.2f", item.amount());
                addStyledCell(transTable, amtStr, typeFont, rowBg);
            }

            document.add(transTable);

            // Footer
            Paragraph footer = new Paragraph("\nGenerated automatically by Spendix App on " +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")), subTitleFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }

        return out.toByteArray();
    }

    private void addKpiCell(PdfPTable table, String label, String value, Color color) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(10);
        cell.setBackgroundColor(new Color(241, 245, 249));

        Paragraph pLabel = new Paragraph(label, FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(100, 116, 139)));
        Paragraph pValue = new Paragraph(value, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, color));

        cell.addElement(pLabel);
        cell.addElement(pValue);
        table.addCell(cell);
    }

    private void addTableHeaderCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(7);
        table.addCell(cell);
    }

    private void addStyledCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        table.addCell(cell);
    }

    public byte[] generateExcelReport(Long userId, LocalDate startDate, LocalDate endDate, String categoryFilter) throws IOException {
        ReportSummaryResponse summary = getReportSummary(userId, startDate, endDate, categoryFilter);

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Spendix Report");

            // Cell styles
            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleStyle.setFont(titleFont);

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.NAVY.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle currencyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            currencyStyle.setDataFormat(format.getFormat("$#,##0.00"));

            CellStyle incomeStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font incFont = workbook.createFont();
            incFont.setColor(IndexedColors.GREEN.getIndex());
            incFont.setBold(true);
            incomeStyle.setFont(incFont);
            incomeStyle.setDataFormat(format.getFormat("$#,##0.00"));

            CellStyle expenseStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font expFont = workbook.createFont();
            expFont.setColor(IndexedColors.RED.getIndex());
            expFont.setBold(true);
            expenseStyle.setFont(expFont);
            expenseStyle.setDataFormat(format.getFormat("$#,##0.00"));

            int rowIdx = 0;

            // Title Row
            Row titleRow = sheet.createRow(rowIdx++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("SPENDIX FINANCIAL STATEMENT");
            titleCell.setCellStyle(titleStyle);

            // Period Subtitle
            Row subRow = sheet.createRow(rowIdx++);
            subRow.createCell(0).setCellValue("Period: " + summary.startDate() + " to " + summary.endDate());

            rowIdx++; // Blank row

            // Summary Section
            Row sumHeaderRow = sheet.createRow(rowIdx++);
            Cell sumCell = sumHeaderRow.createCell(0);
            sumCell.setCellValue("SUMMARY METRICS");
            sumCell.setCellStyle(headerStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 1));

            Row r1 = sheet.createRow(rowIdx++);
            r1.createCell(0).setCellValue("Total Income");
            Cell c1 = r1.createCell(1);
            c1.setCellValue(summary.totalIncome());
            c1.setCellStyle(incomeStyle);

            Row r2 = sheet.createRow(rowIdx++);
            r2.createCell(0).setCellValue("Total Expenses");
            Cell c2 = r2.createCell(1);
            c2.setCellValue(summary.totalExpense());
            c2.setCellStyle(expenseStyle);

            Row r3 = sheet.createRow(rowIdx++);
            r3.createCell(0).setCellValue("Net Savings / Balance");
            Cell c3 = r3.createCell(1);
            c3.setCellValue(summary.netBalance());
            c3.setCellStyle(currencyStyle);

            rowIdx++; // Blank row

            // Transactions Header Row
            Row tableHeader = sheet.createRow(rowIdx++);
            String[] headers = {"Date", "Type", "Title", "Category", "Payment Method", "Merchant", "Amount"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = tableHeader.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            for (TransactionItem item : summary.recentTransactions()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.date().toString());
                row.createCell(1).setCellValue(item.type());
                row.createCell(2).setCellValue(item.title());
                row.createCell(3).setCellValue(item.category());
                row.createCell(4).setCellValue(item.paymentMethod());
                row.createCell(5).setCellValue(item.merchant());

                Cell amtCell = row.createCell(6);
                amtCell.setCellValue("INCOME".equals(item.type()) ? item.amount() : -item.amount());
                amtCell.setCellStyle("INCOME".equals(item.type()) ? incomeStyle : expenseStyle);
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
