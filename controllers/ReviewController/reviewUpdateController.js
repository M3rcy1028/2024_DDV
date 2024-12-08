var updateModel = require('../../models/ReviewModel/reviewUpdateModel');
var express = require('express');
var url = require('url');

exports.updateForm = (req, res, next) => {
    var { rootLogin, usrLogin } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부
    var queryData = url.parse(req.url, true).query;
    var Rno = queryData.Rno;

    updateModel.getData(Rno, (row) => {
        console.log('update에서 1개 리뷰 결과 확인 : ', row);

        res.render('MypageFunction/reviewUpdate', { title: '리뷰 수정', rootLogin, usrLogin, row: row[0] });
    })
}

exports.updateData = (req, res) => {
    var Rno = req.body.idx;
    var content = req.body.content;
    var score = req.body.rating;

    var datas = [content, score, Rno];

    updateModel.updateData(datas, (result) => {
        res.redirect('/myPage/productReview');
    });
}