var readModel = require('../../models/auctionModel/auctionReadModel.js');
var express = require('express');

module.exports = {
    readData: function (req, res, next) {
        var { usrLogin, rootLogin, rootname } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부
        var { usrid } = require('../../routes/index.js'); //사용자 아이디

        console.log("로그인 usrLogin : ", usrLogin, ", usrId : ", usrid);

        var UpdateEnable = false; //글 수정 가능 여부
        var isWriter = false; // 글 작성자 여부

        var Ano = req.params.Ano;
        readModel.getData(Ano, usrid, (row) => {
            console.log('1개 글 조회 결과 확인 : ', row);

            var Bid = row[0].Seller, newBid;
            newBid = Bid.slice(0, 4) + '*'.repeat(Bid.length - 4); //아이디는 4번째자리까지만 표기
            row[0].Bid = newBid;
            row[0].realBid = Bid;

            const Update = new Date(row[0].Stime);
            const year = Update.getFullYear();
            const month = String(Update.getMonth() + 1).padStart(2, '0');
            const date = String(Update.getDate()).padStart(2, '0');
            const newUpdate = year + '.' + month + '.' + date; //년도.월.날짜 형태로 표기
            row[0].Stime = newUpdate;

            //개행 문자를 <br> 태그로 변경
            var newContent = row[0].Content;
            newContent = newContent.replaceAll("\r\n", '<br>');
            row[0].Content = newContent;

            //글을 조회 중인 사용자와 글 작성자가 동일하고 물건이 거래 완료가 아닌 경우
            if (Bid === usrid) {
                UpdateEnable = true;
            }
            else {
                UpdateEnable = false;
            }

            if (Bid === usrid) {
                isWriter = true;
            }

            res.render('auctionFunction/auctionRead', { title: "글 조회", Anum: Ano, rootname, rootLogin, usrLogin, row: row[0], usrid, isWriter, UpdateEnable });
        });
    }
}