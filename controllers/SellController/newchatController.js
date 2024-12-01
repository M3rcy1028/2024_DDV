var newchatModel = require('../../models/SellModel/newchatModel');
var express = require('express');

exports.createChat = (req, res) => {
    newchatModel.createChat(req.body, (result) => {
        res.redirect('/message');
    })
};