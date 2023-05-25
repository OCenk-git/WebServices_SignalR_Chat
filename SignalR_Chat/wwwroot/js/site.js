let chat;

let username;

init();

function init()
{
    $('#displayname').val(prompt('Bitte Namen eingeben:', ''));

    username = $('#displayname').val();

    if (username === undefined || username === '')
    {
        username = "ChatUser" + Math.floor(Math.random() * (100 - 1) + 1);
    }

    $('#username').text(username);

    $('#deselect').on('click', () => $("#teilnehmer").val([]));

    chatStart();
}

function chatStart()
{
    chat = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();

    chat.on("sendServerError", (errorMessage) =>
    {
        alert(errorMessage);
        init();
    });

    chat.start().then(() =>
    {
        chat.invoke("SignOn", username);

        $('#sendmessage').on("click", sendButtonClick);
    });

    chat.on("receiveMsg", (message) =>
    {
        $('#discussion').prepend(message + '\n');
    });

    chat.on("handleSignOn", (chatNames) =>
    {
        $("#teilnehmer").empty();
        $("#teilnehmer").append('<option disabled="disabled">Benutzer auswählen</option>');

        for (let i = 0; i < chatNames.length; i++)
        {
            if (chatNames[i] !== username)
            {
                $("#teilnehmer").append('<option value="' + chatNames[i] + '">' + chatNames[i] + '</option>');
            }
        }
    });

    chat.on("handleSignOff", (chatName) =>
    {
        $("#teilnehmer option[value='" + chatName + "']").remove();
    });
}

function sendButtonClick()
{
    let message = username + ": " + $('#message').val();

    let selectedUser = $('#teilnehmer option:selected').val();

    if (selectedUser === undefined)
    {
        chat.invoke("BroadcastMsg", message);
    }
    else
    {
        chat.invoke("SendMsg", selectedUser, message);
    }

    $('#message').val('').focus();
}