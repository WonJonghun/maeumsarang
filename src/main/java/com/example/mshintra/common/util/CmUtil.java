package com.example.mshintra.common.util;

import java.util.Map;

public final class CmUtil {

    private CmUtil() {}

    public static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    public static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    public static String str(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    public static Integer toInt(Object v) {
        if (v == null) return null;
        try { return Integer.valueOf(String.valueOf(v)); } catch (Exception e) { return null; }
    }

    public static Object getIgnoreCase(Map<String, Object> map, String key) {
        if (map == null || key == null) return null;
        if (map.containsKey(key)) return map.get(key);
        for (String k : map.keySet()) {
            if (k != null && k.equalsIgnoreCase(key)) return map.get(k);
        }
        return null;
    }

    public static Object getAny(Map<String, Object> map, String... keys) {
        if (map == null || keys == null) return null;
        for (String k : keys) {
            Object v = getIgnoreCase(map, k);
            if (v != null) return v;
        }
        return null;
    }
}