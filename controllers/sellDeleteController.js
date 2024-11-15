var deleteModel = require('../models/sellDeleteModel');
var express = require('express');

exports.deleteData = (req, res) => {
    var Bno = req.body.idx;
    deleteModel.deleteRow(Bno, (result) => {
        res.redirect('/sellBoard/sellList');
    })
};