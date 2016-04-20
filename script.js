'use strict';

// den ganzen scheiss erst ausführen wenn alles geladen (sonst kann man noch nicht auf DOM Elemente zugreifen)
window.onload = function () {

    // call `readURL` function whenever user chooses image
    $('#file').change(function(){
        readURL(this);
    });

    // take image from file input and show in <img> element
    function readURL(input) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#preview').attr('src', e.target.result);
            sendToMicrosoft(dataURItoBlob(e.target.result));
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
                draw(data);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log("##### WEBREQUEST FAILED : Output: #####");
                console.log(textStatus);
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
            var face = $("<img>").attr('src', 'img/test.png').attr('class', 'emoji').css(
                {
                    "left": data[i].faceRectangle.left/scaleFactor(),
                    "top": data[i].faceRectangle.top/scaleFactor(),
                    "width" : data[i].faceRectangle.width/scaleFactor()
                });
            $('#result').append(face);
            console.log ("scale = " + scaleFactor());
        }
    }

    //scale factor original img to displayed img
    function scaleFactor () {
        var img = document.getElementById("preview");
        // console.log("Height",img.naturalHeight);
        return img.naturalWidth/img.clientWidth;
    }
};



