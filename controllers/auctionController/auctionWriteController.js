var writeModel = require('../../models/auctionModel/auctionWriteModel.js');
var express = require('express');

exports.writeForm = (req, res) => {
    var { rootLogin, usrLogin, usrid } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부
    res.render('auctionFunction/auctionWrite', { title: "상품 등록", rootLogin, usrLogin, usrid });
}

exports.writeData = (req, res) => {
    var { usrid } = require('../../routes/index.js'); //사용자 아이디
    var title = req.body.title;
    var content = req.body.content;
    var smoney = req.body.smoney;
    var image;

    if (req.file == undefined) { //이미지가 없는 경우
        image = '';
    }
    else { //이미지가 있는 경우
        image = '/images/product/' + req.file.filename; //이미지 경로
    }

    var datas = [title, content, image, usrid, smoney];
    writeModel.insertData(datas, () => {
        res.redirect('/auctionBoard/auctionList');
    });
};