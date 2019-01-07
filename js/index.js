	// set the focus to the input box
    document.getElementById("wisdom").focus();
    
    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    // Provide your Pool Id here
        IdentityPoolId:'us-east-1:fc579ca4-7705-4e4c-a643-f3f7136f4aae',
    });

    var lexruntime = new AWS.LexRuntime();
    var lexUserId = 'chatbot-demo' + Date.now();
    var sessionAttributes = {};
    //sessionAttributes.UserName="Shushanth";
    //sessionAttributes.UserId="115";

    //funtion to load text in the page
    function pushChat() {
        // if there is text to be sent...
        var wisdomText = document.getElementById('wisdom');
        if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

            // disable input to show we're sending it
            var wisdom = wisdomText.value.trim();
            wisdomText.value = '...';
            wisdomText.locked = true;

            // send it to the Lex runtime
			 var params = {
				botAlias: '$LATEST',
				botName: 'testBot',
				inputText: wisdom,
				userId: lexUserId,
				sessionAttributes: sessionAttributes
			};
			console.log(sessionAttributes);
            showRequest(wisdom);
            lexruntime.postText(params, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    showError('Error:  ' + err.message + ' (see console for details)')
                }
                if (data) {
                    // capture the sessionAttributes for the next cycle
                    sessionAttributes = data.sessionAttributes;
                    // show response and/or error/dialog status
                    console.log(data);
                    showResponse(data);
                }
                // re-enable input
                wisdomText.value = '';
                wisdomText.locked = false;
            });
        }
        // we always cancel form submission
        return false;
    }

    function showRequest(daText) {
        var conversationDiv = document.getElementById('conversation');
        var requestPara = document.createElement("P");
        requestPara.className = 'userRequest';
        requestPara.appendChild(document.createTextNode(daText));
        conversationDiv.appendChild(requestPara);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    function showError(daText) {
        
        var conversationDiv = document.getElementById('conversation');
        var errorPara = document.createElement("P");
        errorPara.className = 'lexError';
        errorPara.appendChild(document.createTextNode(daText));
        conversationDiv.appendChild(errorPara);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    function showResponse(lexResponse) {
        var conversationDiv = document.getElementById('conversation');
        var responsePara = document.createElement("P");
        responsePara.className = 'lexResponse';
        if (lexResponse.message) {
            responsePara.appendChild(document.createTextNode(lexResponse.message));
            responsePara.appendChild(document.createElement('br'));
        }
        if (lexResponse.dialogState === 'ReadyForFulfillment') {
            responsePara.appendChild(document.createTextNode(
                'Ready for fulfillment'));
            // TODO:  show slot values
        } else {
            responsePara.appendChild(document.createTextNode(
                '(' + lexResponse.dialogState + ')'));
        }
        conversationDiv.appendChild(responsePara);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }


var waveform = window.Waveform();
var message = document.getElementById('message');
var config, conversation;
message.textContent = 'Passive';

document.getElementById('audio-control').onclick = function () {

    config = {
        lexConfig: { 
            botAlias: '$LATEST',
            botName: 'testBot',
            userId: lexUserId,
            sessionAttributes: sessionAttributes
         }
    };

    conversation = new LexAudio.conversation(config, function (state) {
        message.textContent = state + '...';
        if (state === 'Listening') {
            waveform.prepCanvas();
        }
        if (state === 'Sending') {
            waveform.clearCanvas();
        }
    }, function (data) {
        console.log(data);
        showRequest(data.inputTranscript);
        showResponse(data);
		sessionAttributes = data.sessionAttributes;
        console.log('Transcript: ', data.inputTranscript, ", Response: ", data.message);
    }, function (error) {
        message.textContent = error;
    }, function (timeDomain, bufferLength) {
        waveform.visualizeAudioBuffer(timeDomain, bufferLength);
    });
    conversation.advanceConversation();
};