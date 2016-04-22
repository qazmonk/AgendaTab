
var Parser = function (data) {
  this.data = data;
  this.line_num = 0;
};

Parser.prototype.parse_headline = function () {
  var line_num = this.line_num;
  var level = this.data[line_num][0].level;
  var cur_token = 1;
  var isTODO = false;
  if (this.data[line_num][cur_token].type == 'TODO') {
    cur_token++;
    isTODO = true;
  }
  var title = this.data[line_num][cur_token].text;
  var tags = [];
  var i = 0;
  for (; cur_token < this.data[line_num].length; cur_token++) {
    tags[i] = this.data[line_num][cur_token].tag;
    i++;
  }
  this.line_num++;
  var children = this.parse_chidren(level);
  return { level: level, is_TODO: isTODO, title: title,
           deadline: children.deadline, tags: tags, subtrees: children.subtrees,
           text: children.text };
};
Parser.prototype.parse_chidren = function (level) {
  var children = { deadline: undefined, text: [], subtrees: []};
  var line_num = this.line_num;
  while (line_num < this.data.length) {
    if (this.data[line_num][0].type === 'HEADLINE') {
      if (this.data[line_num][0].level <= level) {
        this.line_num = line_num;
        return children;
      }
      this.line_num = line_num;
      var sub_child = this.parse_headline();
      line_num = this.line_num;
      children.subtrees.push(sub_child);
    } else {
      if (this.data[line_num][0].type === 'DEADLINE') {
        var date_re = /\d\d\d\d-\d\d-\d\d/;
        var date_found = this.data[line_num][0].date.match(date_re);
        children.deadline = Date.parse(date_found[0]);
        children.text.push(this.data[line_num][1].text);
        line_num++;
      } else {
        children.text.push(this.data[line_num][0].text);
        line_num++;
      }
    }
  }
  return children;
};
Parser.prototype.parse = function () {
  this.line_num = 0;
  var headlines = [];
  for (var line_num = 0; line_num < this.data.length;) {
    if (this.data[line_num][0].type === 'HEADLINE') {
      this.line_num = line_num;
      headlines.push(this.parse_headline());
      line_num = this.line_num ;
    } else {
      line_num++;
    }
  }
  return headlines;
};


window.Parser = Parser;
