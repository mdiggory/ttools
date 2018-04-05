var CLOCK_ICON = 'https://benoit-atmire.github.io/ttools/img/clock.png';
var HOURGLASS_ICON = 'https://benoit-atmire.github.io/ttools/img/hourglass.png';
var CLOCK_ICON_WHITE = 'https://benoit-atmire.github.io/ttools/img/clock_white.png';
var HOURGLASS_ICON_WHITE = 'https://benoit-atmire.github.io/ttools/img/hourglass_white.png';

TrelloPowerUp.initialize({

  'card-badges': function(t, options) {
    return getAllBadges(t);
  },
  'card-detail-badges': function(t, options) {
    return getAllBadges(t);
  }
});

function getAllBadges(t) {

   return t.card('all')
           .then(function (card) {
             var today = new Date();
             var creation = new Date(1000*parseInt(card.id.substring(0,8),16));
             var lastUpdate = new Date(card.dateLastActivity);
             var daysSinceCreation = Math.round(Math.abs((today.getTime() - creation.getTime())/(24*60*60*1000)));
             var daysSinceUpdate = Math.round(Math.abs((today.getTime() - lastUpdate.getTime())/(24*60*60*1000)));

             var badges = [{
                      icon: daysSinceCreation < 15 ? CLOCK_ICON : CLOCK_ICON_WHITE,
                      text: daysSinceCreation + " day" + (daysSinceCreation < 15 ? "" : "s"),
                      color: daysSinceCreation < 15 ? null : 'red',
                      title: 'Open for'
                    },
                    {
                      icon: daysSinceUpdate < 7 ? HOURGLASS_ICON : HOURGLASS_ICON_WHITE,
                      text: daysSinceUpdate + " day" + (daysSinceUpdate < 7 ? "" : "s"),
                      color: daysSinceUpdate < 7 ? null : 'red',
                      title: 'Inactive for'
                    }
             ];

             return badges;
           });
}