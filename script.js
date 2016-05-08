'use strict';

// den ganzen scheiss erst ausführen wenn alles geladen (sonst kann man noch nicht auf DOM Elemente zugreifen)
window.onload = function () {
    var save = document.getElementById('save');
    save.onclick = function() {
        screenshot();
    };

    var save = document.getElementById('reload');
    save.onclick = function() {
        location.reload();
    };


    // call `readURL` function whenever user chooses image
    $('#file').change(function(){
        readURL(this);
    });

    // take image from file input and show in <img> element
    function readURL(input) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#preview').attr('src', e.target.result);
            $('#overlay').css('display','initial');
            sendToMicrosoft(dataURItoBlob(e.target.result));
            $('#upload').css('display','none');
            $('#preview').css('display','initial');
            //$('#hashtags').css('display','inherit');
            $('#save').css('display','inherit');
            $('#reload').css('display','inherit');
        };

        reader.readAsDataURL(input.files[0]);
    }

    // send to microsoft api
    function sendToMicrosoft (imgStream) {
        $.ajax({
                url: "https://api.projectoxford.ai/emotion/v1.0/recognize",
                beforeSend: function (xhrObj) {
                    // Request headers
                    //xhrObj.setRequestHeader("Content-Type","application/json");
                    xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "ef69165828f145d4bee5383abcc96755");
                },
                type: "POST",
                crossDomain: true,
                processData: false,
                //dataType: 'jsonp',
                // Request body
                data: imgStream,
                //data: '{ "url": "https://static1.squarespace.com/static/524417d8e4b03b33d728eead/t/55f0269ae4b0e4faa5a3f12f/1441801887153/strong_family.png" }'
            })
            .done(function (data) {
                console.log("##### WEBREQUEST SUCCESS: RESPONSE: #####");
                console.log(data);
                $('#overlay').css('display','none');
                draw(data);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log("##### WEBREQUEST FAILED : Output: #####");
                console.log(textStatus);
                $('#overlay').css('display','none');
            });
    }

    // api benötigt binary file -> eingelesen wurde DataURI -> umwandeln
    function dataURItoBlob(dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
    }

    //draw img @postion from response
    function draw (data) {
        for (var i = 0; i<data.length; i++) {
            var face = $("<img>").attr('src', returnImgString(data[i])).attr('class', 'emoji').css(
                {
                    "left": data[i].faceRectangle.left/scaleFactor(),
                    "top": data[i].faceRectangle.top/scaleFactor(),
                    "width" : data[i].faceRectangle.width/scaleFactor()
                });
            $('#result').append(face);
            console.log ("scale = " + scaleFactor())
        }
    }

    function screenshot() {
        $('#save').css('display','none');
        $('#reload').css('display','none');
        var node = document.getElementById('result');
        console.log("jumping in");

        html2canvas(node, {
            onrendered: function(canvas) {
                canvas.toBlob(function(blob) {
                    saveAs(blob, "image.png");
                });
                //var img = canvas.toDataURL("image/jpeg;base64;");
                //document.getElementById("save").href = canvas.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
                //window.location.href=img;
                //document.body.appendChild(canvas);
            }
        });
        $('#save').css('display','inherit');
        $('#reload').css('display','inherit');
    }

    //scale factor original img to displayed img
    function scaleFactor () {
        var img = document.getElementById("preview");
        // console.log("Height",img.naturalHeight);
        return img.naturalWidth/img.clientWidth;
    }

    //return Img String to use
    function returnImgString (person) {
        return 'img/'+returnEmotion(person.scores)+'.png';
    }

    //return closest emotion value
    function returnEmotion (scores) {
        var max = Math.max.apply(null,Object.keys(scores).map(function(x){ return scores[x] }));
        var emotion = Object.keys(scores).filter(function(x){ return scores[x] == max; })[0];
        return emotion;
    }

};



