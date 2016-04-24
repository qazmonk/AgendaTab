var find_todo = function (headline) {
  var todos = [];
  if (headline.is_TODO) {
    todos.push({ text: headline.title, date: headline.deadline, tags: headline.tags,
                 subtext: headline.text, $elem: [] });
  }
  for (var i = 0; i < headline.subtrees.length; i++) {
    var child_todos = find_todo(headline.subtrees[i]);
    for (var j = 0; j < child_todos.length; j++) {
      todos.push(child_todos[j]);
    }
  }
  return todos;
};
var find_todos = function (headlines) {
  var todos = [];
  for (var i = 0; i < headlines.length; i++) {
    var tmp_todos = find_todo(headlines[i]);
    for (var j = 0; j < tmp_todos.length; j++) {
      todos.push(tmp_todos[j]);
    }
  }
  return todos;
};
var filter_todos = function () {
  var search_tags = $('#filter-input').val().split(/:|,/);
  for (var i = 0; i < window.todos.length; i++) {
    for (var j = 0; j < search_tags.length; j++) {
      todos[i].$elem[2].removeClass('exclude include');
      if (todos[i].tags.includes(search_tags[j])) {
        todos[i].$elem[2].addClass('include');
        break;
      } else {
        todos[i].$elem[2].addClass('exclude');
      }
    }
  }
};

var make_expand_todo_fn = function (todo_idx, list_idx) {
  var expand = function () {
    var lines = todos[todo_idx].subtext;
    todos[todo_idx].$elem[list_idx].remove('.subtext');
    todos[todo_idx].$elem[list_idx].removeClass('expanded');
    todos[todo_idx].$elem[list_idx].addClass('expanded');    
    for (var i = 0; i < lines.length; i++) {
      var $text_div = $('<div class="subtext todo-elem">' + lines[i] + '</div>');
      todos[todo_idx].$elem[list_idx].append($text_div);
    }
  };
  return expand;
};
var make_contract_todo_fn = function (todo_idx, list_idx) {
  var contract = function () {
    todos[todo_idx].$elem[list_idx].find('.subtext').remove();
    todos[todo_idx].$elem[list_idx].removeClass('expanded');
  };
  return contract;
};

var make_toggle_todo_fn = function (todo_idx, list_idx) {
  var toggle = function () {
    var expand_fn = make_expand_todo_fn(todo_idx, list_idx);
    var contract_fn = make_contract_todo_fn(todo_idx, list_idx);    
    if (todos[todo_idx].$elem[list_idx].hasClass('expanded')) {
      contract_fn();
    } else {
      expand_fn();
    }
  };
  return toggle;
};

var make_saveable = function (todos) {
  var saveable_todos = [];
  for (var i = 0; i < todos.length; i++) {
    saveable_todos[i] = { subtext: todos[i].subtext,
                          tags: todos[i].tags,
                          text: todos[i].text,
                          $elem: todos[i].$elem
                        };
    var date = todos[i].date;    
    if (date !== undefined) {
      saveable_todos[i].date = date.toString();
    }
  }
  return saveable_todos;
};

var unsaveable_todos = function (saveable_todos) {
  var todos = [];
  for (var i = 0; i < saveable_todos.length; i++) {
    todos[i] = { subtext: saveable_todos[i].subtext,
                 tags: saveable_todos[i].tags,
                 text: saveable_todos[i].text,
                 $elem: saveable_todos[i].$elem
               };
    var date = saveable_todos[i].date;    
    if (date !== undefined) {
      todos[i].date = new Date(date);
    }    
  }
  return todos;  
};
