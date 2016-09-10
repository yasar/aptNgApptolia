// TODO: Split this up into service and directive
// TODO: Create a legit project with gulp and tests

// https://github.com/TheSharpieOne/angular-card-reader

angular.module('cardRead', []);

angular.module('cardRead')
    .provider('cardRead', cardReadProvider);

function cardReadProvider(){
    this.settings = {
        errorStart: 'E',
        tracks:[
            {start:'%', end: '?'},
            {start:';', end: '?'},
            {start:'#', end: '?'}
        ],
        timeout: 100,
    };
    this.$get = function(){
        return this.settings;
    }
}

angular.module('cardRead')
    .directive('cardRead', cardReadDirective);

cardReadDirective.$inject=['$timeout','cardRead'];
function cardReadDirective($timeout, cardReadProvider){
    return {
        restrict: 'A',
        scope:{
            cardRead: '&',
            cardReadSettings: '=?'
        },
        link: function(scope, elm, attrs){
            var settings = angular.extend({}, cardReadProvider, scope.cardReadSettings);
            var started, finished, isError, track, lastTrack, tracks, input, timer;

            resetLocals();

            elm[0].setAttribute('tabindex', '0');
            elm.on('keypress', function (e) {
                var key = e.which || e.charCode || e.keyCode
                var char = String.fromCharCode(key);

                if (!track && (track = trackStart(char))) {
                    started = true;
                    resetTimer();
                }

                if(started){
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }

                if(track && key !== 13) {
                    tracks[track-1] += char;
                    input += char;

                    resetTimer();
                }

                if (started && key === 13) {
                    trackError(track);
                    endRead();
                }

                if (track && char === settings.tracks[track-1].end) {
                    if(tracks[track-1].length === 3 && tracks[track-1].substr(1,1) === settings.errorStart){
                        trackError();
                    }
                    if(settings.tracks.length <= track){
                        endRead();
                    }
                    lastTrack = track-1;
                    track = false;
                }

            });

            function trackError(){
                isError = true;
                // TODO: identify which track had the error
            }

            function endRead(){
                scope.$apply(function(){
                    scope.cardRead({$card: input, $readError: isError, $tracks: tracks});
                });

                resetLocals();
                $timeout.cancel(timer);
            }


            function resetLocals(){
                started = false;
                finished = false;
                isError = false;
                track = false;
                tracks = [];
                lastTrack = -1;
                input = '';
            }

            function resetTimer(){
                $timeout.cancel(timer);
                timer = $timeout(resetLocals, settings.timeout);
            }

            function trackStart(char){
                var val = false;
                angular.forEach(settings.tracks, function(obj, i){
                    if(!val && i > lastTrack && obj.start === char){
                        val = i+1;
                        tracks[i] = '';
                    }
                });
                return val;
            }
        }
    }
}
