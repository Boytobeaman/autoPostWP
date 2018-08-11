var url = require('url');
var _ = require('lodash');
// to get customize links for other sites
// promotion category like folding/stacking/pallet box/moving dolly
var total_promote_cat = [];

var foldingcrates_OBJ = require('./keywords/foldingcrates');
total_promote_cat.push(foldingcrates_OBJ)

var stackingcrates_OBJ = require('./keywords/stackingcrates');
total_promote_cat.push(stackingcrates_OBJ)

var palletbox_OBJ = require('./keywords/palletbox');
total_promote_cat.push(palletbox_OBJ)

var movingcrates_OBJ = require('./keywords/movingcrates');
total_promote_cat.push(movingcrates_OBJ)

var movingdolly_OBJ = require('./keywords/movingdolly');
total_promote_cat.push(movingdolly_OBJ)

var getRandomArrValue = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

// get a disorganized arr compared to previous one
var disorganizeArr = function (arr) {
    return arr.sort(() => Math.random() - 0.5);
};

var MongoClient = require('mongodb').MongoClient;
var mongodb_url = "mongodb://47.74.64.136:27017/";

MongoClient.connect(mongodb_url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("joinplastic");
    kkkk = dbo.collection("descriptions").aggregate([{
        $match: {
            category: "pallet boxes"
        }
    }, {
        $sample: {
            size: 30
        }
    }]).toArray();
    console.log(kkkk)

});





module.exports = {
    internal: function (address, whole_cat_obj,obj) {
        var target_host = url.parse(address, true).host;
        var prefix = '';
        var suffix = 'We will try our best to serve you!<br>';
        var element = "";
        let total_promote_cat = whole_cat_obj;
        var newDisorderedArr = disorganizeArr(total_promote_cat.concat());
        for (let index = 0; index < newDisorderedArr.length; index++) {
            var websites = disorganizeArr(newDisorderedArr[index].websites.concat());
            var descriptions = disorganizeArr(newDisorderedArr[index].descriptions);
            var pick_description = descriptions.splice(_.random(0, descriptions.length-1), 1)[0].description;
            pick_description = pick_description.replace(/\.\.\.$/, ".");
            websites.forEach(function (value) {
                if (url.parse(value, true).host == target_host) {
                    let selectedKeywords = getRandomArrValue(newDisorderedArr[index].keywords)
                    if (obj.title.length < 40) {
                        obj.title += `${selectedKeywords} `
                    }
                    element += `${pick_description} <a href="${value}" target="_blank">${selectedKeywords}</a>,`
                }
            })
        }
        return element != "" ? prefix + element + suffix : element;
    },
    outbound: function (address, whole_cat_obj,obj) {
        let total_promote_cat = whole_cat_obj;
        var target_host = url.parse(address, true).host;
        var prefix = 'You can also buy ';
        var suffix = 'Welcome to our store!<br>';
        var element = "";
        var linkNumber = 2;
        var genLinkNumber = 0;
        var newDisorderedArr = disorganizeArr(total_promote_cat.concat());
        for (let index = 0; index < newDisorderedArr.length; index++) {
            var websites = disorganizeArr(newDisorderedArr[index].websites.concat());
            var descriptions = disorganizeArr(newDisorderedArr[index].descriptions);
            var pick_description = descriptions.splice(_.random(0, descriptions.length-1), 1)[0].description;
            pick_description = pick_description.replace(/\.\.\.$/, ".");
            if (genLinkNumber <= linkNumber) {
                for (let websitesIndex = 0; websitesIndex < websites.length; websitesIndex++) {
                    if (url.parse(websites[websitesIndex], true).host != target_host) {
                        let selectedKeywords = getRandomArrValue(newDisorderedArr[index].keywords)
                        if (obj.title == "") {
                            obj.title = `${selectedKeywords} `
                        }
                        element += `${pick_description} <a href="${websites[websitesIndex]}" target="_blank">${selectedKeywords}</a>,`
                        genLinkNumber++;
                        break
                    }
                }
            }else{
                element = `${pick_description} + ${element}`
            }
            
        }
        return element != "" ? prefix + element + suffix : element;
    },
    links: function (address,whole_cat_obj) {
        let obj = {}
        obj.title = ''
        let content = this.internal(address, whole_cat_obj,obj) + this.outbound(address, whole_cat_obj,obj);
        return { content: content, title: _.startCase(obj.title)}
    }
};