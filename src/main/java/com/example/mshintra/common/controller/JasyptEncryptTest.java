//package com.example.mshintra.common.controller;
//
//import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
//import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
//
//public class JasyptEncryptTest {
//
//    public static void main(String[] args) {
//        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
//
//        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
//        config.setPassword("");   여기 암호화 키
//        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
//        config.setKeyObtentionIterations("1000");
//        config.setPoolSize("1");
//        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
//        config.setStringOutputType("base64");
//
//        encryptor.setConfig(config);
//
//        String encrypted = encryptor.encrypt(""); 여기 암호화 할 코드
//        String decrypted = encryptor.decrypt(encrypted);
//
//        System.out.println("encrypted = " + encrypted);
//        System.out.println("decrypted = " + decrypted);
//    }
//}