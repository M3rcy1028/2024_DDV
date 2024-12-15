-- ADMINISTRATOR ACCOUNT
CREATE TABLE ROOT (
    Rid VARCHAR(100) NOT NULL UNIQUE,	-- Root's id
    Rpwd VARCHAR(128) NOT NULL,			-- Root's password
    Rname VARCHAR(100) NOT NULL,		-- Root's nickname
    PRIMARY KEY (Rid)
);
-- ANNOUNCEMENT
CREATE TABLE ROOTBOARD (
	Bid SMALLINT NOT NULL AUTO_INCREMENT,
	Rnum VARCHAR(100) NOT NULL, 
    Title VARCHAR(100) NOT NULL, 
    Content TEXT NOT NULL,
    Updated TIMESTAMP DEFAULT NOW(),
    Hit SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (Bid, Rnum),
    FOREIGN KEY (Rnum) REFERENCES ROOT (Rid) ON DELETE CASCADE
);
-- PERSON INFORMATION
CREATE TABLE PERSON (
	Pid  VARCHAR (100) NOT NULL UNIQUE,	-- identify users using Pid
    Lname VARCHAR(30) NOT NULL,
    Fname VARCHAR(30) NOT NULL,
    Bdate DATE NOT NULL, 				-- 1000-01-01 ~ 9999-12-31
    Login TIMESTAMP DEFAULT NOW(),		-- Login time is now yyyy-mm-dd hh:mm:ss
    Sex VARCHAR(6) NOT NULL, 			-- Male/Female
    Email VARCHAR(50) NOT NULL,
    PRIMARY KEY (Pid)
); 
-- USER INFORMATION
CREATE TABLE USR (
	Uno SMALLINT NOT NULL AUTO_INCREMENT,	-- range -32,768 ~ 32,767
    Uid VARCHAR (100) NOT NULL UNIQUE, 		-- prevent duplicated id
    Pwd VARCHAR(128) NOT NULL,
    Nickname VARCHAR(100) NOT NULL,
    Money INT NOT NULL DEFAULT 0,
    Bcnt SMALLINT DEFAULT 0,				-- the number of updated boards
    Trust SMALLINT DEFAULT 50,				-- 0 ~ 100
    State VARCHAR(100) NOT NULL DEFAULT "안녕하세요~", -- 소개문구
    ProfileImg VARCHAR(100) NOT NULL DEFAULT "/images/profile/basic_profile.jpg",
    PRIMARY KEY (Uno, Uid),
    FOREIGN KEY (Uid) REFERENCES PERSON (Pid) ON DELETE CASCADE
);
-- Reported user
CREATE TABLE REPORTED_USR (
	Rno SMALLINT NOT NULL AUTO_INCREMENT,
    Uid VARCHAR (100) NOT NULL,
    Reason TEXT NOT NULL,					-- 신고사유
    Accepted TINYINT DEFAULT 0,             -- 신고 접수 여부
    PRIMARY KEY (Rno, Uid),
    FOREIGN KEY (Uid) REFERENCES USR (Uid) ON DELETE CASCADE
);
-- question and answer
CREATE TABLE QNA (
	num SMALLINT NOT NULL AUTO_INCREMENT,
    uid VARCHAR(100) NOT NULL,		-- 질문자
    rname VARCHAR(100),	-- 답변한 관리자 닉네임
    title VARCHAR(100) NOT NULL,
    question TEXT NOT NULL, 
    answer TEXT, 
    updated TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (num, uid),
    FOREIGN KEY (uid) REFERENCES USR(Uid) ON DELETE CASCADE
);
-- BORAD INFORMATION
CREATE TABLE BOARD (
	Bno SMALLINT NOT NULL AUTO_INCREMENT,
    Bid VARCHAR (100) NOT NULL,
    Buyer VARCHAR(100) NOT NULL DEFAULT "None",	-- 구매자 아이디
    Title VARCHAR(100) NOT NULL,
    Content TEXT NOT NULL, 
    Img VARCHAR(100) NOT NULL DEFAULT "",
    Modified TINYINT NOT NULL DEFAULT 0, 	-- 1 means modified
    Updated TIMESTAMP NOT NULL DEFAULT NOW(),
    Trade VARCHAR(20) DEFAULT '거래가능',		-- 거래가능/거래중/거래완료
    Hit MEDIUMINT DEFAULT 0,				-- 총 조회수
    -- PRODUCT INFORMATION
    Pdate DATE NOT NULL,					-- purchased date
    Category VARCHAR(100) NOT NULL,
    Price MEDIUMINT NOT NULL,
    TradePlace VARCHAR(200) NOT NULL,
    PRIMARY KEY (Bno, Bid),
    FOREIGN KEY (Bid) REFERENCES PERSON (Pid) ON DELETE CASCADE
);
-- wishlist
CREATE TABLE WISHLIST (
	Wno SMALLINT NOT NULL AUTO_INCREMENT,
    Uid VARCHAR (100) NOT NULL,	-- 찜하기 누른 유저의 아이디
    Bnum SMALLINT NOT NULL,
    PRIMARY KEY (Wno, Uid, Bnum),
    FOREIGN KEY (Bnum) REFERENCES BOARD (Bno) ON DELETE CASCADE,
    FOREIGN KEY (Uid) REFERENCES USR (Uid) ON DELETE CASCADE
);
-- prodect review
CREATE TABLE REVIEW (
	Rno SMALLINT NOT NULL AUTO_INCREMENT,
    Bnum SMALLINT NOT NULL,	-- 구매한 상품 게시물 번호
    Rtext VARCHAR (200) NOT NULL, -- 구매 후기
    Score SMALLINT NOT NULL, --1~5점
    PRIMARY KEY (Rno, Bnum),
    FOREIGN KEY (Bnum) REFERENCES BOARD (Bno) ON DELETE CASCADE
);
-- CHATROOM
CREATE TABLE CHATROOM (
	Cno SMALLINT NOT NULL AUTO_INCREMENT,
    Bnum SMALLINT NOT NULL,			-- Board number
	Rid VARCHAR(100) NOT NULL,		-- 핀메지 id
    Sid VARCHAR(100) NOT NULL,		-- 구매 희망자 id
    PRIMARY KEY(Cno, Bnum, Sid),
    FOREIGN KEY (Bnum) REFERENCES BOARD (Bno) ON DELETE CASCADE,
    FOREIGN KEY (Sid) REFERENCES USR (Uid) ON DELETE CASCADE
);
-- Message logs
CREATE TABLE MSGLOG (
	Mno MEDIUMINT NOT NULL AUTO_INCREMENT,
    Cnum SMALLINT NOT NULL,					-- chatroom number
    Sender VARCHAR(100) NOT NULL,			-- msg Sender
    Message TEXT NOT NULL,
    Mtime TIMESTAMP DEFAULT NOW(),			-- msg sent time
    PRIMARY KEY (Mno, Cnum),
    FOREIGN KEY (CNum) REFERENCES CHATROOM (Cno) ON DELETE CASCADE
);
-- 경매
CREATE TABLE AUCTION (
	Ano SMALLINT NOT NULL AUTO_INCREMENT,
    Title VARCHAR(100) NOT NULL,
    Content TEXT NOT NULL,
    Seller VARCHAR(100) NOT NULL,
    Smoney MEDIUMINT NOT NULL,
    Buyer VARCHAR(100) DEFAULT 'NULL',
    Emoney MEDIUMINT DEFAULT 0,		-- max money in auction
    Timeover TINYINT DEFAULT 0, 	-- set 1 means timeover
    PRIMARY KEY (Ano, Seller),
    FOREIGN KEY (Seller) REFERENCES USR(Uid) ON DELETE CASCADE
);
-- 경매 반응 채팅
CREATE TABLE AUCTION_MSG (
	Mno MEDIUMINT NOT NULL AUTO_INCREMENT,
	Anum SMALLINT NOT NULL,
    msg TEXT NOT NULL,
    PRIMARY KEY (Mno, Anum),
    FOREIGN KEY (Anum) REFERENCES AUCTION (Ano) ON DELETE CASCADE
);

