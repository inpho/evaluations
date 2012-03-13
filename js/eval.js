var numEvals = 0;
var evalsEnabled = false; 

function enableEvals() {
    evalsEnabled = true;    
    $('.active form:hidden').slideToggle();
    $('.evaltext').html("Thank you for improving the InPhO! Click on the ideas below to reveal the evaluation form.");
}

function search(elm, id, id2) {
    if (!($(elm).hasClass('active'))) {
        $("#moreInfo").html("<p>Loading search results ...</p><p><img src='/img/loading.gif' /></p>");
        var src  = '/entity/' + id + '/search/' + id2;
        $.get(src, function(data){
                $("#moreInfo").html(data);
            });
        $('.active .child').slideToggle("slow")
        $('.active .childLink').slideToggle("slow")
        if (evalsEnabled) $('.active form').slideToggle();
        $('.active').removeClass('active');
        $(elm).addClass('active');
        if (evalsEnabled) $('form', elm).slideToggle("slow");
        $('.child', elm).toggle("slow");
        $('.childLink', elm).toggle("slow");

    }
}

function incrEvals() {
    numEvals++;
}

function submitEvals(elm) {
   thisFunc(elm, 'relatedness');
   thisFunc(elm, 'generality');
   incrEvals();
}

function flagIdea(elm, id) {
     
}

function updateForm(elm, val, hide, idea, submitOnStop) {
    //update text
    switch(val) {
        case 0:
            if (hide) {
                $( "input[name='submit']", elm).show();
                $(".generality:visible", elm).slideToggle("slow");
            }
            $(".generality input[name='generality']", elm).attr("disabled","disabled");
            $(".generality input[name='generality']:radio", elm).removeAttr("checked");

            if (submitOnStop) { thisFunc($("form", elm), 'generality'); }
            $( ".reltext", elm ).html( "<em>unrelated</em> to " + idea);
            break;
        case 1:
            $(".generality:hidden", elm).slideToggle("slow");
            $(".generality input[name='generality']", elm).removeAttr("disabled");
            $( ".reltext", elm).html( "<em>marginally related</em> to " + idea );
            $( "input[name='submit']", elm).show();
            break;
        case 2:
            $(".generality:hidden", elm).slideToggle("slow");
            $(".generality input[name='generality']", elm).removeAttr("disabled");
            $( ".reltext", elm).html( "<em>somewhat related</em> to " + idea );
            $( "input[name='submit']", elm).show();
            break;
        case 3:
            $(".generality:hidden", elm).slideToggle("slow");
            $(".generality input[name='generality']", elm).removeAttr("disabled");
            $( ".reltext", elm).html( "<em>related</em> to " + idea );
            $( "input[name='submit']", elm).show();
            break;
        case 4:
            $(".generality:hidden").slideToggle("slow");
            $(".generality input[name='generality']", elm).removeAttr("disabled");
            $( ".reltext", elm).html( "<em>highly related</em> to " + idea );
            $( "input[name='submit']", elm).show();
            break;
    }
}

function thisFunc(elm, changed) {
    var id   = $("> [name='ante_id']", elm).val();
    var id2  = $("> [name='cons_id']", elm).val();
    var flag = $("> [name='flag']", elm).val();
    var img  = $("> .loading", elm.parent());
    var generality  = $("> div input[name='generality']:checked", elm).val();
    var relatedness = $("> input[name='relatedness']", elm).val();
    if (id == null || id2 == null) {
        return false;    
    }
    if (changed == 'generality') {
        var url_gen = '/idea/' + id + '/generality/' + id2;
        img.attr("src", "/img/loading.gif");
        if (generality == '--') {
            $.ajax({type: 'DELETE',
            url: url_gen,
            success: function(data){
                img.attr("src", "/img/check.gif");
            }} );
        }
        else if (generality == undefined) {
        $.post(url_gen,
            { degree : -1 },
            function(data){
                img.attr("src", "/img/check.gif");
            } );
        }
        else {
        $.post(url_gen,
            { degree : generality },
            function(data){
                img.attr("src", "/img/check.gif");
            } );
        }
        //alert(id + '->' + id2 + '\n generality ' + generality);
    }
    else if (changed == 'relatedness') {
        var url_rel = '/idea/' + id + '/relatedness/' + id2;
        if (relatedness == '--') {
            $.ajax({type: 'DELETE',
                url: url_rel,
                success: function(data){
                    $("> input[name='relatedness']", elm).val(-1);
                    img.attr("src", "/img/check.gif");
                } });

        }
        else{
            $.post(url_rel,
                { degree : relatedness },
                function(data){
                    img.attr("src", "/img/check.gif");
                } );
        }
        //alert(id + '->' + id2 + '\n relatedness ' + relatedness );
    }
    
    if ((generality > -1) && (relatedness > -1)) {
        img.attr("src", "/img/check.gif");
        incrEvals();    
    }

    if (numEvals == 10) {
        $("#dialog").dialog({position: [490,380], modal : true, title : 'Thank you!'});
    } 
}



function resetEvaluation(elm){
    var id   = $("> [name='ante_id']", elm).val();
    var id2  = $("> [name='cons_id']", elm).val();
    var img  = $("> .loading", elm.parent());
    var url_gen = '/idea/' + id + '/generality/' + id2 + "?_method=DELETE";
    var url_rel = '/idea/' + id + '/relatedness/' + id2 + "?_method=DELETE";
    img.attr("src", "/img/loading.gif");
    $.ajax({type: 'GET',
            url: url_gen,
            success: function(data){
                $("> div input[name='generality']:radio", elm).removeAttr("checked");
            } } );
    $.ajax({type: 'GET',
            url: url_rel,
            success: function(data){
                $("> .slider", elm).slider("option", "value", -1);
                $("> .slidertext", elm).html("<strong>Drag slider to set relatedness:</strong>");
                $("> input[name='relatedness']", elm).val(-1);
            } });
    img.attr("src", "/img/empty.gif");
    numEvals--;
}



function toggleList(selector) {
    if ($('.on', selector).length > 0) {
        $('.on', selector).removeClass('on').addClass('off');
    } else {
        $('.off', selector).removeClass('off').addClass('on');
    }
    $('ol', selector).toggle("slow");
    $('ul', selector).toggle("slow");
    $('p', selector).toggle("slow");
    }

    
    
    
function initSlider(elm, rel, submitOnStop, idea) {
    var form = elm.parent();

    elm.slider({
        value: rel,
        min: 0,
        max: 4,
        step: 1,
        change: function( event, ui ) {
            updateForm(form, ui.value, true, idea, submitOnStop);
        },
        slide: function( event, ui ) {
            updateForm(form, ui.value, false, idea, submitOnStop);
        }
        , stop: function( event, ui ) {   
            // if changed, update val and submit
            if (ui.value != $( "input[name='relatedness']", form).val()) {
                $( "input[name='relatedness']", form).val(ui.value);
                if (submitOnStop) thisFunc(form, 'relatedness');
            }
        }
    });
    $( "a", elm ).focusout(function( event, ui ) {
            $( "a", elm ).addClass("ui-state-hover"); 
        });
    if (rel == -1) {
        $(".generality input[name='generality']", form).attr("disabled","disabled");
        $(".generality input[name='generality']:radio", form).removeAttr("checked");
    }
    else {
        elm.slider("option", "value", rel);
    }
}
