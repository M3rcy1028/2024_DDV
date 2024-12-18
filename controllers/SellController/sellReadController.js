var readModel = require('../../models/SellModel/sellReadModel');
var express = require('express');

module.exports = {
    readData: function (req, res, next) {
        var { usrLogin, rootLogin, rootname } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부
        var { usrid } = require('../../routes/index.js'); //사용자 아이디

        console.log("로그인 usrLogin : ", usrLogin, ", usrId : ", usrid);

        var UpdateEnable = false; //글 수정 가능 여부
        var isWriter = false; // 글 작성자 여부

        var Bno = req.params.Bno;
        readModel.getData(Bno, usrid, (row, review, likeCount) => {
            console.log('1개 글 조회 결과 확인 : ', row);
            console.log('리뷰 결과 확인 : ', review);
            console.log('찜 여부 : ', likeCount);

            /* 아이디 4번 째자리까지만 표기하기 */
            var Bid = row[0].Bid, newBid;
            newBid = Bid.slice(0, 4) + '*'.repeat(Bid.length - 4);
            row[0].Bid = newBid;
            row[0].realBid = Bid;

            /* 년도.월.날짜 형태로 표기하기 */
            const Update = new Date(row[0].Updated);
            const year = Update.getFullYear();
            const month = String(Update.getMonth() + 1).padStart(2, '0');
            const date = String(Update.getDate()).padStart(2, '0');
            const newUpdate = year + '.' + month + '.' + date;
            row[0].Updated = newUpdate;

            /* 개행 문자를 <br> 태그로 변경 */
            var newContent = row[0].Content;
            newContent = newContent.replaceAll("\r\n", '<br>');
            row[0].Content = newContent;

            /* 글을 조회 중인 사용자와 글 작성자가 동일하고 물건이 거래 완료가 아닌 경우 */
            if ((Bid === usrid) && (row[0].Trade !== "거래완료")) {
                UpdateEnable = true;
            }
            else {
                UpdateEnable = false;
            }

            if (Bid === usrid) {
                isWriter = true;
            }
            /* 리뷰가 있는 경우 */
            if (review.length) {
                /* 아이디 4번 째자리까지만 표기하기 */
                var Buyer = review[0].Buyer, newBuyer;
                newBuyer = Buyer.slice(0, 4) + '*'.repeat(Buyer.length - 4);
                review[0].Buyer = newBuyer;
            }

            res.render('SellFunction/sellRead', { title: "글 조회", rootname, rootLogin, usrLogin, UpdateEnable, row: row[0], review: review[0], usrid, isWriter, likeCount });
        });
    }
}