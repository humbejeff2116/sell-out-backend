


const elasticSearch = require('elasticsearch');




/**
 * 
 * @param {object} elastciSearch - elastic search object constructor which you require e.g const elasticSearch = require('elasticsearch')
 * @param {object} body - the data which is to be saved in the elastic search data base
 * @param {string} index - the index under where the data should be saved in
 * @param {string} type - a string which specifies the type of data being save to its data base
 */

function saveProductOrServiceToElasticSearch( body, index, type) {
    const elasticSearchClient = new elasticSearch.Client({
        host: ['http://localhost:9200']
    });
    elasticSearchClient.ping({ requestTimeout: 30000}, function(err) {
        if (err) return console.error('elastic search is down');
        return console.log('elastic search is up');

    })

    elasticSearchClient.indices.create({index: index}, function(err, res, status) {
        if(err) return console.log(err);
        return console.log('index created successfully', res);

    });


    elasticSearchClient.index({
        index: index,
        type: type,
        body: body,

    }, function(err, res, status){
        if(err)  return console.error(err);
        return console.log(res);
    })
}

module.exports = saveProductOrServiceToElasticSearch;