var myApp = angular.module('myApp', []);

myApp.controller('mainController', function($scope, $http) {
    $scope.greeting = 'Hola!';
    var jsmediatags = window.jsmediatags;
    var client = new WebTorrent();
    var API_URL = 'http://localhost:3000/tracks';

    $scope.peers = 0;
    //$scope.hash = '23d4937148cb5d229290424cc824832ab20a398d';


var opts =
{
  announce: [ 'ws://10.4.10.48:8000'],
   dht:false
}

//opts = {};

    var playerElement = document.getElementById('player1');
    var aPlayer = new APlayer({
        element: playerElement,
        narrow: false,
        autoplay: true,
        showlrc: false,
        theme: '#e6d0b2'
    });


    function getTags(aFile) {
        jsmediatags.read(aFile, {
            onSuccess: function(tag) {
                client.seed(aFile,opts, function(torrent) {
                    var data = {
                        "title": tag.tags.title,
                        "hash": torrent.infoHash
                    };
                    console.log(torrent.infoHash);
                    console.log(data);
                    $http.post(API_URL, data).then(function successCallback(response) {
                        $scope.listTracks();
                    });

                });
            },

            onError: function(error) {
                console.log(error);
            }
        });
    };

    $scope.seed = function() {
        var x = document.getElementById("myFile");
        getTags(x.files[0]);
    };

    $scope.play = function(track) {
        client.add(track.hash,opts, function(torrent) {
            var file = torrent.files[0];
            console.log(file);
            document.getElementById("audioId").innerHTML = '';

            file.appendTo('#audioId', function(err, elem) {

            });

        });

    }



    $scope.listTracks = function() {
        $http({
            method: 'GET',
            url: API_URL
        }).then(function successCallback(response) {
            $scope.tracklist = response.data;
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    }

    $scope.playTorrent = function(torrent) {
        var files = torrent.files;

        var tracks = [];

        files.forEach(function(file) {
            var aTrack = {};
            aTrack.file = file;
            aTrack.title = file.name;
            aTrack.author = '';
            if (file.name.indexOf("jpg") > -1) {
                coverFile = file;
            } else {
                tracks.push(aTrack);
            }
        });

        $scope.loadPlayer(tracks);

    }

    $scope.loadTorrent = function(hash) {
        console.log('loadTorrent ' + hash);
            console.log('opts '+opts.announce);

        client.add(hash,opts, function(torrent) {
            console.log('loaded torrent');
    
            $scope.peers = torrent.swarm.wires.length;
            $scope.$apply();
            torrent.files.forEach(file => file.deselect());
            torrent._selections = [];

            $scope.playTorrent(torrent);
        });
    }

    $scope.loadPlayer = function(tracks) {
        aPlayer.initTracks(tracks);
        aPlayer.init();

    }

    $scope.simpletest = function(hash) {

        var torrentId = 'magnet:?xt=urn:btih:' + hash;

        client.add(torrentId, function(torrent) {
            torrent.files.forEach(file => file.deselect());
            torrent._selections = [];

            var file = torrent.files[0];
            file.appendTo('body');
        });
    }

    $scope.loadHash = function() {
        $scope.loadTorrent($scope.hash);
    };

    $scope.playCurrentTorrent = function() {

        $scope.playTorrent($scope.torrent);
    };


});