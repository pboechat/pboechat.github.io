const DEFAULT_FX_DELAY = 100;

function SetCookie(name, value, expirationDate) {
	var content = escape(value) + ((expirationDate) ? "; expires=" + expirationDate.toUTCString() : "");
	document.cookie = name + "=" + content;
}

function GetCookie(name) {
	var x, y, cookies = document.cookie.split(";");
	for (var i = 0; i < cookies.length; i++) {
		x = cookies[i].substr(0, cookies[i].indexOf("="));
		y = cookies[i].substr(cookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == name) {
			return unescape(y);
		}
	}
}

function ExpireCookie(name) {
	SetCookie(name, "", new Date())
}

/***********************************
 *		GLOBAL EVENTS HANDLERS
 ***********************************/

// General functionality
$(document).ready(function () {
	$("body").nivoZoom();

	$(".menu").attr({ role: "menu", "aria-label": "Main menu" }).fadeTo(500, 1);
	$(".menu > a").attr({ role: "menuitem", tabindex: 0 });
	$(".accordion").attr({ role: "tablist", "aria-label": "Content list" }).fadeTo(500, 1);

	// Align the homepage central menu to start exactly where the top quick-nav starts
	function alignMenuToQuickNav() {
		var $menu = $(".menu");
		if (!$menu.length) return;
		var $qn = $(".quickNav");
		var left = 16; // fallback to header's horizontal padding
		if ($qn.length) {
			try { left = Math.max(16, Math.round($qn.offset().left)); } catch (e) { }
		}
		// Compute consistent top start below the sticky nav
		var navH = $(".navigationBar").outerHeight() || 0;
		var topGap = 16; // fixed breathing room below nav
		var top = Math.max(0, Math.round(navH + topGap));
		// lock left alignment and prevent centering
		$menu.css({ marginLeft: left + "px", marginRight: "auto", marginTop: top + "px" });
	}

	// Initial layout adjustments
	alignMenuToQuickNav();

	// Align accordion list to quick-nav left and optionally split into columns when tall
	function alignAccordionToQuickNav() {
		var $acc = $(".accordion"); if (!$acc.length) return;
		var $qn = $(".quickNav");
		var left = 16; if ($qn.length) { try { left = Math.max(16, Math.round($qn.offset().left)); } catch (e) { } }
		// Same consistent top start below the sticky nav
		var navH = $(".navigationBar").outerHeight() || 0;
		var topGap = 16;
		var top = Math.max(0, Math.round(navH + topGap));
		$acc.css({ marginLeft: left + "px", marginRight: "auto", marginTop: top + "px" });
	}
	alignAccordionToQuickNav();

	if (!GetCookie("hideNavigationHints")) {
		var navigationHintCounter = 1;
		$(".navigationHint").each(function () {
			var $self = $(this);
			setTimeout(function () {
				$self.fadeTo(500, 1);
				setTimeout(function () {
					$self.fadeTo(500, 0);
				}, 3000);
			}, (navigationHintCounter - 1) * 3000);
			navigationHintCounter++;
		});
		SetCookie("hideNavigationHints", true);
	}

	setTimeout(function () {
		var footer = $(".footer");
		footer.fadeTo(500, 0);
	}, 3000);

	// JS enabled class toggles CSS to hide inline contents
	$("body").addClass("js-enabled");

	// Build overlay and panel containers once
	const $overlay = $('<div class="detailOverlay" aria-hidden="true"></div>').appendTo('body');
	const $panel = $('<div class="detailPanel detail-side" role="dialog" aria-modal="true" aria-label="Details" tabindex="-1"></div>').appendTo('body');
	const $header = $('<div class="detailHeader"></div>').appendTo($panel);
	const $title = $('<div class="detailTitle"></div>').appendTo($header);
	const $close = $('<button type="button" class="detailClose" aria-label="Close">×</button>').appendTo($header);
	const $body = $('<div class="detailBody"></div>').appendTo($panel);

	function OpenPanelFor(index) {
		const $h3 = $($('.accordion').find('h3')[index]);
		if ($h3.length === 0) return;
		const $content = $h3.next('div');
		SetCurrentlySelectedAccordionItem(index);
		$('.accordion h3').removeClass('is-selected').attr({ 'aria-selected': 'false', role: 'tab' });
		$h3.addClass('is-selected').attr({ 'aria-selected': 'true', role: 'tab' });
		UpdateAccordionShading();

		// Move content into panel body temporarily
		$body.empty();
		// clone to keep original in DOM hidden (so anchors/images keep working without rebind)
		$title.text($h3.text());
		$content.children().clone(true, true).appendTo($body);

		$overlay.addClass('is-open').attr('aria-hidden', 'false');
		$panel.addClass('is-open').attr('aria-hidden', 'false').focus();
	}

	function ClosePanel() {
		$overlay.removeClass('is-open').attr('aria-hidden', 'true');
		$panel.removeClass('is-open').attr('aria-hidden', 'true');
		// Keep selection highlighted when closing the panel
		UpdateAccordionShading();
	}

	$overlay.on('click', ClosePanel);
	$close.on('click', ClosePanel);

	// Click on headers opens panel
	$('.accordion').on('click', 'h3', function (e) {
		e.preventDefault();
		const idx = $('.accordion').find('h3').index(this);
		OpenPanelFor(idx);
	});

	// Accordion item mouseover/mouseout
	$(".accordion h3").hover(function (event) {
		event.preventDefault();

		// Ignore hover if keyboard navigation is the current modality
		if (!g_hoverEnabled) { return; }

		// Avoid hover changing selection immediately after keyboard nav/scroll
		if (Date.now() - g_lastKeyNavAt < 350) {
			return;
		}

		if (GetCurrentlySelectedAccordionItem() > -1) {
			return;
		}

		SetCurrentlyShadedAccordionItem($(".accordion").find("h3").index($(this)));
		setTimeout(function () {
			UpdateAccordionShading();
		}, 150);
	});

	// Menu item click
	$(".menu > a").click(function (event) {
		event.preventDefault();

		var $self = $(this);
		$self.fadeTo(500, 0.2, function () {
			document.location = $self.attr("href");
		});
	});

	// Menu item mouseover/mouseout
	$(".menu > a").hover(function (event) {
		event.preventDefault();

		// Ignore hover if keyboard navigation is the current modality
		if (!g_hoverEnabled) { return; }

		// Avoid hover changing selection immediately after keyboard nav
		if (Date.now() - g_lastKeyNavAt < 350) {
			return;
		}

		SetCurrentMenuItem($(".menu").find("a").index($(this)));
		setTimeout(function () {
			UpdateMenuShading();
		}, 150);
	});
});

$(window).resize(function () {
	// Keep the homepage menu aligned to the quick-nav and columnized as needed
	(function () {
		var $menu = $(".menu");
		if ($menu.length) {
			// realign menu
			var $qn = $(".quickNav");
			var left = 16; if ($qn.length) { try { left = Math.max(16, Math.round($qn.offset().left)); } catch (e) { } }
			var navH = $(".navigationBar").outerHeight() || 0;
			var top = Math.max(0, Math.round(navH + 16));
			$menu.css({ marginLeft: left + "px", marginRight: "auto", marginTop: top + "px" });
			// no grid toggle
		}
		// Accordion alignment and columnization
		var $acc = $(".accordion");
		if ($acc.length) {
			var $qn2 = $(".quickNav");
			var left2 = 16; if ($qn2.length) { try { left2 = Math.max(16, Math.round($qn2.offset().left)); } catch (e) { } }
			var navH2 = $(".navigationBar").outerHeight() || 0;
			var top2 = Math.max(0, Math.round(navH2 + 16));
			$acc.css({ marginLeft: left2 + "px", marginRight: "auto", marginTop: top2 + "px" });
			// no grid toggle
		}
	})();
	UpdateFooter();
	UpdateNavigationHints();
});

$(window).scroll(function () {
	UpdateFooter();
	UpdateNavigationHints();
});

/******************************
 * 		INPUT PROCESSING
 ******************************/
$(document).keyup(function (event) {
	var keyCode = event.which;

	// Prevent default scrolling for handled keys on keyup as a safety net
	if (IsNavigationKey(keyCode) && !IsEditableTarget(event)) {
		event.preventDefault();
		g_lastKeyNavAt = Date.now();
		g_hoverEnabled = false; // keyboard takes precedence until mouse moves
	}

	if (keyCode == 17) {
		g_ctrlPressed = false;
		return;
	}
	else if (keyCode == 18) {
		g_altPressed = false;
		return;
	}

	if (keyCode == 38 || keyCode == 87) // Down arrow or 's'
	{
		if (HasAccordion()) {
			if (GetCurrentlySelectedAccordionItem() == -1) {
				ShadePreviousAccordionItem();
			}
			else {
				SelectPreviousAccordionItem();
			}
		}
		else if (HasMenu()) {
			MoveToPreviousMenuItem();
		}
	}
	else if (keyCode == 40 || keyCode == 83) // Up arrow or 'w'
	{
		if (HasAccordion()) {
			if (GetCurrentlySelectedAccordionItem() == -1) {
				ShadeNextAccordionItem();
			}
			else {
				SelectNextAccordionItem();
			}
		}
		else if (HasMenu()) {
			MoveToNextMenuItem();
		}
	}
	else if (keyCode == 37 || keyCode == 65 || keyCode == 8 || keyCode == 27) // Left arrow or 'a' or backspace or Esc
	{
		if (HasAccordion()) {
			const panelOpen = $('.detailPanel.is-open').length > 0;
			if (panelOpen) {
				// close panel
				$('.detailClose').trigger('click');
			}
			else if (GetCurrentlySelectedAccordionItem() == -1) {
				if (GetCurrentlyShadedAccordionItem() == -1) {
					GoHome();
				}
				else {
					SetCurrentlyShadedAccordionItem(-1);
				}
			}
			else {
				// Deselect completely on first left press (no re-highlighting)
				SetCurrentlySelectedAccordionItem(-1);
				SetCurrentlyShadedAccordionItem(-1);
				UpdateAccordionShading();
			}
		}
		else if (HasMenu()) {
			SetCurrentMenuItem(-1);
		}
		else {
			GoHome();
		}
	}
	else if (keyCode == 39 || keyCode == 68 || keyCode == 13 || keyCode == 32) // Right arrow or 'd' or RETURN or SPACE
	{
		if (HasAccordion()) {
			const panelOpen = $('.detailPanel.is-open').length > 0;

			// If the floating panel is open and Right Arrow was pressed, open the "project website" link
			if (panelOpen && keyCode === 39) {
				var $visitLink = $('.detailPanel.is-open .detailBody a').filter(function () {
					var t = $.trim($(this).text()).toLowerCase();
					return t.indexOf('project website') !== -1;
				}).first();

				if ($visitLink.length) {
					var href = $visitLink.attr('href');
					if (href) {
						window.open(href, '_blank', 'noopener');
					}
					return; // don't fall through
				}
				// If no link found, fall back to default behavior below
			}

			// Default behavior (open the selected item)
			if (GetCurrentlyShadedAccordionItem() == -1) {
				SetCurrentlyShadedAccordionItem(0);
			}
			else {
				$('.accordion h3').eq(GetCurrentlyShadedAccordionItem()).trigger('click');
			}
		}
		else {
			if (GetCurrentMenuItem() == -1) {
				SetCurrentMenuItem(0);
			}
			else if (HasMenu()) {
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

	if (HasAccordion()) {
		// With panel UI: keep the shaded (or selected) header in view as user navigates
		var idx = GetCurrentlySelectedAccordionItem();
		if (idx === -1) { idx = GetCurrentlyShadedAccordionItem(); }
		if (idx >= 0) {
			var $h3 = $($('.accordion').find('h3')[idx]);
			if ($h3.length) { EnsureAccordionItemInView($h3); }
		}
		UpdateAccordionShading();
	}
	else {
		UpdateMenuShading();
	}
});

$(document).keydown(function (event) {
	var keyCode = event.which;

	// Prevent default scrolling behavior for navigation keys
	if (IsNavigationKey(keyCode) && !IsEditableTarget(event)) {
		event.preventDefault();
		g_lastKeyNavAt = Date.now();
		g_hoverEnabled = false; // keyboard takes precedence until mouse moves
	}

	if (keyCode == 17) {
		g_ctrlPressed = true;
	}
	else if (keyCode == 18) {
		g_altPressed = true;
	}
});

/******************************************
 *		CURRENT MENU ITEM MANAGEMENT
 ******************************************/

var g_currentMenuItem = -1;

function SetCurrentMenuItem(currentMenuItem) {
	g_currentMenuItem = currentMenuItem;
}

function GetCurrentMenuItem() {
	return g_currentMenuItem;
}

function MoveToPreviousMenuItem() {
	if ($(".menu").length == 0) {
		return;
	}
	if (--g_currentMenuItem < 0) {
		g_currentMenuItem = $(".menu > a").length - 1;
	}
}

function MoveToNextMenuItem() {
	if ($(".menu").length == 0) {
		return;
	}
	if (++g_currentMenuItem >= $(".menu > a").length) {
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
var g_lastKeyNavAt = 0; // timestamp of last keyboard navigation
var g_hoverEnabled = true; // disable hover after keyboard nav until mouse moves

// Re-enable hover once the user moves the mouse
$(document).on('mousemove', function () { g_hoverEnabled = true; });

function SetCurrentlySelectedAccordionItem(currentlySelectedAccordionItem) {
	g_currentlySelectedAccordionItem = currentlySelectedAccordionItem;
	g_currentlyShadedAccordionItem = g_currentlySelectedAccordionItem;
}

function SetCurrentlyShadedAccordionItem(currentlyShadedAccordionItem) {
	g_currentlyShadedAccordionItem = currentlyShadedAccordionItem;
}

function GetCurrentlySelectedAccordionItem() {
	return g_currentlySelectedAccordionItem;
}

function GetCurrentlyShadedAccordionItem() {
	return g_currentlyShadedAccordionItem;
}

function ShadePreviousAccordionItem() {
	if ($(".accordion").length == 0 || g_currentlySelectedAccordionItem > -1) {
		return;
	}

	if (--g_currentlyShadedAccordionItem < 0) {
		g_currentlyShadedAccordionItem = $(".accordion").find("h3").length - 1;
	}
}

function SelectPreviousAccordionItem() {
	if ($(".accordion").length == 0) {
		return;
	}

	if (--g_currentlySelectedAccordionItem < 0) {
		g_currentlySelectedAccordionItem = $(".accordion").find("h3").length - 1;
	}

	g_currentlyShadedAccordionItem = g_currentlySelectedAccordionItem;
}

function ShadeNextAccordionItem() {
	if ($(".accordion").length == 0 || g_currentlySelectedAccordionItem > -1) {
		return;
	}

	if (++g_currentlyShadedAccordionItem >= $(".accordion").find("h3").length) {
		g_currentlyShadedAccordionItem = 0;
	}
}

function SelectNextAccordionItem() {
	if ($(".accordion").length == 0) {
		return;
	}

	if (++g_currentlySelectedAccordionItem >= $(".accordion").find("h3").length) {
		g_currentlySelectedAccordionItem = 0;
	}

	g_currentlyShadedAccordionItem = g_currentlySelectedAccordionItem;
}

/*********************************
 *		AUXILIARY FUNCTIONS
 *********************************/

function UpdateFooter() {
	// footer is fixed in CSS; keep function for legacy calls
}

function UpdateNavigationHints() {
	// hints are fixed in CSS; noop to preserve calls
}

// Ensure the given header is visible in the viewport (with some breathing room)
function EnsureAccordionItemInView($el) {
	try {
		var navH = $(".navigationBar").outerHeight() || 0;
		var margin = 80;
		var elTop = $el.offset().top;
		var elBottom = elTop + $el.outerHeight(true);
		var viewTop = $(window).scrollTop();
		var viewBottom = viewTop + $(window).height();

		// If below viewport, scroll so its bottom is within viewport with margin
		if (elBottom > viewBottom - margin) {
			$(window).scrollTop(elBottom - $(window).height() + margin);
		}
		// If above top (considering sticky nav), scroll up so its top is just below nav with margin
		else if (elTop < viewTop + navH + margin) {
			$(window).scrollTop(Math.max(0, elTop - navH - margin));
		}
	} catch (e) { /* no-op */ }
}

function UpdateMenuShading() {
	if ($(".menu").length == 0) {
		return;
	}

	var isActive = g_currentMenuItem > -1;

	if (!isActive) {
		$(".menu > a").each(function () {
			var $self = $(this);
			$self.removeClass('is-active is-dimmed');
			$self.fadeTo(DEFAULT_FX_DELAY, 1).attr('aria-current', null);
		});
	}
	else {
		$(".menu > a").each(function () {
			var $self = $(this);
			var menuItem = $(".menu").find("a").index($self);

			if (menuItem == g_currentMenuItem) {
				$self.removeClass('is-dimmed').addClass('is-active');
				$self.fadeTo(DEFAULT_FX_DELAY, 1).attr('aria-current', 'page');
			}
			else {
				$self.removeClass('is-active').addClass('is-dimmed');
				$self.fadeTo(DEFAULT_FX_DELAY, 0.333).attr('aria-current', null);
			}
		});
	}
}

function UpdateAccordionShading() {
	if ($(".accordion").length == 0) {
		return;
	}

	var isActive = g_currentlyShadedAccordionItem > -1;

	if (!isActive) {
		$(".accordion h3").each(function () {
			var $self = $(this);
			$self.removeClass('is-dimmed is-selected');
			$self.fadeTo(DEFAULT_FX_DELAY, 1).attr({ 'aria-selected': 'false', role: 'tab' });
		});
	}
	else {
		$(".accordion h3").each(function () {
			var $self = $(this);
			var accordionItem = $(".accordion").find("h3").index($self);
			if (accordionItem == g_currentlyShadedAccordionItem) {
				$self.removeClass('is-dimmed').addClass('is-selected');
				$self.fadeTo(DEFAULT_FX_DELAY, 1).attr({ 'aria-selected': 'true', role: 'tab' });
			}
			else {
				$self.removeClass('is-selected').addClass('is-dimmed');
				$self.fadeTo(DEFAULT_FX_DELAY, 0.333).attr({ 'aria-selected': 'false', role: 'tab' });
			}
		});
	}
}

function SimulateClickOnCurrentlyShadedAccordionItem() {
	if ($(".accordion").length == 0 || g_currentlyShadedAccordionItem == -1) {
		return;
	}
	$(".accordion h3").eq(g_currentlyShadedAccordionItem).trigger('click');
}

function SimulateClickOnCurrentMenuItem() {
	if ($(".menu").length == 0 || g_currentMenuItem == -1) {
		return;
	}

	var $menuItem = $($(".menu > a")[g_currentMenuItem]);
	$menuItem.trigger("click");
}

function HasMenu() {
	return $(".menu").length > 0;
}

function HasAccordion() {
	return $(".accordion").length > 0;
}

function GoHome() {
	document.location = "index.html";
}

function ExpireCookies() {
	if (window.confirm("Remove all cookies?")) {
		ExpireCookie("hideNavigationHints");
	}
}

// Helpers
function IsNavigationKey(keyCode) {
	// up, down, left, right, w, s, a, d, enter, space, backspace
	return keyCode === 38 || keyCode === 40 || keyCode === 37 || keyCode === 39 ||
		keyCode === 87 || keyCode === 83 || keyCode === 65 || keyCode === 68 ||
		keyCode === 13 || keyCode === 32 || keyCode === 8;
}

function IsEditableTarget(event) {
	var t = event && event.target;
	if (!t) return false;
	var tag = (t.tagName || '').toUpperCase();
	return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable === true;
}

$(function () {
	// Open "project website" on ArrowRight when a project pane is open
	$(document).on('keydown', function (e) {
		var isRight = (e.key === 'ArrowRight') || (e.which === 39);
		if (!isRight) return;

		// Ignore if focused inside interactive controls
		if ($(e.target).closest('a, button, input, textarea, select').length) return;

		// Detect an open accordion panel (the "floating window" state)
		var $openPanel = $('.accordion .ui-accordion-content:visible');
		if ($openPanel.length === 0) return;

		// Find the "project website" link inside the open panel
		var $visitLink = $openPanel.find('a').filter(function () {
			var t = $.trim($(this).text()).toLowerCase();
			return t.indexOf('project website') !== -1;
		}).first();

		if ($visitLink.length) {
			e.preventDefault();
			var href = $visitLink.attr('href');
			if (href) {
				window.open(href, '_blank', 'noopener');
			}
		}
	});
});

/* (1) THEME TOGGLE SCRIPT ============================== */
(function () {
	const root = document.documentElement;
	const KEY = 'theme'; // 'light' | 'dark'

	// Apply stored preference or fall back to system
	const stored = localStorage.getItem(KEY);
	if (stored === 'light' || stored === 'dark') {
		root.dataset.theme = stored;
	} else {
		root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	// Keep in sync with system (unless user picked a theme)
	const mq = window.matchMedia('(prefers-color-scheme: dark)');
	mq.addEventListener('change', (e) => {
		if (!localStorage.getItem(KEY)) {
			root.dataset.theme = e.matches ? 'dark' : 'light';
			updateButton();
		}
	});

	// Toggle button
	const btn = document.getElementById('themeToggle');
	function updateButton() {
		const isDark = root.dataset.theme === 'dark';
		btn.setAttribute('aria-pressed', String(isDark));
		btn.textContent = isDark ? '☀️' : '🌙';
		btn.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
	}
	if (btn) {
		updateButton();
		btn.addEventListener('click', () => {
			root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
			localStorage.setItem(KEY, root.dataset.theme);
			updateButton();
		});
	}
})();
/* ==================================================== */