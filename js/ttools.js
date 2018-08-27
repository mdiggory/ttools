var CLOCK_ICON = 'https://benoit-atmire.github.io/ttools/img/clock.png';
var HOURGLASS_ICON = 'https://benoit-atmire.github.io/ttools/img/hourglass.png';
var CLOCK_ICON_WHITE = 'https://benoit-atmire.github.io/ttools/img/clock_white.png';
var HOURGLASS_ICON_WHITE = 'https://benoit-atmire.github.io/ttools/img/hourglass_white.png';
var W2P_ICON = 'https://benoit-atmire.github.io/ttools/img/w2p.png';
var GIT_ICON = 'https://benoit-atmire.github.io/ttools/img/gitlab.png';
var MONEY_ICON = 'https://benoit-atmire.github.io/ttools/img/money.svg';

var Promise = TrelloPowerUp.Promise;

TrelloPowerUp.initialize({
    'card-buttons': function(t, options){
    return getCardButtons(t);
    },
    'card-badges': function(t, options) {
    return getAllBadges(t, false);
    },
    'card-detail-badges': function(t, options) {
    return getAllBadges(t, true);
    },
    'show-settings': function(t, options){
      return t.popup({
        title: 'Settings',
        url: 'views/settings.html',
        height: 184,
        width: 600
      });
    }
});

function getAllBadges(t, long) {

   return t.getAll()
        .then(function(pluginData){

            //console.log(pluginData);

            var w2plink = "";
            var W2Psettings = {};

            if (pluginData && pluginData.card && pluginData.card.shared) var w2plink = pluginData.card.shared.w2plink || "";
            if (pluginData && pluginData.board && pluginData.board.shared) var W2Psettings = pluginData.board.shared.settings;


            return Promise.all([t.card('all'), getCreditsSpent(w2plink, W2Psettings.username, W2Psettings.password), t.getAll()]);
        })
        .then(function (values) {
            var card = values[0];

            var today = new Date();
            var creation = new Date(1000*parseInt(card.id.substring(0,8),16));
            var lastUpdate = new Date(card.dateLastActivity);
            var daysSinceCreation = Math.round(Math.abs((today.getTime() - creation.getTime())/(24*60*60*1000)));
            var daysSinceUpdate = Math.round(Math.abs((today.getTime() - lastUpdate.getTime())/(24*60*60*1000)));

            // Defaults when no setting

            var threshold_creation = 60;
            var threshold_update = 7;

            var settings = values[2].board.shared.settings;
            var hasSettings = (settings != '' && settings.c_thresholds && settings.u_thresholds);

            if (hasSettings && settings.c_thresholds[card.idList]) threshold_creation = settings.c_thresholds[card.idList];
            if (hasSettings && settings.u_thresholds[card.idList]) threshold_update = settings.u_thresholds[card.idList];

            var W2Psettings = values[2].board.shared.settings;
            var hasW2PSettings = (W2Psettings != '' && W2Psettings.username && W2Psettings.password);

            var badges = [{
                  icon: daysSinceCreation < threshold_creation ? CLOCK_ICON : CLOCK_ICON_WHITE,
                  text: daysSinceCreation + (long ? " day" + (daysSinceCreation < 2 ? "" : "s") : ""),
                  color: daysSinceCreation < threshold_creation ? null : 'red',
                  title: 'Open for'
                },
                {
                  icon: daysSinceUpdate < threshold_update ? HOURGLASS_ICON : HOURGLASS_ICON_WHITE,
                  text: daysSinceUpdate + (long ? " day" + (daysSinceUpdate < 2 ? "" : "s") : ""),
                  color: daysSinceUpdate < threshold_update ? null : 'red',
                  title: 'Inactive for'
                }
            ];

            if (values[2] && values[2].card && values[2].card.shared) {
                var w2plink = values[2].card.shared.w2plink || "";
                var gitlablink = values[2].card.shared.gitlablink || "";

                if (w2plink && w2plink != "") {
                    badges.push({
                        icon: W2P_ICON,
                        text: long ? 'W2P' : null,
                        url: w2plink,
                        title: 'Task / Project'
                    });

                    // If W2P credentials are known

                    if (hasW2PSettings){
                        badges.push({
                            icon: MONEY_ICON,
                            text: values[1] || 0,
                            title: 'Credits'
                        });
                    }
                }

                if (gitlablink && gitlablink != "") {
                    badges.push({
                        icon: GIT_ICON,
                        text: long ? 'Git' : null,
                        url: gitlablink,
                        title: 'Branch / Commit'
                    });
                }
            }
            return badges;

        })
}

function getCardButtons(t) {
    return t.getAll()
        .then(function (data){
            var w_label = "Add W2P link";
            var g_label = "Add Git link";

            if (data && data.card && data.card.shared && data.card.shared.w2plink && data.card.shared.w2plink != ""){
                w_label = "Edit W2P link";
            }
            if (data && data.card && data.card.shared && data.card.shared.gitlablink && data.card.shared.gitlablink != ""){
                g_label = "Edit Git link";
            }

            return [{
                  icon: W2P_ICON,
                  text: w_label,
                  callback: function(t){
                          return t.popup({
                            title: "W2P Link",
                            url: 'views/w2p.html'
                          });
                        }
                },
                {
                  icon: GIT_ICON,
                  text: g_label,
                  callback: function(t){
                          return t.popup({
                            title: "Git Link",
                            url: 'views/gitlab.html'
                          });
                        }
                    }];
        })
    ;
}

function getCreditsSpent(w2plink, username, password){
    if (!w2plink || w2plink == "" || !username || username == "" || !password || password == "") return 0;

    var taskId = getParams(w2plink).task_id;

    return new Promise(function (resolve, reject) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "https://atmire.com/w2p-api/project/x/task/" + taskId + "?username=" + username + "&password=" + password);
        xmlhttp.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            var response = JSON.parse(xmlhttp.responseText);
            var time = response.task.task_hours_worked;

            var credits = Math.round(time * 4);

            resolve(credits);

          } else {
            resolve(0);
          }
        };
        xmlhttp.onerror = function () {
          resolve(0);
        }
        xmlhttp.send();
    });
}


var getParams = function (url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};
