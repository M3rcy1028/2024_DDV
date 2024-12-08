var readModel = require('../../models/ReviewModel/reviewReadModel');
var express = require('express');

module.exports = {
    readData: function (req, res, next) {
        var { usrLogin, rootLogin, usrid } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부

        var Rno = req.params.Rno;

        readModel.getData(Rno, (row) => {
            console.log('1개 글 조회 결과 확인 : ', row);

            //개행 문자를 <br> 태그로 변경
            var newContent = row[0].Rtext;
            newContent = newContent.replaceAll("\r\n", '<br>');
            row[0].Rtext = newContent;

            res.render('MypageFunction/reviewRead', { title: "리뷰 조회", rootLogin, usrid, usrLogin, row: row[0] });
        });
    }
}