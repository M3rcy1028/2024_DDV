var writeModel = require('../../models/SellModel/sellWriteModel');
var express = require('express');

exports.writeForm = (req, res) => {
    var { rootLogin, usrLogin, usrid } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부
    res.render('SellFunction/sellWrite', { title: "상품 등록" , rootLogin, usrLogin, usrid});
}

exports.writeData = (req, res) => {
    var { usrid } = require('../../routes/index.js'); //사용자 아이디
    var title = req.body.title;
    var hit = 0;
    var content = req.body.content;
    var pdate = req.body.buyDate;
    var category = req.body.category;
    var price = req.body.price;
    var tradePlace = req.body.place;
    var trade = "거래가능";
    var modified = 0;
    var image;

    if (req.file == undefined) { //이미지가 없는 경우
        image = '';
    }
    else { //이미지가 있는 경우
        image = '/images/product/' + req.file.filename; //이미지 경로
    }

    var datas = [usrid, title, hit, content, image, pdate, category, price, tradePlace, trade, modified];
    writeModel.insertData(datas, () => {
        res.redirect('/sellBoard/sellList');
    });
};