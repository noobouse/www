var roomHub = (function (hubConnection) {
    var hub = hubConnection.phomRoomHub;

    $.extend(hub.client, {
        joinRoom: function (room) {
            Phom.joinRoom(room);
        }
    });

    return hub;
}) ($.connection);