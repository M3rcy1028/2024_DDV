var listModel = require('../models/sellListModel');
var express = require('express');

exports.getList = (req, res, next) => {
    var page = req.params.page; //페이지 번호 (1페이지부터 시작)
    const itemNums = 12; //한 페이지에 보일 최대 아이템 수

    listModel.getList(page, itemNums, (rows) => {
        console.log('rows: ' + JSON.stringify(rows));
        res.render('sellList', { title: "전체 보기", rows: rows });
    })
}

exports.getListFirst = (req, res) => {
    res.redirect('/sellBoard/sellList/1');
}