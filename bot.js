// Requires
var irc = require('irc');

var ircServer = 'irc.mozilla.org',
    nick = '_SumoDayBot',
    options = {
      channels: ['#sumo'],
      autoRejoin: true,
    },
    client = new irc.Client(ircServer, nick, options),
    lastQuit = {},
    metrics = {
      greetedName: [],
      greetedNumber: 0,
      firebotBugs:[],
      usersTalked: {},
    };

client.addListener('join', function(channel, who){
  if (who !== nick){
    var lastMessageTime = Date.now() - lastQuit[who];

    if (lastQuit[who]){
      switch (true){
        case (lastMessageTime < 1800000):
          break;
        case (lastMessageTime < 86400000):
          setTimeout(function(){ 
            client.say(channel, "Welcome back to the SUMO Day " + who + "!");
          }, 2000);
          break;
      }
    } else {
      console.log("Greeted " + who);
      setTimeout(function(){ 
        client.say(channel, "hello " + who + " and welcome to SUMO Day, take some time to help with unanswered questions. http://support.mozilla.org/questions?filter=no-replies");
        }, 2000);
      metrics.greetedName.push(who);
      metrics.greetedNumber +=1;
    }
  }
});

client.addListener('message', function(from, to, message){
  if (from in metrics.usersTalked) {
    metrics.usersTalked[from] += 1;
  } else {
    metrics.usersTalked[from] = 1;
  }
});

client.addListener('quit', function(who, reason, channel){
  lastQuit[who] = Date.now();
});

client.addListener('part', function(channel, who, reason){
  lastQuit[who] = Date.now();
});

client.addListener('error', function(message){
  console.error(message);
});

setTimeout(function(){
    var stats = new Stats();
    stats.generateStats(metrics);
    process.exit()
  }, 86400000);


var Stats = function(){};

Stats.prototype.generateStats = function(metrcs){
  var keys = Object.keys(metrcs);
  var what = Object.prototype.toString;
  for (var i = 0; i < keys.length; i++){
    if (what.call(metrcs[keys[i]]).search('Array') > 0){
      console.log(keys[i] + ":  " + metrcs[keys[i]].join(", "));
    } else {
      if (keys[i] == "usersTalked"){
        console.log("The following people were active in the channel: ");
        var speakers = Object.keys(metrcs.usersTalked);
        for (var t = 0; t < speakers.length; t++){
          console.log(speakers[t] + ": " + metrcs.usersTalked[speakers[t]]); 
        }
      } else {
        console.log(keys[i] + ": " + metrcs[keys[i]]);
      }
    }
  }
};
