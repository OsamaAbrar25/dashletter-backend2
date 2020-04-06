var axios = require('axios');
var fs = require('fs')

 //list of files_blog
 files_blog = ['../asset/category/fashion.json', '../asset/category/food.json', '../asset/category/travel.json', '../asset/category/music.json', '../asset/category/lifestyle.json', '../asset/category/fitness.json', '../asset/category/DIY.json', '../asset/category/sports.json', '../asset/category/finance.json', '../asset/category/political.json', '../asset/category/parenting.json', '../asset/category/business.json', '../asset/category/personal.json', '../asset/category/movie.json', '../asset/category/car.json', '../asset/category/news.json', 
 '../asset/category/pet.json', '../asset/category/gaming.json', '../asset/category/corona.json', '../asset/category/random.json']

var j = 0

//list of queries
query = ['fashion clothing blog', 'food blog', 'travel blog', 'music blog', 'lifestyle blog', 'fitness blog', 'DIY blog', 'sports blog', 'finance blog',
 'political blog', 'parenting blog', 'business blog', 'personal blog', 'movie blog', 'car blog', 'news blog', 'pet dog cat blog', 'gaming blog', 'coronavirus blog', 'blog']

async function processGet() {
    for (i in query) {
        
        var url = getURL(query[i]);
        
        //get request newsapi
        await axios.get(url)
        .then(function (response) {
            //extracting arctices from response
            var contents = response.data.articles;
            //reading processed.json
            data = fs.readFileSync(files_blog[j]);
            
            if (data.length != 0) {
                // parsing data from string to json
                category = JSON.parse(data);
                category = contents.concat(category);
                category = removeDuplicatesBlog(category, 'title');
                
                fs.writeFileSync(files_blog[j], JSON.stringify(category)); 
            } else {
                fs.writeFileSync(files_blog[j], JSON.stringify(contents));
            }
                
            })
            .catch(function (error) {
            // handle error
                console.log(error);
            });   
            j++;    
    }

    console.log('done');
    j = 0;
}


function getURL(query) {

    url_blog = 'http://newsapi.org/v2/everything?'+
    `q=${query}&` +
    'sortBy=popularity&'+
    'language=en&'+
    'totalResults=100&'+
    'pageSize=100&'+
    'apiKey=450cb76834d643e2ba8896df71043fb6';
    return url_blog;
}
   
//remove duplicate from array

function removeDuplicatesBlog( arr, prop ) {
    var obj = {};
    for ( var i = 0, len = arr.length; i < len; i++ ){
      if(!obj[arr[i][prop]]) obj[arr[i][prop]] = arr[i];
    }
    var newArr = [];
    for ( var key in obj ) newArr.push(obj[key]);
    return newArr;
}

setInterval(processGet, 2*60*60*1000);





