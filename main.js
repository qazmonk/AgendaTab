var day_to_string = function(day) {
  switch (day) {
  case 0:
    return 'Sunday';
  case 1:
    return 'Monday';
  case 2:
    return 'Tuesday';
  case 3:
    return 'Wednesday';
  case 4:
    return 'Thursday';
  case 5:
    return 'Friday';
  case 6:
    return 'Saturday';
  default:
    throw new Error('Invalid day of the week');
  }
};


var date_cmp = function (d1, d2) {
  if (d1 === undefined && d2 === undefined) {
    return 0;
  }
  if (d1 === undefined) {
    return 1;
  }
  if (d2 === undefined) {
    return -1;
  }
  if (d1 < d2) {
    return -1;
  } else if (d2 < d1) {
    return 1;
  }
  return 0;
};

var remove_file = function() {
  var $this = $(this);
  var file_name = $this.parent().find('.file-name').text();
  $this.parent().remove();
  var files = window.files;
  for (var i = 0; i < files.length; i++) {
    if (files[i] === file_name) {
      files.splice(i, 1);
    }
  }
  window.files = files;
  save_file_names(function () {
    console.log('saved files!');
    load_files(function () {
      render_page();
    });
  });
};

var add_file_elem = function (file_name) {
  var $list = $('#file-list');
  var $delete = $('<span><div class="close-button">&#10006</div></span>');
  var $file = $('<span></span>', { 'class': 'file-name', text: file_name });
  $delete.click(remove_file);
  var $li = $('<li>');
  $li.append($delete);
  $li.append($file);
  $list.append($li);
};
var enter_file = function(e) {
  if(e.keyCode == 13)
  {
    var $list = $('#file-list');
    var $input = $('#file-input');
    add_file_elem($input.val());
    window.files.push($input.val());
    save_file_names(function () {
      console.log('files saved!');
      load_files(function () {
        render_page();
      });
    });
    
  }
};

var save_file_names = function (callback) {
  chrome.storage.local.set({'files': window.files}, callback);
};

var save_version_tags = function (callback) {
  chrome.storage.local.set({'versionTags': window.versionTags}, callback);
};

var save_todos = function (callback) {
  save_todos = make_saveable(window.todos);
  chrome.storage.local.set({'todos': save_todos}, callback);
};

var get_file_names = function (callback) {
  chrome.storage.local.get({'files': [], 'versionTags': []}, function (result) {
    window.files = result.files;
    window.versionTags = result.versionTags;
    callback(result.files, result.versionTags);
  });
};

var get_todos = function (callback) {
  chrome.storage.local.get({'todos': []}, function (result) {
    window.todos = unsaveable_todos(result.todos);
    console.log(result.todos);
    callback(result.todos);
  });
};

var render_file_list = function () {
  var files = window.files;
  for (var i = 0; i < files.length; i++) {
    add_file_elem(files[i]);
  }
  $('#file-input').keyup(enter_file);
};

var setup_todos = function (data) {
  var lexer = new window.Lexer(data);
  var tokens = lexer.lex();
  var parser = new window.Parser(tokens);
  var headlines = parser.parse();
  var todos = find_todos(headlines);
  todos.sort(function (t1, t2) { return date_cmp(t1.date, t2.date); });
  window.todos = todos;
  save_todos(function () { console.log('saved todo list'); });
};

var render_page = function() {
  todos = window.todos;
  var $full = $('#full-list');
  $full.empty();
  var $week = $('#week-list');
  $week.empty();  
  var $filter = $('#filter-list');
  $filter.empty();
  var next_week = new Date(Date.now());
  next_week.setDate(next_week.getDate() + 7);
  next_week.setHours(0, 0, 0, 0);
  var today = new Date(Date.now());
  today.setHours(0, 0, 0, 0);
  var cur_day = new Date(Date.now());
  cur_day.setHours(0, 0, 0, 0);
  if (date_cmp(todos[0].date, cur_day) < 0) {
    $week.append('<li><div class="weekday-elem">Past Due</div></li>');
  }
  for (var i = 0; i < todos.length; i++) {
    var $li = $('<li><div class="todo-elem">' + todos[i].text + '</div></li>');
    $full.append($li);
    todos[i].$elem[0] = $li;
    $li.click(make_toggle_todo_fn(i, 0));
    if (date_cmp(todos[i].date, next_week) < 0) {
      if (date_cmp(todos[i].date, cur_day) >= 0) {
        if (date_cmp(cur_day, today) === 0) {
          $week.append('<li><div class="weekday-elem">Today</div></li>');
        } else {
          $week.append('<li><div class="weekday-elem">' + day_to_string(cur_day.getDay())
                       + '</li></div>');
        }
        cur_day.setDate(cur_day.getDate() + 1);
      }
      var $week_li = $li.clone();
      todos[i].$elem[1] = $week_li;
      $week_li.click(make_toggle_todo_fn(i, 1));
      $week.append($week_li);        
    }
    var $filter_li = $li.clone();
    todos[i].$elem[2] = $filter_li;
    $filter_li.click(make_toggle_todo_fn(i, 2));
    $filter.append($filter_li);
    
  }
  $('#filter-input').keyup(filter_todos);
};
var files_changed = function (callback) {
  var versionTags = window.versionTags;
  var file_changed = function(file_idx, callback) {
    if (file_idx < files.length) {
      console.log('checking for file change ' + file_idx);
      client.stat(files[file_idx], function (error, stat, entries) {
        if (error) {
          console.log(files[file_idx] + ' not found!');
          file_changed(file_idx + 1, callback);
        } else {
          if (versionTags[file_idx] != stat.versionTag) {
            callback(true);
          } else {
            versionTags.push(stat.versionTag);
            file_changed(file_idx + 1, callback);
          }
        }
      });
    } else {
      callback(false);
    }
  };
  file_changed(0, callback);
};
var load_files = function(callback) {
  var total_data = "";
  var versionTags = [];
  var load_file = function(file_idx, callback) {
    if (file_idx < files.length) {
      console.log('loading file ' + file_idx);
      client.readFile(files[file_idx], function (error, data, meta) {
        if (error) {
          console.log(files[file_idx] + ' not found!');
          load_file(file_idx + 1, callback);
          return 0;
        }
        versionTags.push(meta.versionTag);
        total_data += data;
        load_file(file_idx + 1, callback);
        return 1;
      });
    } else {
      callback();
    }
  };
  load_file(0, function () {
    window.versionTags = versionTags;
    save_version_tags(function() {
      setup_todos(total_data);
      callback();
    });
  });
};
//DROPBOX SETUP
var client = new Dropbox.Client({
  key: "b0ru6qxlvkbh3he"
});

client.authDriver(new Dropbox.AuthDriver.ChromeExtension({
  receiverPath: "chrome_oauth_receiver.html"}));

$(document).ready(
  client.authenticate(function(error, client) {
    if (error) {
      console.log("ERROR authenticating");
      return 0;
    }

    console.log("Authenticated!");

    get_file_names(function (files, versionTags) {
      files_changed(function (changed) {
        render_file_list();
        if (changed) {
          load_files(function () {
            render_page();
          });
        } else {
          console.log('files not changed, loading cached copy');
          get_todos(function () {
            render_page();
          });
        }
      });
    });    
    return 1;
  })
);


