var CLOCK_ICON = 'https://benoit-atmire.github.io/ttools/img/clock.png';
var HOURGLASS_ICON = 'https://benoit-atmire.github.io/ttools/img/hourglass.png';
var CLOCK_ICON_WHITE = 'https://benoit-atmire.github.io/ttools/img/clock_white.png';
var HOURGLASS_ICON_WHITE = 'https://benoit-atmire.github.io/ttools/img/hourglass_white.png';
var W2P_ICON = 'https://benoit-atmire.github.io/ttools/img/w2p.png';
var GIT_ICON = 'https://benoit-atmire.github.io/ttools/img/gitlab.png';

var Promise = TrelloPowerUp.Promise;

TrelloPowerUp.initialize({
  'card-buttons': function(t, options){
    return [{
      icon: W2P_ICON,
      text: 'Add W2P link',
      callback: function(t){
              return t.popup({
                title: "W2P Link",
                url: 'views/w2p.html'
              });
            }
    },
    {
          icon: GIT_ICON,
          text: 'Add Git link',
          callback: function(t){
                  return t.popup({
                    title: "Git Link",
                    url: 'views/gitlab.html'
                  });
                }
        }];
  },
  'card-badges': function(t, options) {
    return getAllBadges(t, false);
  },
  'card-detail-badges': function(t, options) {
    return getAllBadges(t, true);
  }
});

function getAllBadges(t, long) {

   return Promise.all([t.card('all'), t.getAll()])
        .then(function (values) {

            var card = values[0];

            var today = new Date();
            var creation = new Date(1000*parseInt(card.id.substring(0,8),16));
            var lastUpdate = new Date(card.dateLastActivity);
            var daysSinceCreation = Math.round(Math.abs((today.getTime() - creation.getTime())/(24*60*60*1000)));
            var daysSinceUpdate = Math.round(Math.abs((today.getTime() - lastUpdate.getTime())/(24*60*60*1000)));

            var badges = [{
                  icon: daysSinceCreation < 30 ? CLOCK_ICON : CLOCK_ICON_WHITE,
                  text: daysSinceCreation + (long ? " day" + (daysSinceCreation < 2 ? "" : "s") : ""),
                  color: daysSinceCreation < 30 ? null : 'red',
                  title: 'Open for'
                },
                {
                  icon: daysSinceUpdate < 7 ? HOURGLASS_ICON : HOURGLASS_ICON_WHITE,
                  text: daysSinceUpdate + (long ? " day" + (daysSinceUpdate < 2 ? "" : "s") : ""),
                  color: daysSinceUpdate < 7 ? null : 'red',
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