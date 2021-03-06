/**
 * Created by HDYA-BackFire on 2016-10-15 with IntelliJ IDEA.
 * Part of Project HACKxFDU
 * Make decision and don't look back
 * Like an angel you fly into my world, my snow white queen
 */
'use strict';

var staticPage = require('../../core/utils/view').staticPage;
var log = require('../../core/debuglog');
var config = require('../../config');

// entry of `main` pages
staticPage('/', 'main/player-client');
staticPage('/mobile-client', 'main/mobile-client');
staticPage('/mobile-score', 'main/mobile-score');
staticPage('/player-client', 'main/player-client');

app.get('/config.js', function(req, res) {
    res
        .status(200)
        .set('Content-Type', 'application/javascript')
        .end(
            'window.pp = {}; window.pp.config = ' +
            JSON.stringify({
                host: config.host,
                port: config.port,
                peerPath: config.peerPath,
                mobileClientPath: '/mobile-client'
            }));

    res.end()

});
