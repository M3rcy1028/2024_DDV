var listModel = require('../../models/SellModel/sellListModel');
var express = require('express');

exports.getList = (req, res, next) => {
    var { rootLogin, usrLogin, usrid } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부

    var page = req.params.page; //페이지 번호 (1페이지부터 시작)
    const itemNums = 16; //한 페이지에 보일 최대 아이템 수

    listModel.getList(page, itemNums, (rows, totalPages) => {
        console.log('rows: ' + JSON.stringify(rows));
        console.log(page, totalPages);
        res.render('SellFunction/sellList', { title: "전체 보기", rootLogin, usrLogin, usrid, rows: rows, currentPage: page, totalPages });
    })
}

exports.getListFirst = (req, res) => {
    res.redirect('/sellBoard/sellList/1');
}

exports.getCategoryList = (req, res, next) => {
    var { rootLogin, usrLogin, usrid } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부

    var page = req.params.page; //페이지 번호 (1페이지부터 시작)
    const itemNums = 16; //한 페이지에 보일 최대 아이템 수

    var categories = res.locals.categories; //카테고리
    var categoryNum = Number(req.params.categoryNum); //카테고리 번호
    var categoryName = Object.keys(categories).find(key => categories[key] === categoryNum); //카테고리 이름

    listModel.getCategoryList(page, itemNums, categoryName, (rows, totalPages) => {
        console.log('rows: ' + JSON.stringify(rows));
        res.render('SellFunction/sellListCategory', { title: "카테고리별 보기", rootLogin, usrLogin, usrid, rows: rows, categoryName: categoryName, currentPage: page, totalPages });
    })
}

exports.getCategoryListFirst = (req, res) => {
    var categoryNum = req.params.categoryNum;
    var url = '/sellBoard/sellList/category/' + categoryNum + '/1'; //1페이지 불러오기
    res.redirect(url);
}