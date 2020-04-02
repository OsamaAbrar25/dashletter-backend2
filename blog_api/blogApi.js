var axios = require('axios');
var fs = require('fs')


//list of queries
query = ['fashion blog', 'food blog', 'travel blog', 'music blog', 'lifestyle blog', 'fitness blog', 'DIY blog', 'sports blog', 'finance blog',
 'political blog', 'parenting blog', 'business blog', 'personal blog', 'movie blog', 'car blog', 'news blog', 'pet blog', 'gaming blog']

async function processGet() {
    for (const element of query) {
        //removing blog from query
        search = element.replace(' blog', '');
        var url = 'http://newsapi.org/v2/everything?'+
            `q=${element}&` +
            'sortBy=relevance&'+
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
            data = fs.readFileSync('./asset/blog.json');
            // parsing data from string to json
            data = JSON.parse(data);
            //selecting query(like fashion)
            category = data[search];
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
            fs.writeFileSync('./asset/blog.json', JSON.stringify(data));  
        })
        .catch(function (error) {
        // handle error
            console.log(error);
        });       
    }
    console.log('done');
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