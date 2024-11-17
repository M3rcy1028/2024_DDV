var writeModel = require('../../models/SellModel/sellWriteModel');
var express = require('express');

exports.writeForm = (req, res) => {
    res.render('SellFunction/sellWrite', { title: "상품 등록" });
}

exports.writeData = (req, res) => {
    var id = "lovely"; //임의의 아이디
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

    var datas = [id, title, hit, content, image, pdate, category, price, tradePlace, trade, modified];
    writeModel.insertData(datas, () => {
        res.redirect('/sellBoard/sellList');
    });
};