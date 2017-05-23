var fs = require('fs'),
    xml2js = require('xml2js'),
    seedrandom = require('seedrandom'),
    Promise = require("promise");

var parser = new xml2js.Parser();

var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return keys[ keys.length * Math.random() << 0];
};

var banned = ['gargoyle', 'ghost', 'pawn', 'queen', 'bishop', 'rook', 'knight'];

var aoeEnemies = ['yeti', 'mushroom'];

var bannedItems = [];

var getRandomEnemy = function(clone) {
    var enemy;
    while (banned.indexOf(enemy = randomProperty(clone)) != -1
        || !enemy
        || !clone[enemy][0].$.id) {
        if(!enemy) return false;
        delete clone[enemy];
    }
    if(!enemy) return false;

    var obj = clone[enemy];
    var ranIndex = obj.length * Math.random() << 0;

    var objEnemy = JSON.parse(JSON.stringify(clone[enemy].splice(ranIndex, 1)[0]));

    if(!clone[enemy].length) delete clone[enemy];

    return objEnemy;
};

var getRandomItem = function(clone) {
    var item;
    while (bannedItems.indexOf(item = randomProperty(clone)) != -1
        || !item
        || clone[item][0].$.levelEditor=="False"
        || !clone[item][0].$.coinCost) {
        if(!item) return false;
        delete clone[item];
    }
    if(!item) return false;

    var obj = clone[item];
    var ranIndex = obj.length * Math.random() << 0;

    var objItem = JSON.parse(JSON.stringify(clone[item].splice(ranIndex, 1)[0]));

    if(!clone[item].length) delete clone[item];

    return objItem;
};


var randomizeND = function(options) {
    options.seed = options.seed || (Math.floor(Math.random() * 16777217)).toString();
    seedrandom(options.seed, { global: true });

    var switches = {
        enemies: '',
        items: ''
    }

    var xmlToUse = options.original ? '/necrodancer-original.xml' : '/necrodancer-original-amplified.xml';

    var promise = new Promise(function(resolve, reject) {
        fs.readFile(__dirname + xmlToUse, function(err, data) {
            parser.parseString(data, function (err, result) {
                var origXMLObj = result,
                    clone = JSON.parse(JSON.stringify(origXMLObj)),
                    enemies = origXMLObj.necrodancer.enemies[0],
                    items = origXMLObj.necrodancer.items[0];


                //switch ids and stats/optional stats

                for(var enemy in enemies) {
                    if(banned.indexOf(enemy) != -1 || !enemies[enemy][0].$.id) continue;
                    for(var i = 0; i < enemies[enemy].length; i++) {
                        var ranEnemy = getRandomEnemy(clone.necrodancer.enemies[0]);
                        if(!ranEnemy) break;

                        switches.enemies += (enemies[enemy][i].$.friendlyName+new Array(23).join(' ')).slice(0, 23)+' → '+(ranEnemy.$.friendlyName||ranEnemy.$.id)+'\n';
                        var isMiniboss = false;
                        if(enemies[enemy][i].optionalStats && enemies[enemy][i].optionalStats[0].$ && enemies[enemy][i].optionalStats[0].$.miniboss=="True") {
                            isMiniboss = true;
                        }
                        delete enemies[enemy][i].optionalStats;
                        delete enemies[enemy][i].bouncer;
                        if(ranEnemy.optionalStats) enemies[enemy][i].optionalStats = ranEnemy.optionalStats;
                        else if(isMiniboss) enemies[enemy][i].optionalStats = [{$:{}}];
                        if(ranEnemy.bouncer) enemies[enemy][i].bouncer = ranEnemy.bouncer;
                        if(ranEnemy.stats[0].$.movement == "custom") {
                            // custom movement on enemies without it doesn't work
                            ranEnemy.stats[0].$.movement = enemies[enemy][i].stats[0].$.movement;
                        }
                        enemies[enemy][i].stats = ranEnemy.stats;
                        if(!options.unfair) {
                            // if "fair" aoe enemies can't have every beat movement
                            if(aoeEnemies.indexOf(enemy) != -1 && enemies[enemy][i].stats[0].$.beatsPerMove=="1") {
                                enemies[enemy][i].stats[0].$.beatsPerMove = "2";
                            }
                            // if "fair" and movement 1 every beat lower health
                            if(enemies[enemy][i].stats[0].$.beatsPerMove=="1") {
                                enemies[enemy][i].stats[0].$.health = "1";
                            }
                        }
                        // set food shopkeeper to have only one health to prevent crashing
                        if(enemies[enemy][i].$.id === "603") {
                            enemies[enemy][i].stats[0].$.health = "1";
                        }
                        if(enemies[enemy][i].optionalStats) {
                            if(isMiniboss) enemies[enemy][i].optionalStats[0].$.miniboss = "True";
                            else if(enemies[enemy][i].optionalStats[0].$ && enemies[enemy][i].optionalStats[0].$.miniboss) delete enemies[enemy][i].optionalStats[0].$.miniboss;
                        }
                    }
                }

                // switch items



                for(var item in items) {
                    if(banned.indexOf(item) != -1 || items[item][0].$.levelEditor=="False" || !items[item][0].$.coinCost) continue;
                    for(var i = 0; i < items[item].length; i++) {
                        var ranItem = getRandomItem(clone.necrodancer.items[0]);
                        if(!ranItem) break;


                        switches.items += (items[item][i].$.flyaway.replace(/(\|\d+\||\|)/g,'')+new Array(28).join(' ')).slice(0, 28)+' → '+ranItem.$.flyaway.replace(/(\|\d+\||\|)/g,'')+'\n';

                        var switchArgs = [
                            'chestChance',
                            'shopChance',
                            'urnChance',
                            'coinCost',
                            'lockedChestChance',
                            'lockedShopChance',
                            //'slot'
                        ];

                        for(var j = 0; j < switchArgs.length; j++) {
                            if(items[item][i].$[switchArgs[j]]) delete items[item][i].$[switchArgs[j]];
                            if(ranItem.$[switchArgs[j]]) items[item][i].$[switchArgs[j]] = ranItem.$[switchArgs[j]];
                        }
                    }
                }

                origXMLObj.necrodancer.enemies[0] = enemies;
                origXMLObj.necrodancer.items[0] = items;
                var builder = new xml2js.Builder();
                var xml = builder.buildObject(origXMLObj);

                xml =   xml.replace(/^(<\?xml[^?]+\?>)/,'$1\n<!-- seed: '+options.seed+' -->')
                        + '<!-- \n**** Enemy switches ****\n'
                        + switches.enemies
                        + '\n**** Item chances switches ****\n'
                        + switches.items
                        + '-->';

                if(options.writeFile) {
                    fs.writeFile(options.dest || __dirname + '/necrodancer.xml', xml);
                }

                console.log(Date()+' - Generated XML for seed: '+options.seed);

                resolve(xml);

            });
        });
    });

    return promise;
}


module.exports = randomizeND;