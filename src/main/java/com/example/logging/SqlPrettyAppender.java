package com.example.logging;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import com.github.vertical_blank.sqlformatter.SqlFormatter;
import com.github.vertical_blank.sqlformatter.languages.Dialect;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;

public class SqlPrettyAppender extends AppenderBase<ILoggingEvent> {

    private static final String TAIL_MARK = " {executed";

    @Override
    protected void append(ILoggingEvent event) {
        String logger = event.getLoggerName();
        if (!"jdbc.sqltiming".equals(logger) && !"jdbc.sqlonly".equals(logger)) return;

        String msg = event.getFormattedMessage();
        int idx = msg.indexOf(TAIL_MARK);
        String sql  = (idx >= 0) ? msg.substring(0, idx) : msg;
        String tail = (idx >= 0) ? msg.substring(idx)   : "";

        String pretty = prettyFormat(sql);
        System.out.println(pretty + tail);
    }

    private static String prettyFormat(String sql) {
        try {
            Method m = SqlFormatter.class.getMethod("format", String.class, Dialect.class);
            return (String) m.invoke(null, sql, Dialect.TSql);
        } catch (Throwable ignore) {}

        try {
            Method of = SqlFormatter.class.getMethod("of", Dialect.class);
            Object formatter = of.invoke(null, Dialect.TSql);
            Method format = formatter.getClass().getMethod("format", String.class);
            return (String) format.invoke(formatter, sql);
        } catch (Throwable ignore) {}

        try {
            Constructor<?> ctor = SqlFormatter.class.getConstructor(Dialect.class);
            Object formatter = ctor.newInstance(Dialect.TSql);
            Method format = formatter.getClass().getMethod("format", String.class);
            return (String) format.invoke(formatter, sql);
        } catch (Throwable ignore) {}

        return sql;
    }
}
