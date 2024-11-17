var readModel = require('../../models/SellModel/sellReadModel');
var express = require('express');

module.exports = {
    readData: function (req, res, next) {
        var Bno = req.params.Bno;
        readModel.getData(Bno, (row) => {
            console.log('1개 글 조회 결과 확인 : ', row);

            var Bid = row[0].Bid, newBid;
            newBid = Bid.slice(0, 4) + '*'.repeat(Bid.length - 4); //아이디는 4번째자리까지만 표기
            row[0].Bid = newBid;

            const Update = new Date(row[0].Updated);
            const year = Update.getFullYear();
            const month = String(Update.getMonth() + 1).padStart(2, '0');
            const date = String(Update.getDate()).padStart(2, '0');
            const newUpdate = year + '.' + month + '.' + date; //년도.월.날짜 형태로 표기
            row[0].Updated = newUpdate;

            //개행 문자를 <br> 태그로 변경
            var newContent = row[0].Content;
            newContent = newContent.replaceAll("\r\n", '<br>');
            console.log(newContent);
            row[0].Content = newContent;

            res.render('SellFunction/sellRead', { title: "글 조회", row: row[0] });
        });
    }
}