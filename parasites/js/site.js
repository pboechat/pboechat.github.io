var APPLET_WIDTH = 1024;
var APPLET_HEIGHT = 768;
var APPLET_CLASS = "parasites.ParasitesWeb.class";

/***********************************
 *		GLOBAL EVENTS HANDLERS
 ***********************************/

$(document).ready(function() {
	if (BrowserDetect.OS == "Mac") {
		$(".applet").html("<p>There's an unsolved problem with Parasite's applet on MacOS.<br>Please, download the desktop version <a href=\"bin/Parasites-bin.zip\">here</a>.<br><br><a href=\"bin/Parasites-bin.zip\"><img src=\"../images/Download.png\" valign=\"middle\" alt=\"Download\" /></a></p>");
	} else {
		$(".applet").html("<applet id=\"applet\" width=\"" + APPLET_WIDTH + "\" height=\"" + APPLET_HEIGHT + "\" archive=\"bin/SoundSystem.jar,bin/LibraryJavaSound.jar,bin/CodecWav.jar,bin/CodecJOgg.jar,bin/Parasites.jar\" code=\"" + APPLET_CLASS + "\" align=\"middle\"></applet><br><a href=\"bin/Parasites-bin.zip\"><img src=\"../images/Download.png\" valign=\"middle\" alt=\"Download\" /> Desktop version</a>");
	}
});