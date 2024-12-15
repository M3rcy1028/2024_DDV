### 데이터 구조

    2024_DDV/
    │
    ├── controllers        # 경매, 리뷰, 상품 게시판 기능 구현
    ├── models             # 경매, 리뷰, 상품 게시판 데이터베이스 연동
    ├── public/images      # 웹사이트 디자인 및 상품 이미지 저장 폴더
    ├── routes/
    ├── views/             # 웹페이지 디자인
    └── README.md

### 주요 라이브러리
```
npm install -d crypto
npm install mysql
npm install http-errors
```

### 과제 설명
 본 과제는 인터넷 중고장터 웹 애플리케이션을 개발하는 것이다. 따라서 <그린마켓>이라는 이름의 
중고 장터 웹 애플리케이션을 node.js와 mysql을 사용하여 이를 구현하였다. 
그린마켓은 사용자 기능과 관리자 기능으로 나뉜다. 사용자는 물건을 판매하기 위해 게시글을 작성
하거나 다른 사용자의 게시글을 조회하고, 문의하여 웹 애플리케이션 내 화폐로 구매할 수 있다. 또
한, 마이페이지에서 자신이 게시한 게시물, 조회한 게시물, 구매한 상품의 게시물을 확인할 수 있다. 
관리자는 공지를 작성하고 유저의 문의를 확인할 수 있다. 또한, 유저의 정보, 게시판 정보 등을 
수정하는 등 웹 애플리케이션을 전반적으로 관리할 수 있다.

### 데이터베이스 구조
![스크린샷 2024-12-15 132332](https://github.com/user-attachments/assets/c759b96c-b2d7-4334-8505-bb7ce4fc88b3)

### 팀원 및 역할

| Name            | GitHub Username                          | Main Contribution Area(s)         |
|------------------|------------------------------------------|-----------------------------------|
| 김태관       | [@KimTaegwan03](https://github.com/KimTaegwan03) | 채팅방 기능 구현, 경매 기능 구현 |
| 손민         | [@dbfanck](https://github.com/dbfanck)       | 유저 기능 구현, 웹사이트 기본틀 제작                |
| 우나륜    | [@M3rcy1028](https://github.com/M3rcy1028) | 데이터베이스 구축, 관리자 기능 구현           |

Kwangwoon University 2024.
