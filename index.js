/*
 * Primary file for the API
 *
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder

//The server should respond to all requests with a string
var server = http.createServer(function(req,res) {

  // Get the URL and parse it
  var parsedUrl = url.parse(req.url,true)

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'')

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP Method
  var method = req.method.toLowerCase();

  // Get the headers as an object
  var headers = req.headers


  // Get the payload, if any
  // as data streaming in the req object emits data event binding to and sends decoded utf-8 appending result onto buffer need to bind to the stream and grab little pieces of stream streams are built into node
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data',function(data){
    buffer +=  decoder.write(data)
  });

  // will always run, just means buffer will be ''
  req.on('end',function(){
    buffer += decoder.end();


    // Choose the handler this request should go to. If one is not found user the not found handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object ot send to the handlers
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data,function(statusCode,payload){
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type','application/json')
      res.writeHead(statusCode)
      res.end(payloadString);

      // Log the request path
      console.log('Returning this response: ',statusCode,payloadString);

    });

  });
});

 // Start the server, and have it listen on port 3000
 server.listen(3000,function(){
   console.log("The server is listening on port 3000 now");
 })

// Definer the handlers
var handlers = {};

// Samples handler
handlers.sample = function(data,callback){
  // Callback a http status code, and a payload object
  callback(406,{'name' : 'sample handler'});
};

// Not found handler
handlers.notFound = function(data,callback){
  callback(404);
};

// Define a request router
var router = {
  'sample' : handlers.sample
};
