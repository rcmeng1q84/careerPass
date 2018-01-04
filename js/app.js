(function () {


    // Init F7 Vue Plugin
    Vue.use(Framework7Vue)


    var states = {
        postCategory : '',
        postTag      : '',
        postTime     : '',
        post         :
            {
                category: ''
            }
        ,
        dailyData    : [],
        tagInCategory: [],
        relatedTags  : [],
        keyword      : '',
        searchResults: [],
        user         :
            {
                name : 'MAS-8803',
                email: 'rjk09@gatech.edu'
            },
        addedTags    : [],
        chartTag     : '',
        chartTagData : 20,
        date         :
            {
                year     : 2017,
                month    : 11,
                month_str: 'Nov',
                date     : 1,
                week     : 1,
                str      : ''
            },
        grades:[
            'freshman',
            'sophomore',
            'junior',
            'senior',
            'postgraduate'
        ]
    };

    var config = {
        apiKey           : "AIzaSyC8KN1NWozMPXGhSdnpG5xXK5J8omgL7dM",
        authDomain       : "careerpass-3356a.firebaseapp.com",
        databaseURL      : "https://careerpass-3356a.firebaseio.com",
        projectId        : "careerpass-3356a",
        storageBucket    : "careerpass-3356a.appspot.com",
        messagingSenderId: "847951009387"
    };


    var db = firebase.initializeApp(config).database()

    var postsRef = db.ref('post')
    var postTagToRef = db.ref('post/20171001')
    var aaaRef = db.ref('TagDetail')

    // Init Page Components
    Vue.component('page-about', {
        template: '#page-about'
    })

    Vue.component('page-dynamic-routing', {
        template: '#page-tagInfo',
        data    : function () {
            return states;
        },
        mounted : function () {
            console.log('mounted')
            this.drawChart();
            this.chartTag = this.$route.params.tagName
            console.log(this.chartTag)
        },
        watch   : {
            chartTag: function () {
                this.drawChart();

            }
        },

        firebase:
            {
                connection: postsRef
            }
        ,

        methods: {
            linkTo           : function (str) {
                this.chartTag = str;
                this.chartTagData += 5;
            },
            drawChart        : function () {
                console.log('draw')
                var chart = new Chartist.Line('.ct-chart', {
                    labels: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ''],
                    series:
                        [{
                            name: 'all',
                            //data: randomNums(this.chartTagData)
                            data: this.getGraphDataByTag('201711', this.chartTag)
                        }, {
                            name: 'current',
                            data: [null, null, null, null, null, null, null, null, null, null, null, this.chartTagData, null, null]
                        }]

                }, {
                    series   : {
                        'all'    : {
                            showArea : true,
                            showPoint: false,
                            showLine : false,
                        },
                        'current': {
                            showArea : false,
                            showPoint: true,
                            showLine : false,

                        }
                    },
                    fullWidth: true,
                    low      : 0,

                    chartPadding: {
                        left : 0,
                        right: 0
                    },
                    axisY       : {
                        //type: Chartist.AutoScaleAxis,
                        //onlyInteger: true
                        onlyInteger: true,
                        showLabel  : true,
                        labelOffset: {
                            x: 48,
                            y: 0
                        },

                    },
                    axisX       : {
                        showGrid   : false,
                        labelOffset: {
                            x: -8,
                            y: 0
                        },
                    },
                    lineSmooth  : Chartist.Interpolation.simple({
                        divisor: 2
                    }),
                });
                chart.on('draw', function (data) {
                    if (data.type === 'point') {
                        //data.element.addClass('rubberBand animated');
                    }
                    if (data.type === 'line' || data.type === 'area') {
                        data.element.animate({
                            d: {
                                begin : 2000 * data.index,
                                dur   : 2000,
                                from  : data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                                to    : data.path.clone().stringify(),
                                easing: Chartist.Svg.Easing.easeOutQuint
                            }
                        });
                    }
                });
                console.log(this.$route.url)
                //console.log(this.getGraphDataByTag('201712', 'on campus interview'))
            },
            getGraphDataByTag:
                function (date, tag) {
                    var mon = date % 100;
                    var year = Math.round(date / 100);
                    var json = [];
                    for (var ind = 1; ind <= 12; ind++) {
                        if (ind < mon) {
                            if (ind < 10) {
                                json.push({'count': 0, 'ratio': 0, 'time': (year) + '0' + (ind)});
                            } else {
                                json.push({'count': 0, 'ratio': 0, 'time': (year) + '' + (ind)});
                            }
                        } else {
                            if (ind < 10) {
                                json.push({'count': 0, 'ratio': 0, 'time': (year - 1) + '0' + (ind)});
                            } else {
                                json.push({'count': 0, 'ratio': 0, 'time': (year - 1) + '' + (ind)});
                            }
                        }
                    }
                    for (var time in this.connection) {
                        var t1 = this.connection[time];
                        for (var cate in t1) {
                            var t2 = t1[cate];
                            for (var tagin in t2['tag']) {
                                var taginName = t2['tag'][tagin]['tag'];
                                //console.log(tag)
                                if (taginName.toLowerCase() === tag.toLowerCase()) {
                                    var cur = Math.round(this.connection[time]['.key'] / 100);

                                    var curYear = Math.round(cur / 100);
                                    if (curYear < year && cur % 100 >= mon || curYear === year && cur % 100 < mon) {
                                        var tarMon = cur % 100;
                                        json[tarMon - 1]['count'] += t2['count'];
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    var total = 0;
                    for (var content in json) {
                        total += json[content]['count'];
                    }
                    var tempResult = [];
                    var result = [];
                    for (var content2 in json) {
                        if (total == 0) {
                            json[content2]['ratio'] = 0 + '%';
                        } else {
                            json[content2]['ratio'] = Math.round(json[content2]['count'] * 100.0 / total) + '%';
                        }
                        tempResult.push(json[content2]['count']);

                    }
                    result.push(tempResult[0]);
                    for (var i = 0; i < tempResult.length; i++) {
                        result.push(tempResult[i]);
                        if (date % 100 === i + 1) {
                            this.chartTagData = tempResult[i];
                        }
                    }
                    result.push(tempResult[11]);
                    console.log(json);
                    return result;
                },
            getDate          :
                function () {
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1; //January is 0!
                    var yyyy = today.getFullYear();
                    if (dd < 10) {
                        dd = '0' + dd
                    }
                    if (mm < 10) {
                        mm = '0' + mm
                    }
                    return yyyy + '' + mm;
                }
        }

    })

    Vue.component('page-search', {
        template: '#page-form',
        data    : function () {
            return states;
        },
        methods : {
            searchTags:
                function (str) {
                    //console.log(this.fb_allPosts)
                    var data = this.fb_allPosts;
                    var result = [];
                    for (var k in data) {
                        for (var c in data[k]) { //category

                            for (var t in data[k][c]['tag']) { //tag
                                var tag = data[k][c]['tag'][t];

                                if (tag['tag'].toLowerCase().includes(str.toLowerCase()))
                                    result.push({
                                        name    : tag['tag'],
                                        category: data[k][c]['name']
                                    });
                                //console.log(data[k][c])
                            }
                        }
                    }

                    return result;

                }
        },
        firebase:
            {
                fb_allPosts: postsRef
            }
        ,
        watch   : {
            keyword: function (newKeyword) {
                if (newKeyword !== '') {
                    this.searchResults = this.searchTags(newKeyword);
                    //console.log(this.searchResults)

                }
                else {
                    this.searchResults = [];
                }

            }
        },
        computed: {

            uniqSearchResults: function () {
                var arrN = [];
                var arrC = [];
                var filtered_array = [];
                for (var i = 0; i < this.searchResults.length; i++) {
                    if (arrN.indexOf(this.searchResults[i].name) === -1) {
                        arrN.push(this.searchResults[i].name)
                        arrC.push(this.searchResults[i].category)
                    }
                }
                for (var j = 0; j < arrC.length; j++) {
                    if (!arrC[j]) {
                        arrC[j] = 'interview'
                    }
                    filtered_array.push({
                        name    : arrN[j],
                        category: arrC[j]
                    })
                }

                this.relatedTags = arrN;
                return filtered_array;
            }


        }
    });


    // Init App
    var vm = new Vue({
            el: '#app',

            framework7: {
                root: '#app',

                material: true, /* enable Material theme: */
                routes  : [
                    {
                        path     : '/about/',
                        component: 'page-about'
                    },
                    {
                        path     : '/form/',
                        component: 'page-search'
                    },
                    {
                        path     : '/tagInfo/:tagName',
                        component: 'page-dynamic-routing'
                    }
                ],

            },

            firebase: {

                    fb_allPosts : postsRef,
                    fb_aaa      : aaaRef,
                    fb_postTagTo: postTagToRef

                },

            mounted: function () {

                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!
                var yyyy = today.getFullYear();

                this.date.year = yyyy;

                this.date.month = mm;
                this.date.date = dd;
                this.updateDateStr();


            },

            methods: {
                /*DATE*/
                getDailyData: function (date) {
                    var result = [];
                    var all = this.fb_allPosts
                    for (var k in all) {
                        var originDate = all[k]['.key'];
                        if (originDate === date) {
                            result = pushArrayFromTo(all[k], result);//push all attributes except .key
                        }
                    }
                    return result;

                },
                getRangeData: function (date, range) {
                    var result = [];
                    var all = this.fb_allPosts;
                    for (var k in all) {
                        var originDate = all[k]['.key'];
                        if (range === 'month' && originDate.substr(4, 2) === date.substr(4, 2)) {
                            // Push all categories into an array first. Then filter the duplicate items.
                            result = pushArrayFromTo(all[k], result);
                        }
                        else if (range === 'week' && originDate.substr(4, 3) === date.substr(4, 3)) {

                            result = pushArrayFromTo(all[k], result);

                        }
                    }
                    var finalResult = [];
                    var output = [];

                    for (var i = 0; i < result.length; i++) {
                        var hasCategory = false;
                        for (var c = 0; c < finalResult.length; c++) {
                            if (finalResult[c]['name'] === result[i]['name']) {
                                hasCategory = true;
                                break;
                            }
                        }
                        if (!hasCategory) {
                            finalResult.push(result[i])
                        }
                    }

                    for (var c = 0; c < finalResult.length; c++) {
                        var tempArr = [];
                        for (var i = 0; i < result.length; i++) {
                            if (finalResult[c]['name'] === result[i]['name']) {
                                for (var tag in result[i]['tag']) {
                                    tempArr.push(result[i]['tag'][tag])
                                }
                            }

                        }
                        //console.log(tempArr)
                        output.push({
                            name : finalResult[c]['name'],
                            count: 0,
                            ratio: 0,
                            tag  : uniqTagArray(tempArr)
                        })
                    }

                    //console.log(output)
                    output = updateTagCountStatic(output)
                    return output;

                },
                getDailyOriginData: function (date) {
                    var result = [];
                    var all = this.fb_allPosts
                    for (var k in all) {
                        var originDate = all[k]['.key'];
                        if (originDate == date) {

                            result = all[k];

                        }

                    }
                    return result;

                },
                checkDate: function () {
                    if (this.date.date >= 31) {
                        this.date.date -= 30;
                        this.date.month += 1;
                    }
                    if (this.date.month === 13) {
                        this.date.month = 1;
                        this.date.year += 1;
                    }
                    if (this.date.date <= 0) {
                        this.date.date =30+this.date.date;
                        this.date.month -= 1;
                    }
                    if (this.date.month === 0) {
                        this.date.month = 12;
                        this.date.year -= 1;
                    }
                    if (this.date.year > 2017) {
                        this.date.year = 2017
                    }
                },
                increaseDate: function () {
                    this.date.date += 1;
                    this.checkDate();
                    this.updateDateStr();
                },
                decreaseDate: function () {
                    this.date.date -= 1;
                    this.checkDate();
                    this.updateDateStr();
                },
                increaseMonth: function () {
                    this.date.month += 1;
                    this.checkDate();

                    this.updateDateStr();
                },
                decreaseMonth: function () {
                    this.date.month -= 1;
                    this.checkDate();
                    this.updateDateStr();
                },
                increaseWeek: function () {
                    this.date.date += 7;
                    this.checkDate();
                    this.updateDateStr();
                },
                decreaseWeek: function () {
                    this.date.date -= 7;
                    this.checkDate();
                    this.updateDateStr();
                },
                updateDateStr: function () {
                    var dd = this.date.date;
                    var mm = this.date.month;
                    var yyyy = this.date.year;
                    var monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    this.date.month_str = monthArr[mm - 1];

                    this.date.week = parseInt(dd / 7) + 1;
                    if (dd < 10) {
                        dd = '0' + dd
                    }
                    if (mm < 10) {
                        mm = '0' + mm
                    }

                    this.date.str = yyyy + '' + mm + '' + dd
                    //console.log(this.date);
                },

                /*DISPLAY*/
                sortTags: function (data, key) {
                    var json = [];
                    for (var k in data) {
                        // console.log(k);
                        // console.log(data[k]);
                        // console.log(data[k][key]);
                        json.push(data[k]);
                    }

                    //console.log(json);
                    for (var j = 1, jl = json.length; j < jl; j++) {
                        var temp = json[j],
                            val = temp[key],
                            i = j - 1;
                        //console.log(val);
                        while (i >= 0 && json[i][key] < val) {
                            json[i + 1] = json[i];
                            i = i - 1;
                        }
                        json[i + 1] = temp;

                    }
                    //console.log(json);
                    return json;
                },

                /*POST*/
                getTagNamesByCategory: function (category) {
                    var result = [],
                        json = [];
                    var data = this.fb_aaa;
                    //console.log(data);

                    for (var k in data) {

                        json.push(data[k]);
                    }
                    for (var i = 0; i < json.length; i++) {
                        //console.log(json[i]);
                        //console.log(category.toLowerCase());
                        if (json[i]['category'].toLowerCase() === category.toLowerCase()) {
                            result.push(json[i]);
                        }
                    }

                    return result;

                },
                addTag: function () {

                    if (this.postTag != '') {
                        var date = new Date();
                        date.setDate(date.getDate() - this.postTimeValue);

                        var temp = {
                            tag     : this.postTag,
                            category: this.postCategory,
                            date    : date
                        };
                        this.addedTags.push(temp);

                    }
                },
                postTags: function (data) {
                    var categoriesNotIncluded = [];
                    for (var j in this.addedTags) {
                        var hasCategory = false;

                        var addedTag = this.addedTags[j];
                        console.log(addedTag.category);
                        console.log(addedTag['category']);
                        for (var k in data) {

                            console.log(data[k]['name']);

                            if (addedTag['category'] === data[k]['name']) {
                                hasCategory = true;
                                console.log(data[k]['.key'])
                                var originTags = data[k]['tag'];
                                var hasTagInOriginTags = false;
                                for (var key in originTags) {

                                    var originTag = originTags[key];
                                    if (originTag['tag'].toLowerCase() === addedTag['tag'].toLowerCase()) {
                                        hasTagInOriginTags = true;

                                        var d = db.ref('post/' + this.date.str + '/' + data[k]['name'] + '/tag/' + key);
                                        var updates = {};
                                        updates['/count'] = originTag['count'] + 1;
                                        d.update(updates);
                                    }
                                }

                                if (!hasTagInOriginTags) {
                                    var d = db.ref('post/' + this.date.str + '/' + data[k]['name'] + '/tag');
                                    d.push({
                                        add  : 'false',
                                        count: 1,
                                        tag  : addedTag['tag']
                                    })
                                }
                            }
                            //console.log(postTagToRef.child());
                        }
                        if (!hasCategory) {
                            if (!categoriesNotIncluded.includes(addedTag['category'])) {
                                categoriesNotIncluded.push(addedTag['category']);
                            }

                        }

                        // console.log(data[k][key]);


                    }

                    console.log(categoriesNotIncluded)
                    for (var c = 0; c < categoriesNotIncluded.length; c++) {


                        var d = db.ref('post/' + this.date.str + '/' + categoriesNotIncluded[c]);

                        console.log('new category!')

                        var newTagArr = [];
                        for (var m in this.addedTags) {
                            var temp = this.addedTags[m]
                            console.log(categoriesNotIncluded[c])
                            console.log(temp['category'])
                            if (temp['category'] === categoriesNotIncluded[c]) {
                                newTagArr.push({
                                    add  : 'false',
                                    count: 1,
                                    tag  : temp['tag']
                                })
                            }
                        }
                        d.set({
                            count: 1,
                            ratio: 1,
                            name : categoriesNotIncluded[c],
                            tag  : newTagArr
                        });
                    }
                    this.updateTagCount(this.getDailyData(this.date.str));

                },
                updateTagCount: function (data) {
                    var allCount = 0;
                    for (var k in data) {

                        var countSum = 0;
                        //var countInCategory = data[k]['count'];
                        var tagsInCategory = data[k]['tag'];
                        //console.log(countInCategory);
                        for (var key in tagsInCategory) {
                            var tag = tagsInCategory[key];
                            countSum += tag['count'];
                        }

                        var d = db.ref('post/' + this.date.str + '/' + data[k]['name']);
                        var updates = {};
                        updates['/count'] = countSum;
                        d.update(updates);
                        console.log(countSum);

                        data[k]['count'] = countSum;

                        allCount += countSum;
                    }
                    for (var k in data) {

                        var countInCategory = data[k]['count'];
                        var ratio = parseInt(parseFloat(countInCategory / allCount) * 100);
                        var d = db.ref('post/' + this.date.str + '/' + data[k]['name']);
                        var updates = {};
                        updates['/ratio'] = ratio;

                        d.update(updates);
                        console.log(countInCategory);
                        console.log(allCount);

                        data[k]['ratio'] = ratio


                    }
                },
                finishPostTags: function () {
                    this.addedTags = [];
                    this.postTag = '';
                    this.postCategory = '';
                },
            },

            watch: {

                postCategory: function (newCategory) {
                    console.log(this.fb_aaa);
                    if (newCategory) {
                        this.tagInCategory = this.getTagNamesByCategory(newCategory)
                    }

                }

            },

            computed: {


                postTimeValue: function () {
                    if (this.postTime == 'custom') {
                        return 30;
                    }
                    else {
                        return this.postTime;
                    }
                }
                ,
                customTime   : function () {
                    return {

                        'disabled': this.postTime != 'custom'
                    }
                }
                ,
                hasCategory  : function () {
                    return {

                        'disabled': this.postCategory == ''
                    }
                }
            },

            data    : function () {
                return states;
            }

        }
    );

})();


function randomNums(n) {

    var arr = [];
    for (var i = 0; i < 14; i++) {
        var res = 0;
        if (i === 1) {
            res = arr[1];
        }
        if (i === 13) {
            res = arr[12]
        }
        if (i === 11) {
            res = n
        }
        else {
            res = n * (Math.random() * 0.8)
        }
        arr.push(res);
    }


    return arr;

}

function updateTagCountStatic(data) {
    var allCount = 0;
    for (var k in data) {
        var countSum = 0;
        var tagsInCategory = data[k]['tag'];
        for (var key in tagsInCategory) {
            var tag = tagsInCategory[key];
            countSum += tag['count'];
        }
        data[k]['count'] = countSum;
        allCount += countSum;
    }
    for (var k in data) {
        var countInCategory = data[k]['count'];
        var ratio = parseInt(parseFloat(countInCategory / allCount) * 100);
        data[k]['ratio'] = ratio;
    }
    return data;
}

function uniqTagArray(arrA) {
    var arrN = [];
    var result = [];
    for (var i = 0; i < arrA.length; i++) {
        if (arrN.indexOf(arrA[i].tag) === -1) {
            arrN.push(arrA[i].tag)
            result.push({
                add  : arrA[i].add,
                tag  : arrA[i].tag,
                count: arrA[i].count
            })
        }
        else {
            for (var j = 0; j < result.length; j++) {
                if (result[j].tag === arrA[i].tag) {
                    result[j].count += arrA[i].count
                }
            }
        }
    }

    //console.log(result)
    return result;

}

function pushArrayFromTo(from, to) {
    for (var j in from) {
        if (j !== '.key') {
            to.push(from[j])
        }
    }
    return to;
}