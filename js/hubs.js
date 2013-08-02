/*!
 * ASP.NET SignalR JavaScript Library v1.1.2
 * http://signalr.net/
 *
 * Copyright Microsoft Open Technologies, Inc. All rights reserved.
 * Licensed under the Apache 2.0
 * https://github.com/SignalR/SignalR/blob/master/LICENSE.md
 *
 */

/// <reference path="..\..\SignalR.Client.JS\Scripts\jquery-1.6.4.js" />
/// <reference path="jquery.signalR.js" />
(function ($, window) {
    /// <param name="$" type="jQuery" />
    "use strict";

    if (typeof ($.signalR) !== "function") {
        throw new Error("SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/hubs.");
    }

    var signalR = $.signalR;

    function makeProxyCallback(hub, callback) {
        return function () {
            // Call the client hub method
            callback.apply(hub, $.makeArray(arguments));
        };
    }

    function registerHubProxies(instance, shouldSubscribe) {
        var key, hub, memberKey, memberValue, subscriptionMethod;

        for (key in instance) {
            if (instance.hasOwnProperty(key)) {
                hub = instance[key];

                if (!(hub.hubName)) {
                    // Not a client hub
                    continue;
                }

                if (shouldSubscribe) {
                    // We want to subscribe to the hub events
                    subscriptionMethod = hub.on;
                }
                else {
                    // We want to unsubscribe from the hub events
                    subscriptionMethod = hub.off;
                }

                // Loop through all members on the hub and find client hub functions to subscribe/unsubscribe
                for (memberKey in hub.client) {
                    if (hub.client.hasOwnProperty(memberKey)) {
                        memberValue = hub.client[memberKey];

                        if (!$.isFunction(memberValue)) {
                            // Not a client hub function
                            continue;
                        }

                        subscriptionMethod.call(hub, memberKey, makeProxyCallback(hub, memberValue));
                    }
                }
            }
        }
    }

    $.hubConnection.prototype.createHubProxies = function () {
        var proxies = {};
        this.starting(function () {
            // Register the hub proxies as subscribed
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, true);

            this._registerSubscribedHubs();
        }).disconnected(function () {
            // Unsubscribe all hub proxies when we "disconnect".  This is to ensure that we do not re-add functional call backs.
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, false);
        });

        proxies.phomHub = this.createHubProxy('phomHub'); 
        proxies.phomHub.client = { };
        proxies.phomHub.server = {
            anBai: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["AnBai"], $.makeArray(arguments)));
             },

            autoPlay: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["AutoPlay"], $.makeArray(arguments)));
             },

            bocBai: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["BocBai"], $.makeArray(arguments)));
             },

            danhBai: function (cardValue) {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["DanhBai"], $.makeArray(arguments)));
             },

            haBai: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["HaBai"], $.makeArray(arguments)));
             },

            haBaiInHand: function (cardValues) {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["HaBaiInHand"], $.makeArray(arguments)));
             },

            leaveGame: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["LeaveGame"], $.makeArray(arguments)));
             },

            playNow: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["PlayNow"], $.makeArray(arguments)));
             },

            pong: function (time) {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["Pong"], $.makeArray(arguments)));
             },

            sortHandCards: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["SortHandCards"], $.makeArray(arguments)));
             },

            startGame: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["StartGame"], $.makeArray(arguments)));
             },

            uThuong: function () {
                return proxies.phomHub.invoke.apply(proxies.phomHub, $.merge(["UThuong"], $.makeArray(arguments)));
             }
        };

        return proxies;
    };

    signalR.hub = $.hubConnection(BASE_URL + "/signalr", { useDefaultPath: false });
    $.extend(signalR, signalR.hub.createHubProxies());

}(window.jQuery, window));