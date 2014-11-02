'use strict';

/* Services */
angular.module('ds.services', [])
.factory('Base64', function() {
        var keyStr = 'ABCDEFGHIJKLMNOP' +
                'QRSTUVWXYZabcdef' +
                'ghijklmnopqrstuv' +
                'wxyz0123456789+/' +
                '=';
        return {
            encode: function(input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                            keyStr.charAt(enc1) +
                            keyStr.charAt(enc2) +
                            keyStr.charAt(enc3) +
                            keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);

                return output;
            },
            decode: function(input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/\=]/g;
                if (base64test.exec(input)) {
                    alert("There were invalid base64 characters in the input text.\n" +
                            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                            "Expect errors in decoding.");
                }
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                do {
                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }

                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";

                } while (i < input.length);

                return output;
            }
        };
    })
.factory('AuthFactory', ['$http', 'Base64', 'config', function($http, Base64, config) {

    var AuthFactory = {};

    AuthFactory.signup = function(newUser) {        
        return $http.post(config.SERVICE_BASE_URL + 'users/signup', JSON.stringify(newUser));
    };


    AuthFactory.signIn = function(username, password) {
	        var hash = Base64.encode(username + ':' + password);
	        sessionStorage.token = hash;

	        $http.defaults.headers.common['Authorization'] = 'Basic ' + hash;
	        $http.defaults.headers.common['WWW-Authenticate'] = 'Basic realm="deepstream"'

	        return $http.get(config.SERVICE_BASE_URL + 'users/auth');
	    };

    AuthFactory.signOut = function() {
        delete $http.defaults.headers.common['Authorization'];
        delete $http.defaults.headers.common['WWW-Authenticate'];
    }
          
    return AuthFactory;
}])
.factory('DashboardFactory', ['$http', function($http) {

    var DashboardFactory = {};

    DashboardFactory.countryMap = function(query) {
        var url = 'data/country.json';
        return $http.get(url);
    };

    DashboardFactory.matchingKeyword = function(query) {
        var url = 'data/treemap.json';
        return $http.get(url);
    };
          
    return DashboardFactory;
}])
.factory('SearchFactory', ['$http', function($http) {

    var SearchFactory = {};

    SearchFactory.search = function(query) {
        var url = '../data/search-result.json';
        return $http.get(url);
    };
          
    return SearchFactory;
}])
.factory('FeedsFactory', ['$http', function($http) {

    var FeedsFactory = {};
    var URL = 'http://localhost:8080/deepstream/v1/feeds/ingestion';

    FeedsFactory.ingestionFeeds = function() {        
        return $http.get(URL);
    };
          
    return FeedsFactory;
}])