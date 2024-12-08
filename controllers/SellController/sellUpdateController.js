var updateModel = require('../../models/SellModel/sellUpdateModel');
var express = require('express');
var url = require('url');

exports.updateForm = (req, res, next) => {
    var { rootLogin, usrLogin, usrid } = require('../../routes/index.js'); //사용자, 관리자 로그인 여부
    var queryData = url.parse(req.url, true).query;
    var Bno = queryData.idx;
    updateModel.getData(Bno, (row) => {
        const Pdate = new Date(row[0].Pdate);
        const year = Pdate.getFullYear();
        const month = String(Pdate.getMonth() + 1).padStart(2, '0');
        const date = String(Pdate.getDate()).padStart(2, '0');
        const newPdate = year + '-' + month + '-' + date; //년도.월.날짜 형태로 표기
        row[0].Pdate = newPdate;

        console.log('update에서 1개 글 조회 결과 확인 : ', row);

        res.render('SellFunction/sellUpdate', { title: '상품 수정', rootLogin, usrLogin, usrid, row: row[0] });
    })
}

exports.updateData = (req, res) => {
    var Bno = req.body.idx;
    var title = req.body.title;
    var content = req.body.content;
    var category = req.body.category;
    var price = req.body.price;
    var image;

    if (req.file == undefined) { //이미지가 없는 경우 - 기존 이미지 사용
        image = req.body.originImg;
    }
    else { //이미지가 있는 경우
        image = '/images/product/' + req.file.filename; //이미지 경로
    }

    var datas = [title, content, image, category, price, Bno];
    console.log("data : ", datas);
    console.log(JSON.stringify(req.body));
    updateModel.updateData(datas, (result) => {
        res.redirect('/sellBoard/sellRead/' + Bno);
    });
}