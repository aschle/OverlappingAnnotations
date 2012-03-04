var Overlap = window.Overlap = Overlap || {};

Overlap.Menu = function (categories) {

  var lastSubMenuId = null;
  var categories    = categories;
  var menu          = null;
  this.visible      = false;

  /* Loads the category menu. (top #menu) */
  for (id in categories) {
    var contentString = "<h5>" + categories[id].name + "</h5>\n<ul>\n";
    for (subId in categories[id].subs) {
      contentString += "<li>" + categories[id]["subs"][subId] + "</li>\n";
    }
    contentString += "</ul>";
    $("#c_" + id).html(contentString);
  }

  /* Loads the context menu */
  $("body").append("<div id='contextMenu' class='popup'></div>");
  menu = $("#contextMenu");
  menu.css("display", "none");

  var categoryId;
  for (categoryId in categories) {

    var categorieName = categories[categoryId].name;
    menu.append("<div id='entry_" + categoryId + "'><h5>" + categorieName + "</h5></div>");
    $("#entry_" + categoryId).addClass("hover_" + categoryId);

    $("body").append("<div id='subContextMenu_" + categoryId + "' class='popup'></div>");
    var subMenu = $("#subContextMenu_" + categoryId);

    var subId;
    for (subId in categories[categoryId].subs) {

      var subCategorieName = categories[categoryId]["subs"][subId];
      subMenu.append("<div id='subEntry_" + categoryId + "_" + subId + "' style='cursor:pointer;'><h5>" + subCategorieName + "</h5></div>");
      subMenu.css("display", "none");
      $("#subEntry_" + categoryId + "_" + subId).addClass("hover_" + categoryId);
    }
    $("#subEntry_" + categoryId + "_" + subId).addClass("last");
  }
  $("#entry_" + categoryId).addClass("last");


  /* Add iteraction to the menu*/

  // mouseover -> display subMenus
  menu.children().each(function (index) {
    $(this).mouseover(function () {

      $("#subContextMenu_" + lastSubMenuId).css("display", "none");
      $("#subContextMenu_" + index).css("display", "");
      lastSubMenuId = index;
    });
  });

  // when mouse leaves the submenu, hide it
  $("div[id^='subContextMenu_']").mouseleave(function () {
    $(this).css("display", "none");
  });

  // *** to make the submenu close when the mouse leaves the menu
  menu.mousemove(function(){
    return false;
  });

  $("div[id^='subContextMenu_']").mousemove(function(){
    return false;
  });
  // ***

  // click on submenu entry
  $("div[id^='subContextMenu_']").children().each(function () {

    $(this).click(function () {

      $(this).parent().css("display", "none");
      menu.css("display", "none");

      var idArray = $(this).attr("id").split("_");

      Overlap.Atoms.addAtom(
          idArray[1],
          idArray[2],
          Overlap.savedClick["start"],
          Overlap.savedClick["end"]
        );

      Overlap.activeConcept.run();

    });
  });

  menu.click(function(){
    return false;
  });

  this.showMenu = function (e) {

    this.visible = true;

    var x = e.pageX;
    var y = e.pageY + 10;

    menu.css({
      "display" : "",
      "top"     : y + 4,
      "left"    : x
    });

    var subX = $("#contextMenu").outerWidth() - 3;

    for (categoryId in categories) {
      var entry = $("#entry_" + categoryId);
      var subY = entry.position().top;
      $("#subContextMenu_" + categoryId).css({
        "top" : y + 4 + subY,
        "left": x + subX
      });
    }
  };

  this.hideMenu = function () {
    this.visible = false;
    menu.css("display", "none");

  };

  this.hideSubMenu = function(){
    $("#subContextMenu_" + lastSubMenuId).css("display", "none");
  }
};

