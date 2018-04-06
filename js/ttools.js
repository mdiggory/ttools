var CLOCK_ICON = 'https://benoit-atmire.github.io/ttools/img/clock.png';
var HOURGLASS_ICON = 'https://benoit-atmire.github.io/ttools/img/hourglass.png';
var CLOCK_ICON_WHITE = 'https://benoit-atmire.github.io/ttools/img/clock_white.png';
var HOURGLASS_ICON_WHITE = 'https://benoit-atmire.github.io/ttools/img/hourglass_white.png';
var W2P_ICON = 'https://benoit-atmire.github.io/ttools/img/w2p.png';
var GIT_ICON = 'https://benoit-atmire.github.io/ttools/img/gitlab.png';

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

   return Promise.all([t.card('all'), t.getAll(), t.get('board', 'shared', 'settings', '')])
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

            var settings = values[2];
            var hasSettings = (settings != '' && settings.c_thresholds && settings.u_thresholds);

            if (hasSettings && settings.c_thresholds[card.idList]) threshold_creation = settings.c_thresholds[card.idList];
            if (hasSettings && settings.u_thresholds[card.idList]) threshold_update = settings.u_thresholds[card.idList];

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

            if (values[1] && values[1].card && values[1].card.shared) {
                var w2plink = values[1].card.shared.w2plink || "";
                var gitlablink = values[1].card.shared.gitlablink || "";

                if (w2plink && w2plink != "") {
                    badges.push({
                        icon: W2P_ICON,
                        text: long ? 'W2P' : null,
                        url: w2plink,
                        title: 'Task / Project'
                    });
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