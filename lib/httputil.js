var codes = [200, 400, 500, 401, 400, 420, 400, 404], // "420 - Enhance your calm" is just like icing on the cake
  text = ['Everything ok', 'Missing parameters', 'Internal error', 'Access denied', 'Bad/Missing token', 'Fl00d your mother', 'Bad parameters', 'Resource not found'];
  
exports.send = function(json, req, res) { // Sort of middleware between route and real response
  console.dir(json.error);
  
  if (!json.error || typeof json.error !== "number")
    return res.json(json);
  
  console.log(json.error);
  res.writeHead(codes[json.error], {'Content-Type': 'text/plain'});
  res.end(text[json.error]);
}