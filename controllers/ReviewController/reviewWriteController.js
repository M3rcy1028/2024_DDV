var writeModel = require('../../models/ReviewModel/reviewWriteModel');
var express = require('express');
var url = require('url');

exports.writeForm = (req, res) => {
    var { rootLogin, usrLogin, usrid     } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부

    var queryData = url.parse(req.url, true).query;
    var Bno = queryData.idx; //게시판 번호

    writeModel.getData(Bno, (row) => {

        console.log('작성할 리뷰 글 조회 결과 확인 : ', row);

        res.render('MypageFunction/reviewWrite', { title: "리뷰 작성", rootLogin, usrLogin, usrid, row: row[0] });
    })
}

exports.writeData = (req, res) => {
    var Bno = req.body.idx;
    var content = req.body.content;
    var score = req.body.rating;

    var datas = [Bno, content, score];
    writeModel.insertData(datas, () => {
        res.redirect('/myPage/productReview');
    });
};