const DEFAULT_FX_DELAY = 100;

function SetCookie(name, value, expirationDate) 
{
    var content = escape(value) + ((expirationDate) ? "; expires=" + expirationDate.toUTCString() : "");
    document.cookie = name + "=" + content;
}

function GetCookie(name) 
{
    var x, y, cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) 
    {
        x = cookies[i].substr(0, cookies[i].indexOf("="));
        y = cookies[i].substr(cookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == name) 
        {
            return unescape(y);
        }
    }
}

function ExpireCookie(name)
{
    SetCookie(name, "", new Date())
}

/***********************************
 *		GLOBAL EVENTS HANDLERS
 ***********************************/

 // General functionality
$(document).ready(function() {
	$("body").nivoZoom();
	
	$(".menu").fadeTo(500, 1);
	$(".accordion").fadeTo(500, 1);
	
    if (!GetCookie("hideNavigationHints"))
    {
        var navigationHintCounter = 1;
        $(".navigationHint").each(function()
        {
            var $self = $(this);
            setTimeout(function()
            {
                $self.fadeTo(500, 1);
                setTimeout(function()
                {
                    $self.fadeTo(500, 0);
                }, 3000);
            }, (navigationHintCounter - 1) * 3000);
            navigationHintCounter++;
        });
        SetCookie("hideNavigationHints", true);
    }
    
    setTimeout(function()
    {
        var footer = $(".footer");
        footer.fadeTo(500, 0);
    }, 3000);
    
    $(".accordion").accordion({
        active: false, 
        animated: false,
        collapsible: true,
        heightStyle: "content",
        fillSpace: true,
        // Accordion item click
        change: function(event, ui) {
            var $accordion = $(".accordion");
            
            if (ui.newHeader.length > 0)
            {
                SetCurrentlySelectedAccordionItem($accordion.find("h3").index(ui.newHeader[0]));
                $(window).scrollTop(ui.newHeader.position().top + 100);
            }
            else
            {
                SetCurrentlySelectedAccordionItem(-1);
                $(window).scrollTop(0);
            }
            
            UpdateAccordionShading();
        }
    });
	
	$(".ui-accordion-content").corner("round 8px keep");
	
	// Accordion item mouseover/mouseout
	$(".ui-accordion-header").hover(function(event) 
	{
		event.preventDefault();
	
		if (GetCurrentlySelectedAccordionItem() > -1)
		{
			return;
		}
	
		SetCurrentlyShadedAccordionItem($(".accordion").find("h3").index($(this)));
		setTimeout(function()
		{
			UpdateAccordionShading();
		}, 150);
	});
	
	// Menu item click
	$(".menu > a").click(function(event)
	{
		event.preventDefault();
		
		var $self = $(this);
		$self.fadeTo(500, 0.2, function()
		{
			document.location = $self.attr("href");
		});
	});
	
	// Menu item mouseover/mouseout
	$(".menu > a").hover(function(event) 
	{
		event.preventDefault();
		
		SetCurrentMenuItem($(".menu").find("a").index($(this)));
		setTimeout(function()
		{
			UpdateMenuShading();
		}, 150);
	});
});

$(window).resize(function() {
	$(".accordion").accordion("resize");
	UpdateFooter();
	UpdateNavigationHints();
});

$(window).scroll(function() {
	UpdateFooter();
	UpdateNavigationHints();
});

/******************************
 * 		INPUT PROCESSING
 ******************************/
$(document).keyup(function(event) {
	var keyCode = event.which;
    
    if (keyCode == 17)
    {
        g_ctrlPressed = false;
        return;
    }
    else if (keyCode == 18)
    {
        g_altPressed = false;
        return;
    }
    
	if (keyCode == 38 || keyCode == 87) // Down arrow or 's'
	{
		if (HasAccordion())
		{
			if (GetCurrentlySelectedAccordionItem() == -1)
			{
				ShadePreviousAccordionItem();
			}
			else
			{
				SelectPreviousAccordionItem();
			}
		}
		else if (HasMenu())
		{
			MoveToPreviousMenuItem();
		}
	}
	else if (keyCode == 40 || keyCode == 83) // Up arrow or 'w'
	{
		if (HasAccordion())
		{
			if (GetCurrentlySelectedAccordionItem() == -1)
			{
				ShadeNextAccordionItem();
			}
			else
			{
				SelectNextAccordionItem();
			}
		}
		else if (HasMenu())
		{
			MoveToNextMenuItem();
		}
	}
	else if (keyCode == 37 || keyCode == 65 || keyCode == 8) // Left arrow or 'a' or backspace
	{
		if (HasAccordion())
		{
			if (GetCurrentlySelectedAccordionItem() == -1)
			{
				if (GetCurrentlyShadedAccordionItem() == -1)
				{
					GoHome();
				}
				else
				{
					SetCurrentlyShadedAccordionItem(-1);
				}
			}
			else
			{
				var previouslyShadedAccordionItem = GetCurrentlyShadedAccordionItem();
				SetCurrentlySelectedAccordionItem(-1);
				setTimeout(function()
				{
					SetCurrentlyShadedAccordionItem(previouslyShadedAccordionItem);
					UpdateAccordionShading();
				}, DEFAULT_FX_DELAY);
			}
		}
		else if (HasMenu())
		{
			SetCurrentMenuItem(-1);
		}
        else
        {
            GoHome();
        }
	}
	else if (keyCode == 39 || keyCode == 68 || keyCode == 13 || keyCode == 32) // Right arrow or 'd' or RETURN or SPACE
	{
		if (HasAccordion())
		{
			if (GetCurrentlyShadedAccordionItem() == -1)
			{
				SetCurrentlyShadedAccordionItem(0);
			}
			else if (GetCurrentlySelectedAccordionItem() == -1)
			{
				SetCurrentlySelectedAccordionItem(GetCurrentlyShadedAccordionItem());
			}
		}
		else
		{
			if (GetCurrentMenuItem() == -1)
			{
				SetCurrentMenuItem(0);
			}
			else if (HasMenu())
			{
				SimulateClickOnCurrentMenuItem();
			}
		}
	}
	/*else if (keyCode == 27) // Escape
	{
		if (HasAccordion())
		{
			if (GetCurrentlySelectedAccordionItem() == -1)
			{
				GoHome();
			}
			else
			{
				SetCurrentlySelectedAccordionItem(-1);
			}
		}
		else if (HasMenu())
		{
			SetCurrentMenuItem(-1);
		}
        else
        {
            GoHome();
        }
	}*/
    else if (g_ctrlPressed && g_altPressed && keyCode == 67) // Remove cookies
    {
        ExpireCookies();
    }
	
	if (HasAccordion())
	{
		var $accordion = $(".accordion");
		$accordion.accordion("activate", GetCurrentlySelectedAccordionItem());
		
		var $accordionItem = $($accordion.find("h3")[GetCurrentlySelectedAccordionItem()]);
		if ($accordionItem.length > 0) 
		{
			$(window).scrollTop($accordionItem.position().top + 100);
		}
		else
		{
			$(window).scrollTop(0);
		}
		
		UpdateAccordionShading();
	}
	else
	{
		UpdateMenuShading();
	}
});

$(document).keydown(function(event) {
	var keyCode = event.which;
    
    if (keyCode == 17)
    {
        g_ctrlPressed = true;
    }
    else if (keyCode == 18)
    {
        g_altPressed = true;
    }
});

/******************************************
 *		CURRENT MENU ITEM MANAGEMENT
 ******************************************/
 
 var g_currentMenuItem = -1;
 
 function SetCurrentMenuItem(currentMenuItem)
{
	g_currentMenuItem = currentMenuItem;
}

function GetCurrentMenuItem()
{
	return g_currentMenuItem;
}

function MoveToPreviousMenuItem()
{
	if ($(".menu").length == 0)
	{
		return;
	}

	if (--g_currentMenuItem < 0)
	{
		g_currentMenuItem = $(".menu > a").length - 1;
	}
}

function MoveToNextMenuItem()
{
	if ($(".menu").length == 0)
	{
		return;
	}

	if (++g_currentMenuItem >= $(".menu > a").length)
	{
		g_currentMenuItem = 0;
	}
}

/*********************************************
 *		CURRENT ACCORDION ITEM MANAGEMENT
 *********************************************/

var g_currentlySelectedAccordionItem = -1;
var g_currentlyShadedAccordionItem = -1;
var g_ctrlPressed = false;
var g_altPressed = false;

function SetCurrentlySelectedAccordionItem(currentlySelectedAccordionItem)
{
	g_currentlySelectedAccordionItem = currentlySelectedAccordionItem;
	g_currentlyShadedAccordionItem = g_currentlySelectedAccordionItem;
}

function SetCurrentlyShadedAccordionItem(currentlyShadedAccordionItem)
{
	g_currentlyShadedAccordionItem = currentlyShadedAccordionItem;
}

function GetCurrentlySelectedAccordionItem()
{
	return g_currentlySelectedAccordionItem;
}

function GetCurrentlyShadedAccordionItem()
{
	return g_currentlyShadedAccordionItem;
}

function ShadePreviousAccordionItem()
{
	if ($(".accordion").length == 0 || g_currentlySelectedAccordionItem > -1)
	{
		return;
	}
	
	if (--g_currentlyShadedAccordionItem < 0)
	{
		g_currentlyShadedAccordionItem = $(".ui-accordion-header").length - 1;
	}
}

function SelectPreviousAccordionItem()
{
	if ($(".accordion").length == 0)
	{
		return;
	}

	if (--g_currentlySelectedAccordionItem < 0)
	{
		g_currentlySelectedAccordionItem = $(".ui-accordion-header").length - 1;
	}
	
	g_currentlyShadedAccordionItem = g_currentlySelectedAccordionItem;
}

function ShadeNextAccordionItem()
{
	if ($(".accordion").length == 0 || g_currentlySelectedAccordionItem > -1)
	{
		return;
	}

	if (++g_currentlyShadedAccordionItem >= $(".ui-accordion-header").length)
	{
		g_currentlyShadedAccordionItem = 0;
	}
}

function SelectNextAccordionItem()
{
	if ($(".accordion").length == 0)
	{
		return;
	}

	if (++g_currentlySelectedAccordionItem >= $(".ui-accordion-header").length)
	{
		g_currentlySelectedAccordionItem = 0;
	}
	
	g_currentlyShadedAccordionItem = g_currentlySelectedAccordionItem;
}

/*********************************
 *		AUXILIARY FUNCTIONS
 *********************************/

function UpdateFooter()
{
	$(".footer").css("top", $(window).scrollTop() + ($(window).innerHeight() * 0.95));
}

function UpdateNavigationHints()
{
	$(".navigationHints").css("top", $(window).scrollTop() + ($(window).innerHeight() * 0.15));
}

function UpdateMenuShading()
{
	if ($(".menu").length == 0)
	{
		return;
	}
	
	var isActive = g_currentMenuItem > -1;
	
	if (!isActive)
	{
		$(".menu > a").each(function()
		{
			var $self = $(this);
			$self.css("color", "#e0e0e0");
			$self.fadeTo(DEFAULT_FX_DELAY, 1);
		});
	}
	else 
	{
		$(".menu > a").each(function()
		{
			var $self = $(this);
			var menuItem = $(".menu").find("a").index($self);
			
			if (menuItem == g_currentMenuItem)
			{
				$self.css("color", "#e0e0e0");
				$self.fadeTo(DEFAULT_FX_DELAY, 1);
			}
			else
			{
				$self.css("color", "#c2c2c2");
				$self.fadeTo(DEFAULT_FX_DELAY, 0.333);
			}
		});
	}
}

function UpdateAccordionShading()
{
	if ($(".accordion").length == 0)
	{
		return;
	}
	
	var isActive = g_currentlyShadedAccordionItem > -1;
	
	if (!isActive)
	{
		$(".ui-accordion-header").each(function()
		{
			var $self = $(this);
			$self.css("color", "#e0e0e0");
			$self.fadeTo(DEFAULT_FX_DELAY, 1);
		});
	}
	else 
	{
		$(".ui-accordion-header").each(function()
		{
			var $self = $(this);
			var accordionItem = $(".accordion").find("h3").index($self);
			if (accordionItem == g_currentlyShadedAccordionItem)
			{
				$self.css("color", "#e0e0e0");
				$self.fadeTo(DEFAULT_FX_DELAY, 1);
			}
			else
			{
				$self.css("color", "#c2c2c2");
				$self.fadeTo(DEFAULT_FX_DELAY, 0.333);
			}
		});
	}
}

function SimulateClickOnCurrentlyShadedAccordionItem()
{
	if ($(".accordion").length == 0 || g_currentlySelectedAccordionItem > -1 || g_currentlyShadedAccordionItem == -1)
	{
		return;
	}
	
	SetCurrentlySelectedAccordionItem(g_currentlyShadedAccordionItem);
	$(".accordion").accordion("activate", GetCurrentlySelectedAccordionItem());
	UpdateAccordionShading();
}

function SimulateClickOnCurrentMenuItem()
{
	if ($(".menu").length == 0 || g_currentMenuItem == -1)
	{
		return;
	}

	var $menuItem = $($(".menu > a")[g_currentMenuItem]);
	$menuItem.trigger("click");
}

function HasMenu()
{
	return $(".menu").length > 0;
}

function HasAccordion()
{
	return $(".accordion").length > 0;
}

function GoHome()
{
	document.location = "index.html";
}

function ExpireCookies()
{
    if (window.confirm("Remove all cookies?"))
    {
        ExpireCookie("hideNavigationHints");
    }
}