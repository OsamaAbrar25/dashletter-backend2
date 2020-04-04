var axios = require('axios');
var fs = require('fs')

 //list of files_blog
 files_blog = ['../asset/category/fashion.json', '../asset/category/food.json', '../asset/category/travel.json', '../asset/category/music.json', '../asset/category/lifestyle.json', '../asset/category/fitness.json', '../asset/category/DIY.json', '../asset/category/sports.json', '../asset/category/finance.json', '../asset/category/political.json', '../asset/category/parenting.json', '../asset/category/business.json', '../asset/category/personal.json', '../asset/category/movie.json', '../asset/category/car.json', '../asset/category/news.json', 
 '../asset/category/pet.json', '../asset/category/gaming.json', '../asset/category/random.json', '../asset/category/corona.js']

var j = 0

//list of queries
query = ['fashion clothing blog', 'food blog', 'travel blog', 'music blog', 'lifestyle blog', 'fitness blog', 'DIY blog', 'sports blog', 'finance blog',
 'political blog', 'parenting blog', 'business blog', 'personal blog', 'movie blog', 'car blog', 'news blog', 'pet dog cat blog', 'gaming blog', 'blog', 'coronavirus blog']

async function processGet() {
    for (i in query) {
        
        var url = 'http://newsapi.org/v2/everything?'+
            `q=${query[i]}&` +
            'sortBy=popularity&'+
            'language=en&'+
            'totalResults=100&'+
            'pageSize=100&'+
            'apiKey=450cb76834d643e2ba8896df71043fb6';
        
        //get request newsapi
        await axios.get(url)
        .then(function (response) {
            //extracting arctices from response
            var contents = response.data.articles;
            //arranging data according domain name
            contents = categoryOfData(contents);
            //reading processed.json
            data = fs.readFileSync(files_blog[j]);
            
            if (data.length != 0) {
                // parsing data from string to json
                category = JSON.parse(data);
                //adding blog to particular category
                for (var key in contents) {
                    if (category.hasOwnProperty(key)) {
                        for (var keyGet in category) {
                                if (key == keyGet) {
                                    category[key].concat(contents[key]);
                                }    
                        }  
                    } else {
                        category[key] = contents[key];
                    }     
                }
                //writing to file
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


   
//remove duplicate from array
removeDuplicate = (arr) => arr.filter((v,i) => arr.indexOf(v) === i);

//arrange blog according to it's domain name
function categoryOfData(data) {
    var domain_name = []
    var blog={}
    for (i in data) {
        domain_name.push(data[i].source.name.replace('.com', ''));
    }

    domain_name=removeDuplicate(domain_name);

    for (i in domain_name) {
        blog[domain_name[i]] = data.filter((v)=> domain_name[i] === v.source.name.replace('.com', ''));
    }
    return blog;
}

setInterval(processGet, 86400000);





