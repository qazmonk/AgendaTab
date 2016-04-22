var client = new Dropbox.Client({
  key: "b0ru6qxlvkbh3he"
});


var find_todo = function (headline) {
  var todos = [];
  if (headline.is_TODO) {
    todos.push({ text: headline.title, date: headline.deadline });
  }
  for (var i = 0; i < headline.subtrees.length; i++) {
    var child_todos = find_todo(headline.subtrees[i]);
    for (var j = 0; j < child_todos.length; j++) {
      todos.push(child_todos[j]);
    }
  }
  return todos;
}
var find_todos = function (headlines) {
  var todos = [];
  for (var i = 0; i < headlines.length; i++) {
    var tmp_todos = find_todo(headlines[i]);
    for (var j = 0; j < tmp_todos.length; j++) {
      todos.push(tmp_todos[j]);
    }
  }
  return todos;
}
client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
  receiverPath: "chrome_oauth_receiver.html"}));


client.authenticate(function(error, client) {
  if (error) {
    console.log("ERROR");
    return 0;
  }

  console.log("Authenticated!");

  client.readFile("org/test.org", function (error, data) {
    if (error) {
      console.log("ERROR");
      return 0;
    }
    console.log('starting lexer...');
    console.log(data);
    var lexer = new window.Lexer(data);
    var tokens = lexer.lex();
    var parser = new window.Parser(tokens);
    var headlines = parser.parse();
    var todos = find_todos(headlines);
    var $full = $('#full-list');
    var $week = $('#week-list');
    var $filter = $('#filter-list');
    var next_week = new Date(Date.now());
    next_week.setDate(next_week.getDate() + 7);
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].date !== undefined) {
        var $li = $('<li><div class="todo-elem">' + todos[i].text + '</div></li>');
        $full.append($li);
        console.log(todos[i].date);
        if (todos[i].date < next_week) {
          $week.append($li.clone());        
        }
        $filter.append($li.clone());
      }
    }
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].date === undefined) {
        var $li = $('<li><div class="todo-elem">' + todos[i].text + '</div></li>');
        $full.append($li);
        $filter.append($li.clone());
      }
    }    
    console.log(headlines);
    console.log(find_todos(headlines));
    $('#file-block').html(data);
    return 1;
  });

  
  return 1;
});
