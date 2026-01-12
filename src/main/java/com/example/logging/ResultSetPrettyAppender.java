package com.example.logging;

import ch.qos.logback.core.AppenderBase;
import ch.qos.logback.classic.spi.ILoggingEvent;

public class ResultSetPrettyAppender extends AppenderBase<ILoggingEvent> {

    private int maxValueLength = 50;
    public void setMaxValueLength(int maxValueLength) { this.maxValueLength = maxValueLength; }

    @Override
    protected void append(ILoggingEvent event) {
        String msg = event.getFormattedMessage();
        String processed = processMessage(msg);
        System.out.println(processed);
    }

    private String processMessage(String msg) {
        StringBuilder sb = new StringBuilder();
        String[] lines = msg.split("\\r?\\n");
        int[] colWidths = null;

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            boolean isTableLine = line.startsWith("|") && line.endsWith("|");
            String tmp = line.replace("|", "");
            boolean isSeparator = isTableLine && tmp.replace("-", "").trim().isEmpty();

            if (isTableLine) {
                if (isSeparator) {
                    if (colWidths == null && i + 1 < lines.length) {
                        String next = lines[i + 1];
                        boolean nextIsTableLine = next.startsWith("|") && next.endsWith("|");
                        String nextTmp = next.replace("|", "");
                        boolean nextIsSeparator = nextIsTableLine && nextTmp.replace("-", "").trim().isEmpty();
                        if (nextIsTableLine && !nextIsSeparator) colWidths = computeColumnWidths(next);
                    }
                    if (colWidths != null) sb.append(buildSeparator(colWidths)).append(System.lineSeparator());
                    else sb.append(line).append(System.lineSeparator());
                } else {
                    if (colWidths == null) colWidths = computeColumnWidths(line);
                    sb.append(formatRow(line, colWidths)).append(System.lineSeparator());
                }
            } else {
                colWidths = null;
                sb.append(line).append(System.lineSeparator());
            }
        }
        return sb.toString();
    }

    private int[] computeColumnWidths(String line) {
        String[] parts = line.split("\\|", -1);
        int colCount = parts.length - 2;
        int[] widths = new int[colCount];
        for (int i = 0; i < colCount; i++) {
            String v = parts[i + 1].trim();
            if (v.length() > maxValueLength) v = v.substring(0, maxValueLength) + "...";
            widths[i] = v.length() + 2;
        }
        return widths;
    }

    private String formatRow(String line, int[] colWidths) {
        String[] parts = line.split("\\|", -1);
        int colCount = colWidths.length;
        StringBuilder row = new StringBuilder("|");

        for (int i = 0; i < colCount; i++) {
            String raw = (i + 1 < parts.length - 1) ? parts[i + 1].trim() : "";
            String v = (raw == null || raw.isEmpty()) ? "null" : raw;
            row.append(' ').append(v).append(' ').append('|');
        }
        return row.toString();
    }

    private String buildSeparator(int[] colWidths) {
        StringBuilder sep = new StringBuilder("|");
        for (int width : colWidths) {
            for (int i = 0; i < width; i++) sep.append('-');
            sep.append('|');
        }
        return sep.toString();
    }
}
