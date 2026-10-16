package com.example.mshintra.notice.service;

import com.example.mshintra.common.dto.MenuAuthDto;
import com.example.mshintra.common.service.MenuAuthService;
import com.example.mshintra.menu.dto.MenuDto;
import com.example.mshintra.menu.service.MenuService;
import com.example.mshintra.notice.dto.NoticeDto;
import com.example.mshintra.notice.dto.NoticeMenuDto;
import com.example.mshintra.notice.dto.PcNoticeMenuDto;
import com.example.mshintra.notice.dto.PcNoticePageDto;
import com.example.mshintra.notice.dto.PcNoticeSearchDto;
import com.example.mshintra.notice.mapper.NoticeMapper;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PcNoticeService {
    private final NoticeMapper noticeMapper;
    private final MenuService menuService;
    private final MenuAuthService menuAuthService;
    private final NoticeService noticeService;

    @Transactional(readOnly = true)
    public List<PcNoticeMenuDto> selectBoardMenus(String userId, HttpSession session) {
        List<MenuDto> boards = new ArrayList<>();
        collectBoardMenus(menuService.selectMenuTree(userId, null, session), boards);
        List<NoticeMenuDto> libraryMenus = boards.stream().anyMatch(board -> "3".equals(board.getCcBaseKey()))
                ? noticeService.getNoticeMenuList() : List.of();
        List<PcNoticeMenuDto> result = new ArrayList<>();
        for (MenuDto board : boards) {
            PcNoticeMenuDto menu = PcNoticeMenuDto.builder()
                    .ccBaseKey(board.getCcBaseKey())
                    .ccMenuName(board.getCcMenuName())
                    .libraryAll("3".equals(board.getCcBaseKey()))
                    .build();
            if (menu.isLibraryAll()) {
                for (NoticeMenuDto category : libraryMenus) {
                    if (category.getHcSeq() < 3 || category.getHcSeq() > 5) continue;
                    PcNoticeMenuDto child = PcNoticeMenuDto.builder()
                            .ccBaseKey(category.getHcCode1())
                            .ccMenuName(category.getHcName())
                            .build();
                    for (NoticeMenuDto group : category.getSubMenuList()) {
                        child.getChildren().add(PcNoticeMenuDto.builder()
                                .ccBaseKey(category.getHcCode1())
                                .ccMenuName(group.getHcName())
                                .tnSeflag(String.valueOf(group.getHcSeq()))
                                .build());
                    }
                    menu.getChildren().add(child);
                }
            }
            result.add(menu);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public MenuDto checkBoard(int flag, String userId, HttpSession session) {
        int baseKey = flag >= 3 && flag <= 5 ? 3 : flag;
        List<MenuDto> boards = new ArrayList<>();
        collectBoardMenus(menuService.selectMenuTree(userId, null, session), boards);
        MenuDto menu = boards.stream()
                .filter(item -> String.valueOf(baseKey).equals(item.getCcBaseKey()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "게시판 조회 권한이 없습니다."));
        MenuAuthDto auth = new MenuAuthDto();
        auth.setWinCode(menu.getCcWinCode());
        auth.setBaseKey(menu.getCcBaseKey());
        auth.setUserId(userId);
        if (!menuAuthService.checkAndSetSession(auth, session)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "게시판 조회 권한이 없습니다.");
        }
        return menu;
    }

    @Transactional(readOnly = true)
    public PcNoticePageDto selectBoardPage(PcNoticeSearchDto search, String userId, HttpSession session) {
        checkBoard(search.getTnFlag(), userId, session);
        search.setSearchId(userId);
        if (search.isLibraryAll() && (search.getTnFlag() != 3
                || (search.getTnSeflag() != null && !search.getTnSeflag().isEmpty()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자료실 조회 조건을 확인해 주세요.");
        }
        if (search.getOffset() == null || search.getOffset() < 0
                || search.getLimit() == null || search.getLimit() < 1 || search.getLimit() > 100
                || search.getSearchType() == null
                || !List.of("titleContent", "title", "content", "writer").contains(search.getSearchType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "검색 조건을 확인해 주세요.");
        }
        if (search.getSearchFromDate() == null || search.getSearchToDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "조회 기간을 확인해 주세요.");
        }
        LocalDate from;
        LocalDate to;
        try {
            from = LocalDate.parse(search.getSearchFromDate());
            to = LocalDate.parse(search.getSearchToDate());
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "조회 기간을 확인해 주세요.");
        }
        if (from.isAfter(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "조회 기간을 확인해 주세요.");
        }
        int total = noticeMapper.selectPcNoticeCount(search);
        return new PcNoticePageDto(noticeMapper.selectPcNoticeList(search), total);
    }

    @Transactional
    public NoticeDto selectBoardDetail(PcNoticeSearchDto search, String userId, HttpSession session) {
        checkBoard(search.getTnFlag(), userId, session);
        search.setSearchId(userId);
        NoticeDto detail = noticeMapper.selectPcNoticeDetail(search);
        if (detail == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }
        noticeMapper.totalNoteView(detail.getTvUk(), userId);
        return detail;
    }

    //게시판 메뉴 수집
    private void collectBoardMenus(List<MenuDto> menus, List<MenuDto> boards) {
        for (MenuDto menu : menus) {
            if ("w_gongji_list".equals(menu.getCcWinCode())) boards.add(menu);
            collectBoardMenus(menu.getChildren(), boards);
        }
    }
}
