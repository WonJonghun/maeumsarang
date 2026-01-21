package com.example.mshintra.common.util;

public final class CmUtil {

    private CmUtil() {}

    public static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    public static String trim(String s) {
        return s == null ? "" : s.trim();
    }
}
