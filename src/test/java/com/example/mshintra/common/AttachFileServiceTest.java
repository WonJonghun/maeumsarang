package com.example.mshintra.common;

import com.example.mshintra.common.controller.AttachFileController;
import com.example.mshintra.common.dto.AttachFileDto;
import com.example.mshintra.common.mapper.AttachFileMapper;
import com.example.mshintra.common.service.AttachFileService;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AttachFileServiceTest {

    @TempDir
    Path directory;
    private AttachFileMapper mapper;
    private AttachFileService service;
    private Path photo;

    @BeforeEach
    void setUp() throws Exception {
        mapper = mock(AttachFileMapper.class);
        service = new AttachFileService(mapper);
        ReflectionTestUtils.setField(service, "nasBaseDir", directory.toString());
        photo = Files.createDirectory(directory.resolve("Insa")).resolve("1678.01");
    }

    @Test
    void pcReducesLargePhotoWithoutCroppingOrChangingOriginal() throws Exception {
        writePhoto(1600, 2400, Color.RED, "bmp");
        byte[] original = Files.readAllBytes(photo);
        profileName("photo.bmp");

        var response = service.profileView("1678", 1, true);
        byte[] bytes = readContent(response);
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));

        assertEquals(MediaType.IMAGE_JPEG, response.getHeaders().getContentType());
        assertEquals(512, image.getHeight());
        assertEquals(2d / 3d, (double) image.getWidth() / image.getHeight(), 0.005);
        assertTrue(bytes.length < original.length / 20);
        assertTrue(new Color(image.getRGB(10, 10)).getRed() > 240);
        assertArrayEquals(original, Files.readAllBytes(photo));
        verify(mapper).selectProfileFile("1678", 1);
        verify(mapper, never()).selectAttachOne(anyString(), anyInt());
        System.out.println("Profile bytes: " + original.length + " -> " + bytes.length);
    }

    @Test
    void texturedPhotoKeepsDetailCloseToUncompressedPreview() throws Exception {
        BufferedImage original = new BufferedImage(1536, 2048, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < original.getHeight(); y++) {
            for (int x = 0; x < original.getWidth(); x++) {
                int detail = (x * 17 + y * 11) % 23 - 11;
                int red = 64 + x * 128 / 1535 + detail;
                int green = 48 + y * 128 / 2047 + detail;
                int blue = 80 + (x + y) * 80 / 3582 + detail;
                original.setRGB(x, y, new Color(red, green, blue).getRGB());
            }
        }
        ImageIO.write(original, "bmp", photo.toFile());
        profileName("photo.bmp");
        byte[] content = readContent(service.profileView("1678", 1, true));
        BufferedImage preview = ImageIO.read(new ByteArrayInputStream(content));
        BufferedImage reference = Thumbnails.of(original).scale(0.25).asBufferedImage();
        assertEquals(reference.getWidth(), preview.getWidth());
        assertEquals(reference.getHeight(), preview.getHeight());
        long error = 0;
        for (int y = 0; y < preview.getHeight(); y++) {
            for (int x = 0; x < preview.getWidth(); x++) {
                Color expected = new Color(reference.getRGB(x, y));
                Color actual = new Color(preview.getRGB(x, y));
                error += Math.abs(expected.getRed() - actual.getRed());
                error += Math.abs(expected.getGreen() - actual.getGreen());
                error += Math.abs(expected.getBlue() - actual.getBlue());
            }
        }
        double meanError = (double) error / (preview.getWidth() * preview.getHeight() * 3);
        assertTrue(meanError < 6, "Preview mean color error: " + meanError);
        assertTrue(content.length < Files.size(photo) / 10);
        System.out.println("Textured profile bytes: " + Files.size(photo) + " -> " + content.length
                + ", mean color error: " + meanError);
    }

    @Test
    void cachedPhotoIsRegeneratedWhenSourceChanges() throws Exception {
        writePhoto(1600, 2400, Color.RED, "bmp");
        profileName("photo.bmp");
        var first = service.profileView("1678", 1, true);
        var repeated = service.profileView("1678", 1, true);
        assertSame(((ByteArrayResource) first.getBody()).getByteArray(),
                ((ByteArrayResource) repeated.getBody()).getByteArray());

        long modified = Files.getLastModifiedTime(photo).toMillis();
        writePhoto(800, 1600, Color.BLUE, "bmp");
        Files.setLastModifiedTime(photo, FileTime.fromMillis(modified + 5000));
        var changed = service.profileView("1678", 1, true);
        assertNotEquals(first.getHeaders().getETag(), changed.getHeaders().getETag());
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(readContent(changed)));
        assertEquals(256, image.getWidth());
        assertEquals(512, image.getHeight());
        assertTrue(new Color(image.getRGB(10, 10)).getBlue() > 240);
    }

    @Test
    void smallPhotoIsNotEnlargedAndSmallerOriginalIsRetained() throws Exception {
        writePhoto(80, 120, Color.RED, "bmp");
        profileName("photo.bmp");
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(readContent(service.profileView("1678", 1, true))));
        assertEquals(80, image.getWidth());
        assertEquals(120, image.getHeight());

        writePhoto(20, 30, Color.RED, "png");
        profileName("photo.png");
        byte[] original = Files.readAllBytes(photo);
        var response = service.profileView("1678", 1, true);
        assertEquals(MediaType.IMAGE_PNG, response.getHeaders().getContentType());
        assertArrayEquals(original, readContent(response));
    }

    @Test
    void transparentPhotoKeepsAlphaChannel() throws Exception {
        BufferedImage original = new BufferedImage(1600, 2400, BufferedImage.TYPE_INT_ARGB);
        var graphics = original.createGraphics();
        graphics.setColor(Color.RED);
        graphics.fillRect(400, 600, 800, 1200);
        graphics.dispose();
        ImageIO.write(original, "png", photo.toFile());
        profileName("photo.png");
        var response = service.profileView("1678", 1, true);
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(readContent(response)));
        assertEquals(MediaType.IMAGE_PNG, response.getHeaders().getContentType());
        assertEquals(512, image.getHeight());
        assertEquals(0, new Color(image.getRGB(0, 0), true).getAlpha());
        assertEquals(255, new Color(image.getRGB(image.getWidth() / 2, 256), true).getAlpha());
    }

    @Test
    void jpegExifRotationKeepsPortraitOrientation() throws Exception {
        writePhoto(1600, 800, Color.RED, "jpg");
        byte[] jpeg = Files.readAllBytes(photo);
        byte[] exif = {
                (byte) 0xff, (byte) 0xe1, 0, 34, 'E', 'x', 'i', 'f', 0, 0,
                'I', 'I', 42, 0, 8, 0, 0, 0, 1, 0,
                18, 1, 3, 0, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0
        };
        byte[] original = new byte[jpeg.length + exif.length];
        int app0End = 4 + ((jpeg[4] & 255) << 8) + (jpeg[5] & 255);
        System.arraycopy(jpeg, 0, original, 0, app0End);
        System.arraycopy(exif, 0, original, app0End, exif.length);
        System.arraycopy(jpeg, app0End, original, app0End + exif.length, jpeg.length - app0End);
        Files.write(photo, original);
        profileName("photo.jpg");
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(readContent(service.profileView("1678", 1, true))));
        assertEquals(256, image.getWidth());
        assertEquals(512, image.getHeight());
        assertArrayEquals(original, Files.readAllBytes(photo));
    }

    @Test
    void defaultRequestStillSendsOriginalAndPcRequestSupportsRevalidation() throws Exception {
        writePhoto(800, 1200, Color.RED, "bmp");
        profileName("photo.bmp");
        when(mapper.selectAttachOne("1678", 1)).thenReturn(AttachFileDto.builder().afFileName("photo.bmp").build());
        byte[] original = Files.readAllBytes(photo);
        var mvc = MockMvcBuilders.standaloneSetup(new AttachFileController(service)).build();
        mvc.perform(get("/attach/profileView.do").param("afNum", "1678").param("afSeq", "1"))
                .andExpect(status().isOk())
                .andExpect(content().bytes(original));
        var first = mvc.perform(get("/attach/profileView.do").param("afNum", "1678").param("afSeq", "1")
                        .param("thumbnail", "true"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_JPEG))
                .andExpect(header().string("Cache-Control", "no-cache, private"))
                .andReturn().getResponse();
        mvc.perform(get("/attach/profileView.do").param("afNum", "1678").param("afSeq", "1")
                        .param("thumbnail", "true").header("If-None-Match", first.getHeader("ETag")))
                .andExpect(status().isNotModified())
                .andExpect(content().bytes(new byte[0]));
    }

    @Test
    void unsupportedFormatAndMissingPhotoPreserveFallbackBehavior() throws Exception {
        byte[] original = "RIFF test WEBP".getBytes();
        Files.write(photo, original);
        profileName("photo.webp");
        var response = service.profileView("1678", 1, true);
        assertArrayEquals(original, readContent(response));
        assertEquals("image/webp", response.getHeaders().getContentType().toString());
        Files.delete(photo);
        var missing = service.profileView("1678", 1, true);
        assertEquals(MediaType.IMAGE_PNG, missing.getHeaders().getContentType());
        assertArrayEquals(new ClassPathResource("static/images/emptyUser.png").getContentAsByteArray(),
                readContent(missing));
    }

    @Test
    void profileMetadataQueryDoesNotFetchFileBlob() throws Exception {
        Configuration config = new Configuration();
        String resource = "mybatis/mapper/common/AttachFileMapper.xml";
        try (var input = new ClassPathResource(resource).getInputStream()) {
            new XMLMapperBuilder(input, config, resource, config.getSqlFragments()).parse();
        }
        var sql = config.getMappedStatement(AttachFileMapper.class.getName() + ".selectProfileFile")
                .getBoundSql(Map.of("afNum", "1678", "afSeq", 1));
        assertFalse(sql.getSql().contains("Af_Content"));
        assertEquals("afNum", sql.getParameterMappings().getFirst().getProperty());
        assertEquals("afSeq", sql.getParameterMappings().get(1).getProperty());
    }

    private void profileName(String name) {
        when(mapper.selectProfileFile("1678", 1)).thenReturn(AttachFileDto.builder().afFileName(name).build());
    }

    private byte[] readContent(ResponseEntity<Resource> response) throws Exception {
        try (var input = response.getBody().getInputStream()) {
            return input.readAllBytes();
        }
    }

    private void writePhoto(int width, int height, Color color, String format) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        var graphics = image.createGraphics();
        graphics.setColor(color);
        graphics.fillRect(0, 0, width, height);
        graphics.dispose();
        assertTrue(ImageIO.write(image, format, photo.toFile()));
    }
}
