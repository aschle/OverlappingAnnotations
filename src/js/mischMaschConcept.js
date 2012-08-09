var Overlap = window.Overlap = Overlap || {};

Overlap.MischMasch = function (){

  // the global atom list
  var atomList                = Overlap.Atoms.getAtomList();
  // startEnd list for positioning the bars
  var atomStartEndListBar     = [];
  // startEnd list for positioning the borders
  var atomStartEndListBorder  = [];
  // column list for the bars, which bar goes in which column
  var columnList              = [];
  // list holding all atoms, which need to be displayed additionally as borders
  var borderList              = [];
  // level list for the borders
  var levelList               = [];
  // for displaying the category -> subcategory
  var overlay                 = null;

  /* Main method */
  this.run = function(){
    this.reset();
    letterToPixelPositionBar();
    letterToPixelPositionBorder();
    renderBars();
    display();
    //displayBorders();
  };

  /* The reset function removes all existing Bars, Borders, Shadows, also all needed global variables need to be reset, because they are going to be recalculated. */
  this.reset = function(){

    $(".bar").remove();
    $(".bubble").remove();
    $(".shadowBG").remove();
    $("div[id^='overlay_']").remove();

    atomList                = Overlap.Atoms.getAtomList();
    atomStartEndListBar     = [];
    atomStartEndListBorder  = [];
    columnList              = [];
    levelList               = [];
    borderList              = [];
  };

  /* Uses the atomList to calculate the position of each bar. */
  var letterToPixelPositionBar = function(){

    for(atom in atomList){

      // get the selection within the text
      $("#text").selection(atomList[atom].start, atomList[atom].end);

      // add a span to selected text (when multiple elements
      // are crossed, more than one span is added)
      var span      = $("#text").wrapSelection();

      var barTop    = span.position().top;
      var barHeight = span.height();

      // different calcualtion if selection was across
      // multiple elements, so we have more that one span
      if (span.length > 1){
        var lastSpan        = span.last();
        var lastSpanTop     = lastSpan.position().top;
        var lastSpanHeight  = lastSpan.height();
        barHeight           = lastSpanTop - barTop + lastSpanHeight;
      }

      // remove the span(s) -> reset the text
      Overlap.Helper.removeSpans();

      atomStartEndListBar.push({
        "startY"  : barTop,
        "endY"    : barTop + barHeight,
        "height"  : barHeight
      });
    }
  };

  var letterToPixelPositionBorder = function(){

    for(atom in atomList){

      $("#text").selection(atomList[atom]["start"], atomList[atom]["end"]);

      var spans = $("#text").wrapSelection({
          fitToWord: false
        });

      spans.wraplines();
      var spanLines = $("span[class^='wrap_line_']");

      spanLines.each(function(index, el){
        // Remove trailing whitespace
        var text = $(el).text().replace(/\s+$/, '')
        $(el).text(text);
      });

      var len     = spanLines.length;
      var startX  = spanLines.first().position().left;
      var startY  = spanLines.first().position().top;
      var endX    = spanLines.last().position().left + spanLines.last().width();
      var endY    = spanLines.last().position().top + spanLines.last().height();


      var type;

      // Case 0: single line
      //  ____
      // |____|
      //
      if(len == 1){

        type = 'X';

      }else {
        // Case 1: 2 lines
        //        ___
        //  ___  |___
        //  ___|
        //
        if(len == 2 && startX > endX){
          type = 'Y';

        } else {

          // other Cases: A,B,C,D
          type = Overlap.Helper.minMaxCase(startX, endX);
        }
      }

      atomStartEndListBorder.push({
        "startX"      : startX,
        "startY"      : startY,
        "endX"        : endX,
        "endY"        : endY,
        "type"        : type
        });

      Overlap.Helper.removeSpans();
    }
  };

  // *** calculating the columns
  var renderBars = function(){
    for(index in atomStartEndListBar){
      insertBySizeASC(index, 0);
    }
  };

  var insertBySizeASC = function(atomId, columnId){

    if (columnList[columnId] == null){
      columnList.push([atomId]);
    }
    else {

      var overlapList = getAllOverlaps(atomId, columnId);

      if(overlapList.length == 0) {
        columnList[columnId].push(atomId);
      }
      else {
        if(overlapList.length > 1) {
          insertBySizeASC(atomId, columnId + 1);
        }
        else {
          // exactly one overlap:
          // the bigger one needs to move further
          var index             = overlapList[0].index;
          var id                = overlapList[0].atomId;
          var atomIdHeight      = atomStartEndListBar[atomId].height;
          var overlapAtomHeight = atomStartEndListBar[id].height;

          if( atomIdHeight > overlapAtomHeight) {
              // bigger one moves further
              insertBySizeASC(atomId, columnId + 1);

            } else {

            // if same size (order according apperiance in text)
            if( atomIdHeight == overlapAtomHeight) {

              if( atomList[atomId].start > atomList[id].start ) {

                  // move the one with id away
                  var removedItem = columnList[columnId].splice(index, 1);
                  columnList[columnId].push(atomId);
                  insertBySizeASC(removedItem[0], columnId + 1);

              } else {
                  insertBySizeASC(atomId, columnId + 1);
              }

            } else {
              var removedItem = columnList[columnId].splice(index, 1);
              columnList[columnId].push(atomId);
              insertBySizeASC(removedItem[0], columnId + 1);
            }
          }
        }
      }
    }
  };

  var getAllOverlaps = function(atomId, columnId){

    var overlapList = [];

    var startY  = atomStartEndListBar[atomId].startY;
    var endY    = atomStartEndListBar[atomId].endY;

    for (x in columnList[columnId]){

      var currAtom    = atomStartEndListBar[columnList[columnId][x]];
      var currStartY  = currAtom.startY;
      var currEndY    = currAtom.endY;

      if (!(endY < currStartY || startY > currEndY)){
        overlapList.push({
          "index"   : x,
          "atomId"  : columnList[columnId][x]
        });
      }
    }
    return overlapList;
  };

  var getAllOverlapsBorder = function(atomId, levelId){

    var overlapList = [];

    var aStart  = atomList[atomId].start;
    var aEnd    = atomList[atomId].end;

    // check for all atoms in the level the overlpping type:
    for (l in levelList[levelId]){

      var lStart  = atomList[levelList[levelId][l]].start;
      var lEnd    = atomList[levelList[levelId][l]].end;

      // No overlap:
      if(lEnd < aStart || aEnd < lStart){
        continue;
      }

      // Identity:
      if (aStart == lStart && aEnd == lEnd){
        overlapList.push({"type": 0, "index": l, "atomId": levelList[levelId][l]});
        continue;
      }

      // Overlap:
      if( (lStart < aStart && lEnd > aStart && lEnd < aEnd) ||
        (lEnd > aEnd && lStart > aStart && lStart < aEnd)){

        overlapList.push({"type": 1, "index": l, "atomId": levelList[levelId][l]});
        continue;
      }

      // else: Inclusion
      overlapList.push({"type": 2, "index": l, "atomId": levelList[levelId][l]});
    }
    return overlapList;
  }

  var displayShadows = function(){

    var min     = $("#text").position().left;
    var max     = $("#text").position().left + $("#text").width();
    var h       = 16; // TODO: why 16px?
    var lh      = 21;  // TODO: why 21?
    var border  = 0;

    var left, top, height, width;

    for(id in atomStartEndListBorder){
        
        var bubble      = atomList[id];
        var coordinates = atomStartEndListBorder[id];
        var type        = coordinates.type;
        var category    = atomList[id].category;
        var startX      = coordinates.startX;
        var startY      = coordinates.startY;
        var endX        = coordinates.endX;
        var endY        = coordinates.endY;
        var level       = 0;

        var offset      = 0;

        switch (type)
        {
          case 'X': case 'A': // one line or block
          {
            top     = startY - border - offset;
            left    = startX - border - offset;
            height  = endY - startY + 2 * offset;
            width   = endX - startX + 2 * offset;

            addBubble (id, null, top, left, height, width, offset, category,
              "all", level);
          }
          break;

          case 'Y': // two lines, but seperate
          {
            // first on the right
            top     = startY - border - offset;
            left    = startX - border - offset;
            height  = h + 2 * offset;
            width   = max - startX + offset;

            addBubble(id, 1, top, left, height, width, offset, category,
              "left", level);

            // second on the left
            top   = endY - h - border - offset;
            left  = min;
            width = endX - min + offset;

            addBubble(id, 2, top, left, height, width, offset, category,
              "right", level);
          }
          break;

          case 'B':
          {
            // first on the left I (corner_TL)
            top     = startY - border - offset;
            left    = startX - border - offset;
            height  = endY - startY - lh + border + 2 * offset;
            width   = max - startX + 2 * offset - (max - endX);

            addBubble(id, 1, top, left, height, width, offset, category,
              "cornerTL", level);

            // second on the right II
            left    = endX + offset;
            height  = endY - startY - lh + 2 * offset;
            width   = max - endX;

            addBubble(id, 2, top, left, height, width, offset, category,
              "right", level);

            // third bottom left III
            top     = endY - lh + border + offset;
            left    = startX - border - offset;
            height  = lh - border;
            width   = endX - min + 2 * offset;

            addBubble(id, 3, top, left, height, width, offset, category,
              "bottom", level);
          }
          break;

          case 'C':
          {
            // first on the top I (corner_TL)
            top     = startY - border - offset;
            left    = startX - border - offset;
            height  = lh;
            width   = max - startX + 2 * offset;

            addBubble(id, 1, top, left, height, width, offset, category,
              "top", level);

            // second on the left
            top     = startY + lh - border - offset;
            left    = min - border - offset;
            height  = endY - startY - lh + 2 * offset;
            width   = startX - min;

            addBubble(id, 2, top, left, height, width, offset, category,
              "left", level);

            // third bottom right
            left    = startX - offset;
            top     = startY + border + lh - border - offset;
            height  = endY - startY - lh + 2 * offset;
            width   = endX - startX + 2 * offset;

            addBubble(id, 3, top, left, height, width, offset, category,
              "cornerBR", level);
          }
          break;

          case 'D':
              {
                // CASE I: 5 DIVs (in the middle no borders)
                if(startX <= endX){

                // first on the left I (corner_TL)
                top     = startY + lh - border - offset;
                left    = min - border - offset;
                height  = endY - startY - lh + 2 * offset;
                width   = startX - min;

                addBubble(id, 1, top, left, height, width, offset, category,
                  "left", level);

                // // second on top II
                top     = startY - border - offset;
                left    = startX - border - offset;
                height  = lh;
                width   = max - startX + 2 * offset - (max - endX);

                addBubble(id, 2, top, left, height, width, offset, category,
                  "cornerTL", level);

                // 4rd on the right III
                left    = endX + offset;
                height  = endY - startY - lh + 2 * offset;
                width   = max - endX;

                addBubble(id, 3, top, left, height, width, offset, category,
                  "right", level);

                // 4th on the bottom IV
                left    = startX - offset;
                top     = endY - lh + border + offset;
                height  = lh - border;
                width   = endX - startX + 2 * offset;

                addBubble(id, 4, top, left, height, width, offset, category,
                  "cornerBR", level);

                // 5th in the middle
                top     = startY + lh - offset;
                left    = startX - offset;
                height  = endY - startY - 2 * lh + 2 * offset + border;
                width   = endX - startX + 2 * offset;

                if (!(height < 0 || width < 0)){
                  addBubble(id, 5, top, left, height, width, offset, category,
                  "", level);
                }
                
            }

            // CASE 2: 5 DIVs
            else {

              // first on the left I (corner_TL)
                top     = startY + lh - border - offset;
                left    = min - border - offset;
                height  = endY - startY - 2 * lh + 2 * offset + border;
                width   = endX - min + 2 * offset;

                addBubble(id, 1, top, left, height, width, offset, category,
                  "cornerTL", level);

                // second on top Í
                top     = startY - border - offset;
                left    = startX - border - offset;
                height  = lh;
                width   = max - startX + 2 * offset;

                addBubble(id, 2, top, left, height, width, offset, category,
                  "top", level);

                // 3rd on the right III
                top     = startY + lh - offset;
                left    = startX - offset;
                height  = endY - startY - 2 * lh + 2 * offset;
                width   = max - startX + 2 * offset;

                addBubble(id, 3, top, left, height, width, offset, category,
                  "cornerBR", level);

                // 4th on the bottom IV
                top     = endY - lh + border + offset;
                left    = min - border - offset;
                height  = lh - border;
                width   = endX - min + 2 * offset;

                addBubble(id, 4, top, left, height, width, offset, category,
                  "bottom", level);

                // 5th in the middle
                top     = startY + lh - border - offset;
                left    = endX + offset;
                height  = endY - startY - 2 * lh + 2 * offset;
                width   = startX -endX - 2 * offset;

                addBubble(id, 5, top, left, height, width, offset, category,
                  "topBottom", level);
            }
          }
          break;
        }
    }
  };

  var addBubble = function(id, subId, top, left, height, width, offset, category, bubbleClass, level){

    var bubble = null;

    if(subId == null){

      $(".container").append(
        '<div class="shadowBG" id="shadowID_' + id + '">&nbsp;</div>'
        );

      bubble = $("#shadowID_" + id);

      bubble.css({
        "top"    : top,
        "left"   : left,
        "height" : height,
        "width"  : width,
        "z-index": (-100 - level)
      });

      bubble.addClass(bubbleClass);
      bubble.data({"id":id, "category":category});

    } else{

      $(".container").append(
        '<div class="shadowBG" id="shadowID_' + id + '_' + subId + '">&nbsp;</div>'
        );

      bubble = $("#shadowID_" + id + "_" + subId);
      bubble.css({
        "top"   : top,
        "left"  : left,
        "height": height,
        "width" : width,
        "z-index": (-100 - level)
      });

      bubble.addClass(bubbleClass);
      bubble.data({"id":id, "subId": subId, "category":category});
    }
  };

  var addBubbleBorder = function(id, subId, top, left, height, width, offset, category, bubbleClass, level){

    var bubble = null;

    if(subId == null){

      $(".container").append(
        '<div class="bubble" id="bubbleID_' + id + '">&nbsp;</div>'
        );

      bubble = $("#bubbleID_" + id);

      bubble.css({
        "top"    : top,
        "left"   : left,
        "height" : height,
        "width"  : width,
        "z-index": (-100 - level)
      });

      bubble.addClass(bubbleClass);
      bubble.addClass("bubble_" + category);
      bubble.data({"id":id, "category":category});

    } else{

      $(".container").append(
        '<div class="bubble" id="bubbleID_' + id + '_' + subId + '">&nbsp;</div>'
        );

      bubble = $("#bubbleID_" + id + "_" + subId);
      bubble.css({
        "top"   : top,
        "left"  : left,
        "height": height,
        "width" : width,
        "z-index": (-100 - level)
      });

      bubble.addClass(bubbleClass);
      bubble.addClass("bubble_" + category);
      bubble.data({"id":id, "subId": subId, "category":category});
    }
  }

  var display = function(){

    // show all shadows
    displayShadows();

    // in columnList are only IDs
    // show all bars
    for (i in columnList){
      for (j in columnList[i]){

        var barId     = columnList[i][j];
        var gap       = 5;
        var thickness = 10;

        var y         = atomStartEndListBar[barId].startY;
        var height    = atomStartEndListBar[barId].height;
        var offset    = (i * gap) + ((Number(i)+1) * thickness); // TODO remove numbers
        var x         = Overlap.textX - offset - 18;

        $(".container").append(
          '<div class="bar" id="barID_' + barId + '">&nbsp;</div>'
          );

        $("#barID_" + barId).css({
          "top"   : y,
          "left"  : x,
          "height": height
        });

        $("#barID_" + barId).addClass("bar_" + atomList[barId].category);

        $("#barID_" + barId).data("id", barId);
        $("#barID_" + barId).data("category", atomList[barId].category);
        $("#barID_" + barId).data("subCategory", atomList[barId].subcategory);
        $("#barID_" + barId).data("clicked", false);

      }
    }

    // ALL THE BAR CLICKING
    // delete bars on rightclick
    $("div.bar").mousedown(function(event){

      if( event.button == 2 ) {
        var bar = $(this);
        Overlap.Atoms.removeAtomWithId(bar.data("id"));
        bar.fadeOut(600, function(){
          $(this).remove();
          Overlap.MischMasch.run();
        });

        // delete also the shadow
        var all = Overlap.Helper.getAllBubbles("shadowID", bar.data("id"));
        all.fadeOut(600, function(){
          $(this).remove();
          Overlap.MischMasch.run();
        });
        

        //delete also the border
        Overlap.Helper.getAllBubbles("bubbleID", bar.data("id")).fadeOut(600, function(){
          $(this).remove();
          Overlap.MischMasch.run();
        });

        return false; 
      }

      // left click on bar
      if( event.button == 0){

        // if bar was already activated
        if ($(this).data("activated")){
          $(this).data("activated", false);
          $(this).removeClass("activatedBar");
          $(this).addClass("bubble_" + $(this).data("category"))
        }
        // if bar was not activated
        else{
          $(this).data("activated", true);
          $(this).removeClass("bubble_" + $(this).data("category"));
          $(this).addClass("activatedBar");

        }
        return false; 
      }
      return true;
    });

    // HOVERING A BAR
    // making the bar a littel bigger while hovering and also showing the boarder of that textatom
    $("div.bar").hover(

      //handlerIN
      function(){
        Overlap.MischMasch.hoverBarIN($(this));
      },

      //handlerOUT
      function(){
        Overlap.MischMasch.hoverBarOUT($(this));      
      }
    );
  };

  this.hoverBarIN = function(element){

    var id         = element.data("id");
    var activated  = element.data("activated");

    // only react on hovering if bar is not activated
    if (!activated) {
      element.addClass("bubble_" + element.data("category"));
      // create and show the border
      borderList.push(id);
      displayBorders();

      // hiding the grey background
      Overlap.Helper.getAllBubbles("shadowID", id).fadeOut(
        200,
        function(){
          $(this).css("display", "");
          $(this).css("background", "rgba(255, 255, 255, 0.125)");
      });
    }        

    // showing the overlay (category > subcategory)
    var top   = element.position().top;
    var left  = parseInt($(".container").position().left) + parseInt($(".container").width());
    overlay   = new Overlap.Overlay(id, top, left);
    overlay.show();
  };

  this.hoverBarOUT = function(element){

    var id        = element.data("id");
    var activated = element.data("activated");
    var cat       = element.data("category");

    // only remove border if bar is not activated
    if(!activated){
      element.removeClass("bubble_" + cat);
      Overlap.Helper.getAllBubbles("bubbleID", id).fadeOut(
      200,
      function(){
        $(this).remove();
      });

      Overlap.Helper.getAllBubbles("shadowID", id).css("display", "none")
      Overlap.Helper.getAllBubbles("shadowID", id).css("background", "rgba(0, 0, 0, 0.125)")
      Overlap.Helper.getAllBubbles("shadowID", id).fadeIn(200);
      Overlap.Helper.deleteBarWithId(borderList, id);

      element.removeClass("activatedBar");
    }

    // hiding the overlay
    overlay.hide();
    displayBorders();

  };

  var displayBorders = function(){

    levelList = [];

    // adding all borders in boderList to the levelList
    // *** calculating the level
    for(index in borderList){
      insertBorders(borderList[index], 0);
    }

    // display the borders
    var min     = $("#text").position().left;
    var max     = $("#text").position().left + $("#text").width();
    var h       = 16; // TODO: why 16px?
    var lh      = 21;  // TODO: why 21?
    var border  = 2;

    var left, top, height, width;

    for (i in levelList){
      for (j in levelList[i]) {

        var id          = levelList[i][j];
        var bubble      = atomList[id];
        var coordinates = atomStartEndListBorder[id];
        var type        = coordinates.type;
        var category    = atomList[id].category;
        var startX      = coordinates.startX;
        var startY      = coordinates.startY;
        var endX        = coordinates.endX;
        var endY        = coordinates.endY;
        var level       = i;

        var offset = i * 2 * border;

        switch (type)
        {
          case 'X': case 'A': // one line or block
          {
            top     = startY - border - offset;
            left    = startX - border - offset;
            height  = endY - startY + 2 * offset;
            width   = endX - startX + 2 * offset;

            addBubbleBorder (id, null, top, left, height, width, offset, category,
              "all", level);
          }
          break;

          case 'Y': // two lines, but seperate
          {
            // first on the right
            top     = startY - border - offset;
            left    = startX - border - offset;
            height  = h + 2 * offset;
            width   = max - startX + offset;

            addBubbleBorder(id, 1, top, left, height, width, offset, category,
              "left", level);

            // second on the left
            top   = endY - h - border - offset;
            left  = min;
            width = endX - min + offset;

            addBubbleBorder(id, 2, top, left, height, width, offset, category,
              "right", level);
          }
          break;

          case 'B':
          {
            // first on the left I (corner_TL)
            top     = startY - border - offset;
            left    = startX - border - offset;
            height  = endY - startY - lh + border + 2 * offset;
            width   = max - startX + 2 * offset - (max - endX);

            addBubbleBorder(id, 1, top, left, height, width, offset, category,
              "cornerTL", level);

            // second on the right II
            left    = endX + offset;
            height  = endY - startY - lh + 2 * offset;
            width   = max - endX;

            addBubbleBorder(id, 2, top, left, height, width, offset, category,
              "right", level);

            // third bottom left III
            top     = endY - lh + border + offset;
            left    = startX - border - offset;
            height  = lh - border;
            width   = endX - min + 2 * offset;

            addBubbleBorder(id, 3, top, left, height, width, offset, category,
              "bottom", level);
          }
          break;

          case 'C':
          {
            // first on the top I (corner_TL)
            top     = startY - border - offset;
            left    = startX - border - offset;
            height  = lh;
            width   = max - startX + 2 * offset;

            addBubbleBorder(id, 1, top, left, height, width, offset, category,
              "top", level);

            // second on the left
            top     = startY + lh - border - offset;
            left    = min - border - offset;
            height  = endY - startY - lh + 2 * offset;
            width   = startX - min;

            addBubbleBorder(id, 2, top, left, height, width, offset, category,
              "left", level);

            // third bottom right
            left    = startX - offset;
            top     = startY + border + lh - border - offset;
            height  = endY - startY - lh + 2 * offset;
            width   = endX - startX + 2 * offset;

            addBubbleBorder(id, 3, top, left, height, width, offset, category,
              "cornerBR", level);
          }
          break;

          case 'D':
              {
                // CASE I: 5 DIVs (in the middle no borders)
                if(startX <= endX){

                // first on the left I (corner_TL)
                top     = startY + lh - border - offset;
                left    = min - border - offset;
                height  = endY - startY - lh + 2 * offset;
                width   = startX - min;

                addBubbleBorder(id, 1, top, left, height, width, offset, category,
                  "left", level);

                // // second on top II
                top     = startY - border - offset;
                left    = startX - border - offset;
                height  = lh;
                width   = max - startX + 2 * offset - (max - endX);

                addBubbleBorder(id, 2, top, left, height, width, offset, category,
                  "cornerTL", level);

                // 4rd on the right III
                left    = endX + offset;
                height  = endY - startY - lh + 2 * offset;
                width   = max - endX;

                addBubbleBorder(id, 3, top, left, height, width, offset, category,
                  "right", level);

                // 4th on the bottom IV
                left    = startX - offset;
                top     = endY - lh + border + offset;
                height  = lh - border;
                width   = endX - startX + 2 * offset;

                addBubbleBorder(id, 4, top, left, height, width, offset, category,
                  "cornerBR", level);

                // 5th in the middle
                top     = startY + lh - offset;
                left    = startX - offset;
                height  = endY - startY - 2 * lh + 2 * offset + border;
                width   = endX - startX + 2 * offset;

                if (!(height < 0 || width < 0)){
                addBubbleBorder(id, 5, top, left, height, width, offset, category,
                  "", level);
              }
            }

            // CASE 2: 5 DIVs
            else {

              // first on the left I (corner_TL)
                top     = startY + lh - border - offset;
                left    = min - border - offset;
                height  = endY - startY - 2 * lh + 2 * offset + border;
                width   = endX - min + 2 * offset;

                addBubbleBorder(id, 1, top, left, height, width, offset, category,
                  "cornerTL", level);

                // second on top Í
                top     = startY - border - offset;
                left    = startX - border - offset;
                height  = lh;
                width   = max - startX + 2 * offset;

                addBubbleBorder(id, 2, top, left, height, width, offset, category,
                  "top", level);

                // 3rd on the right III
                top     = startY + lh - offset;
                left    = startX - offset;
                height  = endY - startY - 2 * lh + 2 * offset;
                width   = max - startX + 2 * offset;

                addBubbleBorder(id, 3, top, left, height, width, offset, category,
                  "cornerBR", level);

                // 4th on the bottom IV
                top     = endY - lh + border + offset;
                left    = min - border - offset;
                height  = lh - border;
                width   = endX - min + 2 * offset;

                addBubbleBorder(id, 4, top, left, height, width, offset, category,
                  "bottom", level);

                // 5th in the middle
                top     = startY + lh - border - offset;
                left    = endX + offset;
                height  = endY - startY - 2 * lh + 2 * offset;
                width   = startX -endX - 2 * offset;

                addBubbleBorder(id, 5, top, left, height, width, offset, category,
                  "topBottom", level);
            }
          }
          break;
        }
      }
    }

  };

  var insertBorders = function(atomId, levelId){
    // *** if this level does not exist: add a new one
    if (levelList[levelId] == null){
      levelList.push([atomId]);
    }

    // *** find a fitting level
    else {

      var overlapList = getAllOverlapsBorder(atomId, levelId);

      if(overlapList.length == 0){
        levelList[levelId].push(atomId);
      }
      else{
        // * more than one overlap: bubble up
        if(overlapList.length > 1){
          insertBorders(atomId, levelId + 1);
        }
        // * only one overlap: decide which to bubble, depending on the
        // overlap type
        else {

          var type    = overlapList[0].type;
          var index   = overlapList[0].index;
          var id      = overlapList[0].atomId;
          var aStart  = atomList[atomId].start;
          var aEnd    = atomList[atomId].end;
          var lAtom   = atomList[id];

          // (0) Identity: does not matter which bubbles
          if (type == 0){
            insertBorders(atomId, levelId + 1);
            return;
          }

          // (1) Overlap: longer one bubbles up
          if(type == 1){
            // check which one is longer
            if(aEnd - aStart >
              lAtom.end - lAtom.start){
              insertBorders(atomId, levelId + 1);
            } else {
              var removedItem = levelList[levelId].splice(index, 1);
              levelList[levelId].push(atomId);
              insertBorders(removedItem[0], 0);
            }
          }

          // (2) Inclusion: longer on bubbles up
          if(type == 2){
            // check which one is longer
            if(aEnd - aStart >
              lAtom.end - lAtom.start){
              insertBorders(atomId, levelId + 1);
            } else {
              var removedItem = levelList[levelId].splice(index, 1);
              levelList[levelId].push(atomId);
              insertBorders(removedItem[0], 0);
            }
          }

        } // * end: decide which to bubbel up

      } // ** end: somehow overlapping insert in level up

    } // *** end: find a fitting level
  }

};