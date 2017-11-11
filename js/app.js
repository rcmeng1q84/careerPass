window.onload = function () {


// Init F7 Vue Plugin
    Vue.use(Framework7Vue)

// Init Page Components
    Vue.component('page-about', {
        template: '#page-about'
    })
    Vue.component('page-form', {
        template: '#page-form'
    })
    Vue.component('page-dynamic-routing', {
        template: '#page-dynamic-routing'
    })
    var config = {
        apiKey           : "AIzaSyC8KN1NWozMPXGhSdnpG5xXK5J8omgL7dM",
        authDomain       : "careerpass-3356a.firebaseapp.com",
        databaseURL      : "https://careerpass-3356a.firebaseio.com",
        projectId        : "careerpass-3356a",
        storageBucket    : "careerpass-3356a.appspot.com",
        messagingSenderId: "847951009387"
    };


    var db = firebase.initializeApp(config).database()
    var postsRef = db.ref('post/20171001')
    var postsRef2 = db.ref('post/20171030')
    var postTagToRef = db.ref('post/20171001')
    var postTagToRef2 = db.ref('post/20171001/interview/tag')
    var aaaRef = db.ref('TagDetail')


// Init App
    var vm = new Vue({
        el        : '#app',
        // Init Framework7 by passing parameters here
        framework7: {
            root  : '#app',
            /* Uncomment to enable Material theme: */
            // material: true,
            routes: [
                {
                    path     : '/about/',
                    component: 'page-about'
                },
                {
                    path     : '/form/',
                    component: 'page-form'
                },
                {
                    path     : '/dynamic-route/blog/:blogId/post/:postId/',
                    component: 'page-dynamic-routing'
                }
            ],

        },
        methods   : {
            addTodo              : function () {
                if (this.newTodoText) {
                    todosRef.push({
                        text: this.newTodoText
                    })
                    this.newTodoText = ''
                }
            },
            getTagNamesByCategory: function (data, category) {
                var result = [],
                    json = [];
                console.log(data);

                for (var k in data) {

                    json.push(data[k]);
                }
                for (var i = 0; i < json.length; i++) {
                    console.log(json[i]);
                    console.log(category.toLowerCase());
                    if (json[i]['category'].toLowerCase() == category.toLowerCase()) {
                        result.push(json[i]);
                    }
                }

                this.tagInCategory = result;

            },
            getName              : function (todo) {
                var result = postsRef.child(todo['.key'])
                return result
            },
            postTags             : function () {

                var data = this.postTagTo;
                for (var k in data) {
                    // console.log(k);
                    console.log(data[k]['.key']);
                    for (var j in this.addedTags) {
                        var tag = this.addedTags[j]
                        if (tag.category == data[k]['.key']) {

                            var d = db.ref('post/20171001/' + data[k]['.key'] + '/tag')
                            for (var t in this.addedTags) {
                                d.push(this.addedTags[t]);
                            }

                            //console.log(postTagToRef.child());
                        }
                    }
                    // console.log(data[k][key]);

                }


            },
            finishPostTags: function () {
                this.addedTags = [];
                this.postTag = '';
                this.postCategory = '';
            },
            addTag               : function () {

                if (this.postTag != '') {
                    var temp = {
                        tag     : this.postTag,
                        category: this.postCategory,
                        count   : 1
                    };
                    this.addedTags.push(temp);

                }
            },
            sortTags             :
                function (data, key) {
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
                }
        },
        firebase  : {
            posts    : postsRef.limitToLast(25),
            posts2   : postsRef2,
            aaa      : aaaRef,
            postTagTo: postTagToRef

        },
        watch     : {
            postCategory: function (newCategory) {
                console.log(this.c);
                if(newCategory){
                    this.getTagNamesByCategory(this.aaa, newCategory)
                }

            }
        },
        computed  : {
            customTime : function () {
                return {

                    'disabled': this.postTime != 'custom'
                }
            },
            hasCategory: function () {
                return {

                    'disabled': this.postCategory == ''
                }
            }
        },
        data      : {


            postCategory : '',
            postTag      : '',
            postTime     : '',
            post         : {
                category: ''
            },
            tagInCategory: [],

            user: {
                name : 'MAS-8803',
                email: 'rjk09@gatech.edu'
            },

            addedTags: [],
            date     : {
                year   : '2017',
                month  : 'Nov',
                month_2: 'Nov',
                day    : '1',
                day_2  : '7'
            }
        }
    });
}

