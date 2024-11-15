var writeModel = require('../models/sellWriteModel');
var express = require('express');

exports.writeForm = (req, res) => {
    res.render('sellWrite', { title: "상품 등록" });
}

exports.writeData = (req, res) => {

    res.redirect('/sellBoard/sellList');
};