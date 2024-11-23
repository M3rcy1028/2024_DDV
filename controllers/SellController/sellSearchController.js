var searchModel = require('../../models/SellModel/sellSearchModel');
var express = require('express');

exports.searchData = (req, res, next) => {
    var { rootLogin, usrLogin } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부

    var searchWord = req.body.searchword.trim(); //검색어 (앞뒤 공백 제거)
    console.log("검색어 : ", searchWord);

    var title = `'${searchWord}'의 검색 결과`;

    searchModel.getSearchList(searchWord, (rows) => {
        console.log('rows: ' + JSON.stringify(rows));
        res.render('SellFunction/sellSearch', {title : title, rootLogin, usrLogin, rows : rows});
    })
}