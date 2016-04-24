var Lexer = function(data) {
  this.data = data;
};

var skip_whitespace = function (line, start_pos) {
  return line.indexOf(/[^\s]/g);
};

var lex_headline = function(line) {
  var re = /(\*+)\s*(TODO)?\s*(.*?)(:[^:\s]+(?::[^:\s]*)*:)?$/;
  var found = line.match(re);
  if (found === null) {
    throw new Error('Tried to lex non-headline as headline');
  }
  var tokens = [];
  tokens[0] = { type: 'HEADLINE', level: found[1].length };
  var cur_token = 1;
  if (found[2] !== undefined) {
    tokens[cur_token] = { type: 'TODO' };
    cur_token++;
  }
  tokens[cur_token] = { type: 'TEXT', text: found[3] };
  cur_token++;
  if (found[4] !== undefined) {
    var tags = found[4].split(':');
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].length > 0) {
        tokens[cur_token] = { type: 'TAG', tag: tags[i] };
        cur_token++;
      }
    }
  }
  return tokens;
};

var lex_non_headline = function(line) {
  var deadline_re = /DEADLINE:\s*(<[a-zA-Z0-9+\s:-]+>)/;
  var deadline_found = line.match(deadline_re);
  var tokens = [];
  if (deadline_found === null) {
    tokens[0] = { type: 'TEXT', text: line };
  } else {
    /*var rest = line.slice(0, deadline_found.index) +
          line.slice(deadline_found.index + deadline_found[0].length);*/
    tokens[0] = { type: 'DEADLINE', date: deadline_found[1] };
    tokens[1] = { type: 'TEXT', text: line };
  }
  return tokens;
};

var lex_line = function(line) {
  if (line[0] == '*') {
    return lex_headline(line);
  }
  return lex_non_headline(line);
};

Lexer.prototype.lex = function () {
  var lines = this.data.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
  var tokens = [];
  for (var i = 0; i < lines.length; i++) {
    tokens[i] = lex_line(lines[i]);
  }
  return tokens;
};

window.Lexer = Lexer;
