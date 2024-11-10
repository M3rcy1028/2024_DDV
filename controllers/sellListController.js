var listModel = require('../models/sellListModel');
var express = require('express');

exports.getList = (req, res, next) => {
    var page = req.params.page; //페이지 번호 (1페이지부터 시작)
    const itemNums = 16; //한 페이지에 보일 최대 아이템 수

    listModel.getList(page, itemNums, (rows) => {
        console.log('rows: ' + JSON.stringify(rows));
        res.render('sellList', { title: "전체 보기", rows: rows });
    })
}

exports.getListFirst = (req, res) => {
    res.redirect('/sellBoard/sellList/1');
}

exports.getCategoryList = (req, res, next) => {
    var categories = res.locals.categories; //카테고리
    var categoryNum = Number(req.params.categoryNum); //카테고리 번호
    var categoryName = Object.keys(categories).find(key => categories[key] === categoryNum); //카테고리 이름

    listModel.getCategoryList(categoryName, (rows) => {
        console.log('rows: ' + JSON.stringify(rows));
        res.render('sellListCategory', { title: "카테고리별 보기", rows: rows, categoryName: categoryName });
    })
}