(function(exports) {
    var audioElement,
        title,
        nextButton;

    var audios = [];

    function seedShuffle(array, seed) {
        var index = -1,
            length = array.length,
            result = new Array(length);

        var seedRandom = new Math.seedrandom(seed);

        while (++index < length) {
            var rand = Math.floor(seedRandom() * (index + 1));
            if (index != rand) {
                result[index] = result[rand];
            }
            result[rand] = array[index];
        }
        return result;
    }

    exports.init = function() {
        audioElement = document.createElement('audio');
        audioElement.setAttribute("preload", "auto");
        audioElement.setAttribute("controls", "controls");
        audioElement.autobuffer = true;

        title = document.createElement('span');

        nextButton = document.createElement('div');
        nextButton.innerHTML = 'next';
        nextButton.onclick = next;

        document.getElementById('radio').appendChild(title);
        document.body.appendChild(audioElement);
        document.body.appendChild(nextButton);
    };

    exports.changeStation = function (data) {
        var totalTime = 0;
        var currentTimestamp = Math.round(+new Date()/1000);
        var currentTrack;
        var offset = 0;

        _.forEach(data, function(item) {
            _.forEach(item['attachments'], function(attachment) {
                if (attachment.type === "audio") {
                    audios.push({
                        current : false,
                        duration: attachment.audio.duration,
                        title: attachment.audio.title,
                        artist: attachment.audio.artist,
                        id: item.id,
                        image: item.attachment.type === 'photo' ? item.attachment.photo.src_big : null
                    });

                    totalTime += attachment.audio.duration;
                }
            });
        });

        var currentAudioTime = +currentTimestamp % totalTime;
        var seed = Math.floor(currentTimestamp/totalTime);

        audios = seedShuffle(audios, seed + audios.length);

        totalTime = 0;

        _.forEach(audios, function(item) {
            totalTime += item.duration;

            if (currentAudioTime < totalTime) {
                offset = currentAudioTime - (totalTime - item.duration);
                currentTrack = item;
                item.current = true;

                return false;
            }
        });

        if (currentTrack) {
            document.body.style.backgroundImage="url(" + currentTrack.image + ")";
            title.innerText = currentTrack.artist + ' — ' + currentTrack.title;

            $.getJSON('https://api.vk.com/method/wall.getById?posts=-59680854_' + currentTrack.id + '&callback=?', function(data) {
                var post = data.response.pop();

                _.forEach(post['attachments'], function(attachment) {
                    if (attachment.type === "audio") {
                        audioElement.src = attachment.audio.url + '#t=' + offset;
                        audioElement.load();
                        audioElement.play();
                    }
                });
            });

            audioElement.onended = next;
        }
    };

    function next () {
        _.forEach(audios, function (item, index) {
            if (item.current) {
                var next;
                item.current = false;

                if (typeof audios[index + 1] == 'undefined') {
                    var currentTimestamp = Math.round(+new Date() / 1000);
                    var seed = Math.floor(currentTimestamp / totalTime);
                    audios = seedShuffle(audios, seed + audios.length);
                    next = audios[0];
                } else {
                    next = audios[index + 1];
                }

                next.current = true;
                document.body.style.backgroundImage="url(" + next.image + ")";
                title.innerText = next.artist + ' — ' + next.title;

                $.getJSON('https://api.vk.com/method/wall.getById?posts=-59680854_' + next.id + '&callback=?', function(data) {
                    var post = data.response.pop();

                    _.forEach(post['attachments'], function(attachment) {
                        if (attachment.type === "audio") {
                            audioElement.src = attachment.audio.url;
                            audioElement.load();
                            audioElement.play();
                        }
                    });
                });

                return false;
            }
        });
    }
})(this.ohradio = {});