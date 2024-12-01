var readModel = require('../../models/SellModel/sellReadModel');
var express = require('express');

module.exports = {
    readData: function (req, res, next) {
        var { usrLogin, rootLogin } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부
        var { usrid } = require('../../routes/index.js'); //사용자 아이디

        console.log("로그인 usrLogin : ", usrLogin, ", usrId : ", usrid);

        var UpdateEnable = false; //글 수정 가능 여부

        var Bno = req.params.Bno;
        readModel.getData(Bno, usrid, (row, likeCount) => {
            console.log('1개 글 조회 결과 확인 : ', row);
            console.log('찜 여부 : ', likeCount);

            var Bid = row[0].Bid, newBid;
            newBid = Bid.slice(0, 4) + '*'.repeat(Bid.length - 4); //아이디는 4번째자리까지만 표기
            row[0].Bid = newBid;
            row[0].realBid = Bid;

            const Update = new Date(row[0].Updated);
            const year = Update.getFullYear();
            const month = String(Update.getMonth() + 1).padStart(2, '0');
            const date = String(Update.getDate()).padStart(2, '0');
            const newUpdate = year + '.' + month + '.' + date; //년도.월.날짜 형태로 표기
            row[0].Updated = newUpdate;

            //개행 문자를 <br> 태그로 변경
            var newContent = row[0].Content;
            newContent = newContent.replaceAll("\r\n", '<br>');
            row[0].Content = newContent;

            //글을 조회 중인 사용자와 글 작성자가 동일한 경우
            if (Bid === usrid) {
                UpdateEnable = true;
            }
            else {
                UpdateEnable = false;
            }

            console.log("UpdateEnable : ", UpdateEnable);

            res.render('SellFunction/sellRead', { title: "글 조회", rootLogin, usrLogin, UpdateEnable, row: row[0], usrid, likeCount });
        });
    }
}